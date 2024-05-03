import AWS from 'aws-sdk';
import { RESTDataSource, AugmentedRequest } from "@apollo/datasource-rest";
// import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import { DmspModel as Dmsp } from "../models/Dmsp"

// JS SDK v3 does not support global configuration.
// Codemod has attempted to pass values to each service client in this file.
// You may need to update clients outside of this file, if they use global config.
AWS.config.update({
  region: process.env.AWS_REGION,
  // accessKeyId: 'your-access-key-id',
  // secretAccessKey: 'your-secret-access-key',
});
const aws = AWS;

export class DMPHubAPI extends RESTDataSource {
  override baseURL = process.env.DMPHUB_API_BASE_URL;

  private token: string;

  constructor(options) {
    super(options);
  }
  // constructor(options: { token: string; cache: KeyValueCache }) {
  //  // this sends our server's `cache` through
  //  super(options);

  //  // TODO: We can override the default cache and logger here.
  //  // See: https://github.com/apollographql/datasource-rest
  // }

  // Remove the protocol from the DMSP ID
  dmspIdWithoutProtocol(dmspId) {
    return dmspId.toString().replace(/^(https?:\/\/|https?%3A%2F%2F)/i, '');
  }

  // Search for DMSPs
  getDMSPs() {
    return this.get<Dmsp[]>("dmps");
  }

  // Standard response handler
  handleResponse(response, resultAsArray = false) {
    const success = response?.status >= 200 && response.status <= 300;
    const errors = response?.errors || [];
    const dmsps = response?.items?.map((dmsp) => dmsp['dmp']) || [];

    let ret = {
      code: response?.status,
      success: success,
      message: success ? 'Ok' : errors.join(', ')
    };
    if (resultAsArray) {
      ret['dmsps'] = dmsps
    } else {
      ret['dmsp'] = dmsps[0];
    }
    // console.log(ret);
    return ret;
  }

  // Fetch a specific DMSP by its DMP ID
  async getDMSP(dmspID: string) {
    console.log(`Calling DMPHub: ${this.baseURL}`);
    try {
      const id = this.dmspIdWithoutProtocol(dmspID);
      const response = await this.get<Dmsp>(`dmps/${id}`);
      return this.handleResponse(response);
    } catch(error) {
      console.log(error);
      throw(error);
    }
  }
}
