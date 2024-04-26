import { RESTDataSource, AugmentedRequest } from "@apollo/datasource-rest";
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import { DmspModel as Dmsp } from "../models/Dmsp"

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
