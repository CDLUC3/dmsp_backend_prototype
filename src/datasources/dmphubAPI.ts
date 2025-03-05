import { Buffer } from "buffer";
import { AugmentedRequest, RESTDataSource } from "@apollo/datasource-rest";
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import { formatLogMessage, logger } from '../logger';
import { DMPHubConfig } from '../config/dmpHubConfig';
import { JWTAccessToken } from '../services/tokenService';
import { MyContext } from "../context";
import { GraphQLError } from "graphql";
import { DMPCommonStandard } from "../services/commonStandardService";

// Singleton class that retrieves an Auth token from the API
export class Authorizer extends RESTDataSource {
  static #instance: Authorizer;

  override baseURL = DMPHubConfig.dmpHubAuthURL;

  public env: string;
  public oauth2Token: string;

  private creds: string;
  private expiry: Date;

  constructor() {
    super();

    this.env = this.baseURL.includes('uc3prd') ? 'prd' : (this.baseURL.includes('uc3stg') ? 'stg' : 'dev');
    // Base64 encode the credentials for the auth request
    const hdr = `${DMPHubConfig.dmpHubClientId}:${DMPHubConfig.dmpHubClientSecret}`;
    this.creds = Buffer.from(hdr, 'binary').toString('base64');

    this.authenticate();
  }

  // Singleton function to ensure we aren't reauthenticating every time
  public static get instance(): Authorizer {
    if (!Authorizer.#instance) {
      Authorizer.#instance = new Authorizer();
    }

    return Authorizer.#instance;
  }

  // Call the authenticate method and set this class' expiry timestamp
  async authenticate() {
    const response = await this.post(`/oauth2/token`);

    logger.info(`Authenticating with DMPHub`);
    this.oauth2Token = response.access_token;
    const currentDate = new Date();
    this.expiry = new Date(currentDate.getTime() + 600 * 1000);
  }

  // Check if the current token has expired
  hasExpired() {
    const currentDate = new Date();
    return currentDate >= this.expiry;
  }

  // Attach all of the necessary HTTP headers and the body prior to calling the token endpoint
  override willSendRequest(_path: string, request: AugmentedRequest) {
    request.headers['authorization'] =`Basic ${this.creds}`;
    request.headers['content-type'] = 'application/x-www-form-urlencoded';
    request.body = `grant_type=client_credentials&scope=${this.baseURL}/${this.env}.read ${this.baseURL}/${this.env}.write`;
  }
}

// DataSource that interacts with the DMPHub API. This file is similar to the DdmphubAPI.ts. It has
// been separated out because these endpoints will eventually be replaced with queries to
// OpenSearch once that has been deployed.
export class DMPHubAPI extends RESTDataSource {
  override baseURL = DMPHubConfig.dmpHubURL;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private cache: KeyValueCache;
  private token: JWTAccessToken;
  private authorizer: Authorizer;

  constructor(options: { cache: KeyValueCache, token: JWTAccessToken }) {
    super(options);

    this.token = options.token;
    this.cache = options.cache;
    this.authorizer = Authorizer.instance;
  }

  // Add the Authorization token to the headers prior to the request
  override willSendRequest(_path: string, request: AugmentedRequest) {
    // Check the current token's expiry. If it has expired re-authenticate
    if (this.authorizer.hasExpired) {
      this.authorizer.authenticate();
    }
    request.headers['authorization'] = `Bearer ${this.authorizer.oauth2Token}`;
  };

  // Remove the protocol from the DMSP ID and encode it but preserve the `/` characters
  removeProtocol(id) {
    return id.toString().replace(/^(https?:\/\/|https?%3A%2F%2F)/i, '').replace(/%2F/g, '/');
  }

  // Fetch a single DMP from the DMPHub API
  async getDMP(
    context: MyContext,
    dmp_id: string,
    version = 'LATEST',
    reference = 'dmphubAPI.getDMP'
  ): Promise<DMPCommonStandard | null> {
    try {
      // If we don't have a cached version, call the API
      const sanitizedDOI = encodeURI(this.removeProtocol(dmp_id));
      const sanitizedVersion = `?version=${encodeURI(version)}`;
      const path = `dmps/${sanitizedDOI}${sanitizedVersion}`;

      formatLogMessage(context).debug(`${reference} Calling DMPHub Get: ${this.baseURL}/${path}`)
      const response = await this.get(path);

      if (response?.status === 200 && Array.isArray(response?.items) && response?.items?.length > 0) {
        return response.items[0]?.dmp as DMPCommonStandard;
      }

      formatLogMessage(context).error(
        { dmp_id, code: response?.status, errs: response?.errors },
        'Error retrieving DMP from DMPHub API'
      );
      return null;
    } catch(err) {
      formatLogMessage(context).error({ dmp_id, err }, 'Error calling DMPHub API getDMP.');
      throw(err);
    }
  }

