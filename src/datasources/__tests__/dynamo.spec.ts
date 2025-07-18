import casual from "casual";
import { DMPCommonStandard, DMPIdentifierType, DMPPrivacy, DMPStatus, DMPYesNoUnknown } from "../../types/DMP";
import * as dynamoModule from "../dynamo";
import { getDMP, updateDMP, createDMP, tombstoneDMP, deleteDMP } from "../dynamo";
import { getRandomEnumValue } from "../../__tests__/helpers";
import { MyContext } from "../../context";
import { buildMockContextWithToken  } from "../../__mocks__/context";
import { logger } from "../../logger";

let context: MyContext;
let dmp: DMPCommonStandard;

beforeEach(async () => {
  context = await buildMockContextWithToken(logger);

  dmp = {
    dmphub_provenance_id: casual.word,
    dmproadmap_featured: casual.boolean.toString(),
    dmproadmap_privacy: getRandomEnumValue(DMPPrivacy),
    dmproadmap_status: getRandomEnumValue(DMPStatus),
    created: casual.date('YYYY-MM-DD'),
    modified: casual.date('YYYY-MM-DD'),
    title: casual.title,
    language: 'eng',
    ethical_issues_exist: getRandomEnumValue(DMPYesNoUnknown),
    dmp_id: { identifier: casual.url, type: getRandomEnumValue(DMPIdentifierType) },
    contact: {
      mbox: casual.email,
      name: casual.name,
      contact_id: { type: getRandomEnumValue(DMPIdentifierType), identifier: casual.uuid },
      dmproadmap_affiliation: {
        name: casual.company_name,
        affiliation_id: { type: getRandomEnumValue(DMPIdentifierType), identifier: casual.url },
      }
    },
    dataset: [{
      type: casual.word,
      title: casual.title,
      dataset_id: { type: getRandomEnumValue(DMPIdentifierType), identifier: casual.url },
      sensitive_data: getRandomEnumValue(DMPYesNoUnknown),
      personal_data: getRandomEnumValue(DMPYesNoUnknown),
    }],
    project: [{ title: casual.title }],
  }
});

describe("getDMP", () => {
  const mockQueryTable = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (dynamoModule.queryTable as jest.Mock) = mockQueryTable;
  });

  it("should query the table with the correct parameters when version is provided", async () => {
    const dmpId = "test-dmp-id";
    const version = "1.0";
    const mockResponse = {
      Items: [
        { PK: { S: "DMP#test-dmp-id" }, SK: { S: "VERSION#1.0" }, title: { S: "Test DMP" } },
      ],
    };
    mockQueryTable.mockResolvedValue(mockResponse);

    const result = await getDMP(context, dmpId, version);

    expect(mockQueryTable).toHaveBeenCalledWith(context, expect.any(String), {
      KeyConditionExpression: "PK = :pk and SK = :sk",
      ExpressionAttributeValues: {
        ":pk": { S: "DMP#test-dmp-id" },
        ":sk": { S: "VERSION#1.0" },
      },
    });
    expect(result).toEqual([{ title: "Test DMP" }]);
  });

  it("should query the table with the correct parameters when version is not provided", async () => {
    const dmpId = "test-dmp-id";
    const mockResponse = {
      Items: [
        { PK: { S: "DMP#test-dmp-id" }, SK: { S: "VERSION#2.0" }, title: { S: "Test DMP" }, modified: { S: "2" } },
        { PK: { S: "DMP#test-dmp-id" }, SK: { S: "VERSION#1.0" }, title: { S: "Test DMP" }, modified: { S: "1" } },
      ],
    };
    mockQueryTable.mockResolvedValue(mockResponse);

    const result = await getDMP(context, dmpId, null);

    expect(mockQueryTable).toHaveBeenCalledWith(context, expect.any(String), {
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
        ":pk": { S: "DMP#test-dmp-id" },
      },
    });
    expect(result).toEqual([
      { title: "Test DMP", modified: "2" },
      { title: "Test DMP", modified: "1" },
    ]);
  });

  it("should return an empty array if no items are found", async () => {
    const dmpId = "test-dmp-id";
    const version = "1.0";
    const mockResponse = { Items: [] };
    mockQueryTable.mockResolvedValue(mockResponse);

    const result = await getDMP(context, dmpId, version);

    expect(mockQueryTable).toHaveBeenCalledWith(context, expect.any(String), {
      KeyConditionExpression: "PK = :pk and SK = :sk",
      ExpressionAttributeValues: {
        ":pk": { S: "DMP#test-dmp-id" },
        ":sk": { S: "VERSION#1.0" },
      },
    });
    expect(result).toEqual([]);
  });

  it("should throw an error if queryTable fails", async () => {
    const dmpId = "test-dmp-id";
    const version = "1.0";
    mockQueryTable.mockRejectedValue(new Error("Query failed"));

    await expect(getDMP(context, dmpId, version)).rejects.toThrow("Query failed");
    expect(mockQueryTable).toHaveBeenCalledWith(context, expect.any(String), {
      KeyConditionExpression: "PK = :pk and SK = :sk",
      ExpressionAttributeValues: {
        ":pk": { S: "DMP#test-dmp-id" },
        ":sk": { S: "VERSION#1.0" },
      },
    });
  });
});

