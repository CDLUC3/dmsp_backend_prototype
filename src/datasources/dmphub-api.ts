import AWS from 'aws-sdk';
import { RESTDataSource, AugmentedRequest } from "@apollo/datasource-rest";
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
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

  constructor(options: { token: string; cache: KeyValueCache }) {
    super(options); // this sends our server's `cache` through
    this.token = options.token;
  }

  override willSendRequest(path: string, request: AugmentedRequest) {
    request.headers.authorization = this.token;
  }

  /**
   * TODO: Tie this into OpenSearch
   */
  getDMSPs() {
    return this.get<Dmsp[]>("dmps");
  }

  getDMSP(dmspID: string) {
    return this.get<Dmsp>(`dmps/${encodeURIComponent(dmspID)}`);
  }
}
