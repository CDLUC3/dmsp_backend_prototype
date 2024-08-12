import { Buffer } from "buffer";
import { AugmentedRequest, RESTDataSource } from "@apollo/datasource-rest";
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import { logger, formatLogMessage } from '../logger';
import { AffiliationModel, AffiliationSearchModel } from "../models/Affiliation"
import { JWTToken } from '../services/tokenService';

// Singleton class that retrieves an Auth token from the API
class Authorizer extends RESTDataSource {
  static #instance: Authorizer;

  override baseURL = process.env.DMPHUB_AUTH_URL;

  public env: string;
  public oauth2Token: string;

  private creds: string;
  private expiry: Date;

  constructor() {
    super();

    this.env = this.baseURL.includes('uc3prd') ? 'dev' : (this.baseURL.includes('uc3stg') ? 'stg' : 'dev');
    // Base64 encode the credentials for the auth request
    const hdr = `${process.env.DMPHUB_API_CLIENT_ID}:${process.env.DMPHUB_API_CLIENT_SECRET}`;
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
    formatLogMessage(logger).info(`Authenticating with DMPHub`);
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
export class DMPToolAPI extends RESTDataSource {
  override baseURL = process.env.DMPHUB_API_BASE_URL;

  private token: JWTToken;
  private authorizer: Authorizer;

  constructor(options: { cache: KeyValueCache, token: JWTToken }) {
    super(options);

    this.token = options.token;

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

  // Retrieve a single affiliation record
  async getAffiliation(affiliationId: string) {
    try {
      const id = this.removeProtocol(affiliationId);
      formatLogMessage(logger).info(`Calling DMPHub: ${this.baseURL}/affiliations/${id}`)

      const response = await this.get(`affiliations/${encodeURI(id)}`);
      if (response) {
        const affiliation = new AffiliationModel(response);


console.log(`******************************** ${affiliationId}`)
console.log(affiliation);

        return affiliation ? affiliation : null;
      }
      return null;
    } catch(err) {
      formatLogMessage(logger, { err }).error('Error calling DMPHub API getAffiliation.')
      throw(err);
    }
  }

  // Perform a search for affiliation records
  async getAffiliations({ name, funderOnly = false }: { name: string, funderOnly?: boolean } ) {
    try {
      const sanitizedName = encodeURI(name);
      const funderBool = funderOnly ? (funderOnly === true) : false;
      const queryString = `search=${sanitizedName}&funderOnly=${funderBool}`;
      formatLogMessage(logger).info(`Calling DMPHub: ${this.baseURL}/affiliations?${queryString}`)

      const response = await this.get(`affiliations?${queryString}`);
      if (response) {
        const affiliations = response.map((rec) => new AffiliationSearchModel(rec)) || [];
        return affiliations ? affiliations : [];
      }
      return null;
    } catch(err) {
      formatLogMessage(logger, { err }).error('Error calling DMPHub API getAffiliation.')
      throw(err);
    }
  }
}
