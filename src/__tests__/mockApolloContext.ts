import { RESTDataSource } from "@apollo/datasource-rest";

// Mock the DMPHubAPI data source
export class MockDMPHubAPI extends RESTDataSource {
  getData = jest.fn();
  getDMSPs = jest.fn();
  handleResponse = jest.fn();
  getDMSP = jest.fn();
  baseURL = '';

  // Mocking the private properties
  token = jest.fn();
  dmspIdWithoutProtocol = jest.fn();
}

export class mockDMPToolAPI extends RESTDataSource {
  getAffiliation = jest.fn();
  getAffiliations = jest.fn();
  handleResponse = jest.fn();
  baseURL = '';

  // Mocking the private properties
  token = jest.fn();
  removeProtocol = jest.fn();
}