describe("DynamoDB Datasource", () => {
  const mockQueryTable = jest.fn();
  const mockPutItem = jest.fn();
  const mockDeleteItem = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (dynamoModule.queryTable as jest.Mock) = mockQueryTable;
    (dynamoModule.putItem as jest.Mock) = mockPutItem;
    (dynamoModule.deleteItem as jest.Mock) = mockDeleteItem;
  });

  describe("updateDMP", () => {
    it("should update the DMP and return the updated record", async () => {
      dmp.title = "Updated DMP";
      const mockResponse = { PK: { S: "DMP#test-dmp-id" }, SK: { S: "VERSION#latest" }, title: { S: "Test DMP" } };
      mockPutItem.mockResolvedValue({});
      mockQueryTable.mockResolvedValue({ Items: [mockResponse] });

      const result = await updateDMP(context, dmp);

      expect(mockPutItem).toHaveBeenCalledWith(context, expect.any(String), expect.any(Object));
      expect(mockQueryTable).toHaveBeenCalledWith(context, expect.any(String), expect.any(Object));
      expect(result).toEqual({ title: "Test DMP" });
    });

    it("should return null if update fails", async () => {
      dmp.title = "Updated DMP";
      mockPutItem.mockResolvedValue({});
      mockQueryTable.mockResolvedValue({ Items: [] });

      const result = await updateDMP(context, dmp);

      expect(result).toBeNull();
    });
  });

  describe("createDMP", () => {
    it("should properly generate a PK for a DMP ID (DOI)", async () => {
      const testDMP = {
        title: "Test DMP",
        dmp_id: { identifier: "https://doi.org/10.1234/test-dmp-id", type: DMPIdentifierType.DOI },
        dmphub_provenance_id: casual.word,
        dmproadmap_featured: '1',
        dmproadmap_privacy: getRandomEnumValue(DMPPrivacy),
        dmproadmap_status: getRandomEnumValue(DMPStatus),
        created: casual.date('YYYY-MM-DD'),
        modified: casual.date('YYYY-MM-DD'),
        language: 'eng',
        ethical_issues_exist: getRandomEnumValue(DMPYesNoUnknown),
        contact: {
          mbox: casual.email,
          name: casual.name,
          contact_id: { type: getRandomEnumValue(DMPIdentifierType), identifier: casual.uuid },
          dmproadmap_affiliation: {
            name: casual.company_name,
            affiliation_id: { type: getRandomEnumValue(DMPIdentifierType), identifier: casual.url }
          }
        },
        project: [{ title: casual.title }],
        dataset: [{
          type: casual.word,
          title: casual.title,
          dataset_id: { type: getRandomEnumValue(DMPIdentifierType), identifier: casual.url },
          sensitive_data: getRandomEnumValue(DMPYesNoUnknown),
          personal_data: getRandomEnumValue(DMPYesNoUnknown),
        }],
      }
      const expectedPK = "DMP#doi.org/10.1234/test-dmp-id";
      const expectedVersion = "VERSION#latest";
      mockQueryTable.mockResolvedValueOnce({ Items: [] });
      mockPutItem.mockResolvedValue({});
      mockQueryTable.mockResolvedValue({ Items: [{
        PK: { S: expectedPK },
        SK: { S: expectedVersion },
        title: { S: "Test DMP" }
      }] });

      await createDMP(context, testDMP.dmp_id.identifier, testDMP);
      const putInput = mockPutItem.mock.calls[0][2]; // Get the input for the first call to putItem
      expect(putInput.PK).toEqual({ S: expectedPK });
      expect(putInput.SK).toEqual({ S: expectedVersion });
    });

    it("should properly generate a PK for a DMP ID (URL)", async () => {
      const testDMP = {
        title: "Test DMP",
        dmp_id: { identifier: "https://example.com/test-dmp-id", type: DMPIdentifierType.URL },
        dmphub_provenance_id: casual.word,
        dmproadmap_featured: '1',
        dmproadmap_privacy: getRandomEnumValue(DMPPrivacy),
        dmproadmap_status: getRandomEnumValue(DMPStatus),
        created: casual.date('YYYY-MM-DD'),
        modified: casual.date('YYYY-MM-DD'),
        language: 'eng',
        ethical_issues_exist: getRandomEnumValue(DMPYesNoUnknown),
        contact: {
          mbox: casual.email,
          name: casual.name,
          contact_id: { type: getRandomEnumValue(DMPIdentifierType), identifier: casual.uuid },
          dmproadmap_affiliation: {
            name: casual.company_name,
            affiliation_id: { type: getRandomEnumValue(DMPIdentifierType), identifier: casual.url }
          }
        },
        project: [{ title: casual.title }],
        dataset: [{
          type: casual.word,
          title: casual.title,
          dataset_id: { type: getRandomEnumValue(DMPIdentifierType), identifier: casual.url },
          sensitive_data: getRandomEnumValue(DMPYesNoUnknown),
          personal_data: getRandomEnumValue(DMPYesNoUnknown),
        }],
      }
      const expectedPK = "DMP#example.com/test-dmp-id";
      const expectedVersion = "VERSION#latest";
      mockQueryTable.mockResolvedValueOnce({ Items: [] });
      mockPutItem.mockResolvedValue({});
      mockQueryTable.mockResolvedValue({ Items: [{
        PK: { S: expectedPK },
        SK: { S: expectedVersion },
        title: { S: "Test DMP" }
      }] });

      await createDMP(context, testDMP.dmp_id.identifier, testDMP);
      const putInput = mockPutItem.mock.calls[0][2]; // Get the input for the first call to putItem
      expect(putInput.PK).toEqual({ S: expectedPK });
      expect(putInput.SK).toEqual({ S: expectedVersion });
    });

    it("should create a new DMP and return the created record", async () => {
      const dmpId = "test-dmp-id";
      dmp.title = "New DMP";
      const mockResponse = { PK: { S: "DMP#test-dmp-id" }, SK: { S: "VERSION#latest" }, title: { S: "Test DMP" } };
      mockPutItem.mockResolvedValue({});
      mockQueryTable.mockResolvedValueOnce({ Items: mockResponse });
      mockQueryTable.mockResolvedValueOnce({ Items: [mockResponse] });

      const result = await createDMP(context, dmpId, dmp);

      expect(mockPutItem).toHaveBeenCalledWith(context, expect.any(String), expect.any(Object));
      expect(mockQueryTable).toHaveBeenCalledWith(context, expect.any(String), expect.any(Object));
      expect(result).toEqual({ title: "Test DMP" });
    });

    it("should return null if a latest version already exists", async () => {
      const dmpId = "test-dmp-id";
      dmp.title = "New DMP";
      const mockResponse = { PK: { S: "DMP#test-dmp-id" }, SK: { S: "VERSION#latest" } };
      mockQueryTable.mockResolvedValue({ Items: mockResponse });

      const result = await createDMP(context, dmpId, dmp);

      expect(result).toBeNull();
    });
  });

  describe("tombstoneDMP", () => {
    it("should tombstone the DMP and return the updated record", async () => {
      const dmpId = "test-dmp-id";
      const mockResponse = { PK: { S: "DMP#test-dmp-id" }, SK: { S: "VERSION#latest" }, title: { S: "Test DMP" } };
      mockQueryTable.mockResolvedValue({ Items: [mockResponse] });
      mockPutItem.mockResolvedValue({});

      const result = await tombstoneDMP(context, dmpId);

      expect(mockQueryTable).toHaveBeenCalledWith(context, expect.any(String), expect.any(Object));
      expect(mockPutItem).toHaveBeenCalledWith(context, expect.any(String), expect.any(Object));
      expect(result).toEqual(expect.objectContaining({ title: "OBSOLETE: Test DMP" }));
    });

    it("should return null if no latest version is found", async () => {
      const dmpId = "test-dmp-id";
      mockQueryTable.mockResolvedValue({ Items: [] });

      const result = await tombstoneDMP(context, dmpId);

      expect(result).toBeNull();
    });
  });

  describe("deleteDMP", () => {
    it("should delete the DMP without errors", async () => {
      const dmpId = "test-dmp-id";
      const mockResponse = { PK: { S: "DMP#test-dmp-id" }, SK: { S: "VERSION#latest" }, title: { S: "Test DMP" } };
      mockQueryTable.mockResolvedValueOnce({ Items: [mockResponse] });
      mockDeleteItem.mockResolvedValue({});

      await expect(deleteDMP(context, dmpId)).resolves.not.toThrow();

      expect(mockQueryTable).toHaveBeenCalledWith(context, expect.any(String), expect.any(Object));
      expect(mockDeleteItem).toHaveBeenCalledWith(context, expect.any(String), expect.any(Object));
    });

    it("should throw an error if deleteItem fails", async () => {
      const dmpId = "test-dmp-id";
      const mockResponse = { PK: { S: "DMP#test-dmp-id" }, SK: { S: "VERSION#latest" }, title: { S: "Test DMP" } };
      mockQueryTable.mockResolvedValueOnce({ Items: [mockResponse] });
      mockDeleteItem.mockRejectedValue(new Error("Delete failed"));

      await expect(deleteDMP(context, dmpId)).rejects.toThrow("Delete failed");
    });
  });
});
