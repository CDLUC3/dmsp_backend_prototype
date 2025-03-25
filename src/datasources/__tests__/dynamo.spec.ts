import { dynamo } from "../dynamo";
import { QueryCommandOutput, PutItemCommandOutput } from "@aws-sdk/client-dynamodb";
import { awsConfig } from "../../config/awsConfig";
import { DMPCommonStandard, DMPIdentifierType, DMPPrivacy, DMPStatus, DMPYesNoUnknown } from "../../types/DMP";
import { marshall } from "@aws-sdk/util-dynamodb";

jest.mock("@aws-sdk/client-dynamodb", () => {
  return {
    __esModule: true,
    DynamoDBClient: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockResolvedValue({}),
    })),
    QueryCommand: jest.fn(),
    ScanCommand: jest.fn(),
    PutItemCommand: jest.fn(),
    DeleteItemCommand: jest.fn(),
  };
});

describe('dynamo', () => {
  let minimalDMP: DMPCommonStandard;

  beforeEach(() => {
    minimalDMP = {
      title: 'testTitle',
      description: 'testDescription',
      created: '2025-03-20T07:51:43.000Z',
      modified: '2025-03-20T07:51:43.000Z',
      language: 'eng',
      ethical_issues_exist: DMPYesNoUnknown.UNKNOWN,
      dmphub_provenance_id: 'testProvenanceId',
      dmproadmap_featured: '0',
      dmproadmap_privacy: DMPPrivacy.PUBLIC,
      dmproadmap_status: DMPStatus.DRAFT,
      dmp_id: { identifier: 'testDmpId', type: DMPIdentifierType.OTHER },
      contact: {
        name: 'testContactName',
        mbox: 'testContactEmail',
        contact_id: { identifier: 'testContactId', type: DMPIdentifierType.OTHER }
      },
      project: [{
        title: 'testProjectTitle',
      }],
      dataset: [{
        title: 'testDatasetTitle',
        type: 'dataset',
        personal_data: DMPYesNoUnknown.UNKNOWN,
        sensitive_data: DMPYesNoUnknown.NO,
        dataset_id: { identifier: 'testDatasetId', type: DMPIdentifierType.OTHER }
      }],
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDMP', () => {
    it('should call queryTable with correct parameters', async () => {
      const dmpId = 'testDmpId';
      const version = 'testVersion';
      const mockResponse = ({ $metadata: {}, Items: [] }) as QueryCommandOutput;
      const queryTableSpy = jest.spyOn(dynamo, 'queryTable').mockResolvedValue(mockResponse);

      await dynamo.getDMP(dmpId, version);

      expect(queryTableSpy).toHaveBeenCalledWith(awsConfig.dynamoTableName, {
        KeyConditionExpression: "PK = :pk and SK = :sk",
        ExpressionAttributeValues: {
          ":pk": { S: dynamo.dmpIdToPK(dmpId) },
          ":sk": { S: dynamo.versionToSK(version) }
        },
      });
    });
  });

  describe('createDMP', () => {
    it('should call queryTable with correct parameters', async () => {
      const mockResponse = ({ $metadata: {}, Items: [] }) as PutItemCommandOutput;
      const queryTableSpy = jest.spyOn(dynamo, 'putItem').mockResolvedValue(mockResponse);

      await dynamo.createDMP(minimalDMP.dmp_id.identifier, minimalDMP);

      expect(queryTableSpy).toHaveBeenCalledWith(awsConfig.dynamoTableName, marshall(minimalDMP));
    });
  });

  describe('updateDMP', () => {
    it('should call queryTable with correct parameters', async () => {
      const mockResponse = ({ $metadata: {}, Items: [] }) as PutItemCommandOutput;
      const queryTableSpy = jest.spyOn(dynamo, 'putItem').mockResolvedValue(mockResponse);

      await dynamo.updateDMP(minimalDMP);

      expect(queryTableSpy).toHaveBeenCalledWith(awsConfig.dynamoTableName, marshall(minimalDMP));
    });
  });

  describe('tombstoneDMP', () => {
    it('should call queryTable with correct parameters', async () => {
      const mockResponse = ({ $metadata: {}, Items: [] }) as PutItemCommandOutput;
      const queryTableSpy = jest.spyOn(dynamo, 'putItem').mockResolvedValue(mockResponse);
      const queryTableSpy2 = jest.spyOn(dynamo, 'getDMP').mockResolvedValue([minimalDMP]);

      await dynamo.tombstoneDMP(minimalDMP.dmp_id.identifier);

      expect(queryTableSpy2).toHaveBeenCalledWith(minimalDMP.dmp_id.identifier, 'latest');
      expect(queryTableSpy).toHaveBeenCalledWith(awsConfig.dynamoTableName, marshall(minimalDMP));
    });
  });

  describe('deleteDMP', () => {
    it('should call deleteItem with correct parameters', async () => {
      const deleteItemSpy = jest.spyOn(dynamo, 'deleteItem').mockResolvedValue();

      await dynamo.deleteDMP(minimalDMP.dmp_id.identifier);

      expect(deleteItemSpy).toHaveBeenCalledWith(awsConfig.dynamoTableName, {
        PK: { S: dynamo.dmpIdToPK(minimalDMP.dmp_id.identifier) },
        SK: { S: dynamo.versionToSK(null) }
      });
    });
  });

  describe('dmpIdToPK', () => {
    it('should return the correct PK', () => {
      const dmpId = 'testDmpId';
      expect(dynamo.dmpIdToPK(dmpId)).toEqual(`DMP#${dmpId}`);
    });

    it('should remove the protocol from the dmpId', () => {
      const dmpId = 'https://testDmpId';
      expect(dynamo.dmpIdToPK(dmpId)).toEqual(`DMP#testDmpId`);
    });
  });

  describe('versionToSK', () => {
    it('should return the correct SK', () => {
      const version = 'testVersion';
      expect(dynamo.versionToSK(version)).toEqual(`VERSION#${version}`);
    });
  });
});

// TODO: Figure out how to spy on the DynamoDBClient.send method
/*
describe('dynamoDBClient', () => {
  let dynamoDBClientMock;

  beforeEach(() => {
    dynamoDBClientMock = new DynamoDBClient({});
    jest.spyOn(dynamoDBClientMock, 'send');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call send with QueryCommand', async () => {
    const table = 'testTable';
    const params = {
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
        ":pk": { S: "testPK" }
      }
    };
    const queryCommandMock = new QueryCommand({ TableName: table, ...params });
    dynamoDBClientMock.send.mockResolvedValue({ Items: [] });

    await dynamo.queryTable(table, params);

    expect(dynamoDBClientMock.send).toHaveBeenCalledWith(queryCommandMock);
  });

  it('should call send with ScanCommand', async () => {
    const table = 'testTable';
    const params = {};
    const scanCommandMock = new ScanCommand({ TableName: table, ...params });
    dynamoDBClientMock.send.mockResolvedValue({ Items: [] });

    await dynamo.scanTable(table, params);

    expect(dynamoDBClientMock.send).toHaveBeenCalledWith(scanCommandMock);
  });

  it('should call send with PutItemCommand', async () => {
    const table = 'testTable';
    const item = { variableA: 'valueA' };
    const putItemCommandMock = new PutItemCommand({
      TableName: table,
      Item: marshall(item),
    });
    dynamoDBClientMock.send.mockResolvedValue({});

    await dynamo.putItem(table, item);

    expect(dynamoDBClientMock.send).toHaveBeenCalledWith(putItemCommandMock);
  });

  it.only('should call send with DeleteItemCommand', async () => {
    const table = 'testTable';
    const key = { PK: { S: 'testPK' }, SK: { S: 'testSK' } };
    const deleteItemCommandMock = new DeleteItemCommand({
      TableName: table,
      Key: key,
    });
    jest.spyOn(dynamoDBClientMock, 'send').mockResolvedValue({});

    await dynamo.deleteItem(table, key);

    expect(dynamoDBClientMock.send).toHaveBeenCalledWith(deleteItemCommandMock);
  });
});
*/