  // Create a new DMP in the DMPHub (will assign a DMP ID for us)
  async createDMP(
    context: MyContext,
    dmp: DMPCommonStandard,
    reference = 'dmphubAPI.createDMP'
  ): Promise<DMPCommonStandard> {
    try {
      const path = `dmps`;
      formatLogMessage(context).debug(`${reference} Calling DMPHub Create: ${this.baseURL}/${path}`)

      const response = await this.post(path, { body: JSON.stringify(dmp) });
      if (response?.status === 200 && Array.isArray(response?.items) && response?.items?.length > 0) {
        return response.items[0]?.dmp as DMPCommonStandard;
      }
      return null;
    } catch(err) {
      formatLogMessage(context).error({ dmp, err }, 'Error calling DMPHub API createDMP.');
      throw(err);
    }
  }

  // Update an existing DMP in the DMPHub
  async updateDMP(
    context: MyContext,
    dmp: DMPCommonStandard,
    reference = 'dmphubAPI.updateDMP'
  ): Promise<DMPCommonStandard> {
    try {
      const path = `dmps/${encodeURI(this.removeProtocol(dmp.dmp_id.identifier))}`;
      formatLogMessage(context).debug(`${reference} Calling DMPHub Update: ${this.baseURL}/${path}`)

      const response = await this.put(path, { body: JSON.stringify(dmp) });
      if (response?.status === 200 && Array.isArray(response?.items) && response?.items?.length > 0) {
        return response.items[0]?.dmp as DMPCommonStandard;
      }
      return null;
    } catch(err) {
      formatLogMessage(context).error({ dmp, err }, 'Error calling DMPHub API updateDMP.');
      throw(err);
    }
  }

  // Tombstone an existing DMP in the DMPHub
  async tombstoneDMP(
    context: MyContext,
    dmp: DMPCommonStandard,
    reference = 'dmphubAPI.tombstoneDMP'
  ): Promise<DMPCommonStandard> {
    try {
      const path = `dmps/${encodeURI(this.removeProtocol(dmp.dmp_id.identifier))}`;
      formatLogMessage(context).debug(`${reference} Calling DMPHub Tombstone: ${this.baseURL}/${path}`)

      const response = await this.delete(path, { body: JSON.stringify(dmp) });
      if (response?.status === 200 && Array.isArray(response?.items) && response?.items?.length > 0) {
        return response.items[0]?.dmp as DMPCommonStandard;
      }
      return null;
    } catch(err) {
      formatLogMessage(context).error({ dmp, err }, 'Error calling DMPHub API tombstoneDMP.');
      throw(err);
    }
  }

  // Validate the DMP JSON content against the RDA DMP Common Metadata Standard
  async validate(context: MyContext, dmp: DMPCommonStandard, reference = 'dmphubAPI.validate'): Promise<string[]> {
    try {
      // If we don't have a cached version, call the API
      const path = `dmps/validate`;
      formatLogMessage(context).debug(`${reference} Calling DMPHub: ${this.baseURL}/${path}`)

      const response = await this.post(path, { body: JSON.stringify(dmp) });
      if (response?.status === 400 && Array.isArray(response?.errors) && response?.errors?.length > 0) {
        return response.errors;
      }
      return [];
    } catch(err) {
      if (err instanceof GraphQLError) {
        try {
          // Try to parse out the errors and add them to the DMP
          const body = err.extensions['response']['body'];
          if (body['status'] === 400 && Array.isArray(body['errors']) && body['errors'].length > 0) {
            return body.errors;
          }
        }
        catch (e) {
          return ['The resulting JSON from the DMP is not valid'];
        }
      }

      formatLogMessage(context).error({ dmp, err }, 'Error calling DMPHub API validate.');
      throw(err);
    }
  }
}
