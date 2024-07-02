import AWS from 'aws-sdk';
import { RESTDataSource } from "@apollo/datasource-rest";
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import { logger, formatLogMessage } from '../logger';
import { DmspModel as Dmsp } from "../models/Dmsp"
import { JWTToken } from '../services/tokenService';

// JS SDK v3 does not support global configuration.
// Codemod has attempted to pass values to each service client in this file.
// You may need to update clients outside of this file, if they use global config.
AWS.config.update({
  region: process.env.AWS_REGION,
  // accessKeyId: 'your-access-key-id',
  // secretAccessKey: 'your-secret-access-key',
});

export class DMPHubAPI extends RESTDataSource {
  override baseURL = process.env.DMPHUB_API_BASE_URL;

  private token: JWTToken;

  constructor(options: { cache: KeyValueCache, token: JWTToken }) {
    super(options);

    this.token = options.token;
  }

  // Remove the protocol from the DMSP ID and encode it but preserve the `/` characters
  dmspIdWithoutProtocol(dmspId) {
    return dmspId.toString().replace(/^(https?:\/\/|https?%3A%2F%2F)/i, '').replace(/%2F/g, '/');
  }


  // TODO: Pass the sessionId along to the API so it can be added to the API logs
  // Search for DMSPs
  getDMSPs() {
    return this.get<Dmsp[]>("dmps");
  }

  // TODO: Use the Fetcher to set the API auth token
  //   See: https://www.apollographql.com/docs/apollo-server/data/fetching-rest#intercepting-fetches

  // Standard response handler
  handleResponse(response, resultAsArray = false) {
    const success = response?.status >= 200 && response.status <= 300;
    const errors = response?.errors || [];
    const dmsps = response?.items?.map((dmsp) => dmsp['dmp']) || [];

    const ret = {
      code: response?.status,
      success: success,
      message: success ? 'Ok' : errors.join(', ')
    };
    if (resultAsArray) {
      ret['dmsps'] = dmsps
    } else {
      ret['dmsp'] = dmsps[0];
    }
    return ret;
  }

  // Fetch a specific DMSP by its DMP ID
  async getDMSP(dmspID: string) {
    formatLogMessage(logger).info(`Calling DMPHub: ${this.baseURL}`)
    try {
      const id = this.dmspIdWithoutProtocol(dmspID);
      const response = await this.get<Dmsp>(`dmps/${encodeURI(id)}`);
      return this.handleResponse(response);
    } catch(err) {
      formatLogMessage(logger, { err }).error('Error calling DMPHub API getDMSP.')
      throw(err);
    }
  }
}
