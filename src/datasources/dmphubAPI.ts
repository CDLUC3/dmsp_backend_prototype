import { Buffer } from "buffer";
import { AugmentedRequest, RESTDataSource } from "@apollo/datasource-rest";
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import { formatLogMessage, logger } from '../logger';
import { DMPHubConfig } from '../config/dmpHubConfig';
import { JWTAccessToken } from '../services/tokenService';
import { MyContext } from "../context";
import { GraphQLError } from "graphql";
import { DMPCommonStandard, DMPCommonStandardContact, DMPCommonStandardContributor, DMPCommonStandardProject } from "../types/DMP";
import { isNullOrUndefined } from "../utils/helpers";

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
      const response = await this.post(path, { body: JSON.stringify({ dmp }) });
      if (response?.status === 201 && Array.isArray(response?.items) && response?.items?.length > 0) {
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

      const response = await this.put(path, { body: JSON.stringify({ dmp }) });
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

      const response = await this.delete(path);
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
  async validateDMP(context: MyContext, dmp: DMPCommonStandard, reference = 'dmphubAPI.validate'): Promise<string[]> {
    try {
      // If we don't have a cached version, call the API
      const path = `dmps/validate`;
      formatLogMessage(context).debug(`${reference} Calling DMPHub: ${this.baseURL}/${path}`)

      const response = await this.post(path, { body: JSON.stringify({ dmp: dmp }) });
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

  /**
   * Retrieves award information from the specified funder API.
   *
   * @param context - The Apollo Server Context object passed in to the Resolver on each request.
   * @param apiTarget - The funder API endpoint to query. Valid values include:
   *                    - 'awards/nih' for NIH awards,
   *                    - 'awards/nsf' for NSF awards,
   *                    - 'awards/crossref/{funderDOI}' for Crossref Metadata (requires a funder DOI, e.g. '10.00000/000000000000').
   * @param awardId - (Optional) The award ID (e.g., "P30 GM123456"). If null, it will not be sent to the API.
   * @param awardName - (Optional) The name of the award (e.g., "My Project"). If null, it will not be sent to the API.
   * @param awardYear - (Optional) The year of the award (e.g., "1961"). If null, it will not be sent to the API.
   * @param piNames - (Optional) Names of the principal investigators (e.g. "Carl Sagan"). If null, they will not be included in the API request.
   * @param reference - A reference string used for logging.
   */
  async getAwards(
    context: MyContext,
    apiTarget: string,
    awardId: string | null = null,
    awardName: string | null = null,
    awardYear: string | null = null,
    piNames: string[] | null = null,
    reference = 'dmphubAPI.getAwards'
  ): Promise<DMPHubAward[]> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if(!isNullOrUndefined(awardId)) {
        params.set("project", awardId);
      }
      if(!isNullOrUndefined(piNames) && piNames.length) {
        params.set("pi_names", piNames.join(","));
      }
      if(!isNullOrUndefined(awardName) && awardName.length) {
        params.set("keywords", awardName);
      }
      if(!isNullOrUndefined(awardYear)) {
        params.set("years", awardYear);
      }

      // Create path
      let path = apiTarget;
      const queryString = params.toString();
      if(queryString){
        path += `?${queryString}`;
      }

      const fullUrl = `${this.baseURL}/${path}`;
      formatLogMessage(context).debug(`${reference} Calling DMPHub getAwards: ${fullUrl}`)
      const response = await this.get(path);
      if (response?.status === 200 && Array.isArray(response?.items)) {
        formatLogMessage(context).debug(response.items, `${reference} Results from DMPHub getAwards: ${fullUrl}`);
        return response.items as DMPHubAward[];
      }

      formatLogMessage(context).error(
        {  code: response?.status, errs: response?.errors },
        `${reference} Error retrieving Awards from DMPHub API`
      );
      return null;
    } catch(err) {
      formatLogMessage(context).error({ err }, `${reference} Error calling DMPHub API getAwards.`);
      throw(err);
    }
  }
}

// Types returned by DMPHubAPI awards endpoint
// -----------------------------------------------------------------------------------------------
export interface DMPHubAward {
  project: DMPCommonStandardProject
  contact: DMPCommonStandardContact
  contributor: [DMPCommonStandardContributor]
}
