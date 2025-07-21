
import casual from "casual";
import {
  addEntryToMockTable,
  addMockTableStore,
  clearMockTableStore,
  deleteEntryFromMockTable,
  findEntriesInMockTableByFilter,
  findEntryInMockTableByFilter,
  getMockTableStore,
  updateEntryInMockTable
} from "./MockStore";
import { DMPCommonStandard, DMPFundingStatus, DMPPrivacy, DMPStatus, DMPYesNoUnknown } from "../../types/DMP";
import { getMockDMPId, getMockORCID, getMockROR, getRandomEnumValue } from "../../__tests__/helpers";
import { generalConfig } from "../../config/generalConfig";
import { awsConfig } from "../../config/awsConfig";
import { AttributeValue, PutItemCommandInput, PutItemCommandOutput, QueryCommandInput, QueryCommandOutput } from "@aws-sdk/client-dynamodb";

const tableName = awsConfig.dynamoTableName;

export const getPlanVersionStore = () => {
  return getMockTableStore(tableName);
}

export const getRandomPlanVersion = (): DMPCommonStandard => {
  const store = getMockTableStore(tableName);
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)];
}

export const clearPlanVersionStore = () => {
  clearMockTableStore(tableName);
}

export const generateNewPlanVersion = (options) => {
  const dmpRecord = {
    title: options.title ?? casual.sentence,
    created: options.created ?? casual.date('YYY-MM-DDTHH:mm:ss.SSSZ'),
    modified: options.modified ?? casual.date('YYY-MM-DDTHH:mm:ss.SSSZ'),
    registered: options.registered ?? casual.date('YYYY-MM-DDTH:mm:ss.SSSZ'),
    language: options.language ?? 'eng',
    ethical_issues_exist: options.ethical_issues_exist ?? getRandomEnumValue(DMPYesNoUnknown),
    dmphub_provenance_id: options.dmphub_provenance_id ?? generalConfig.applicationName.toLowerCase(),
    dmproadmap_featured: options.dmproadmap_featured ?? getRandomEnumValue(['0', '1']),
    dmproadmap_privacy: options.dmproadmap_privacy ?? getRandomEnumValue(DMPPrivacy),
    dmproadmap_status: options.dmproadmap_status ?? getRandomEnumValue(DMPStatus),
    dmp_id: {
      identifier: options.dmp_id?.identifier ?? getMockDMPId(),
      type: options.dmp_id?.type ?? 'doi'
    },
    contact: {
      name: options.contact?.name ?? casual.name,
      mbox: options.contact?.mbox ?? casual.email,
      contact_id: {
        identifier: options.contact_id?.identifier ?? getMockORCID(),
        type: options.contact_id?.type ?? 'orcid'
      },
      dmproadmap_affiliation: {
        name: options.dmproadmap_affiliation?.name ?? casual.company_name,
        dmproadmap_affiliation_id: {
          identifier: options.dmproadmap_affiliation?.dmproadmap_affiliation_id?.identifier ?? getMockROR(),
          type: options.dmproadmap_affiliation?.dmproadmap_affiliation_id?.type ?? 'ror'
        }
      }
    },
    project: [],
    dataset: [],
    contributor: []
  };

  if (Array.isArray(options.project) && options.project.length > 0) {
    dmpRecord.project.push({
      title: options.project[0]?.title ?? casual.sentence,
      description: options.project[0]?.description ?? casual.sentences(4),
      start: options.project[0]?.start ?? casual.date('YYYY-MM-DD'),
      end: options.project[0]?.end ?? casual.date('YYYY-MM-DD'),
      dmptool_research_domain: options.project[0]?.dmptool_research_domain ?? casual.integer(1, 99),
      project_id: {
        identifier: options.project[0]?.project_id?.identifier ?? casual.uuid,
        type: options.project[0]?.project_id?.type ?? 'other'
      },
      funding: []
    });

    if (options.project[0] && Array.isArray(options.project[0].funding)) {
      for (const funding of options.project[0].funding) {
        dmpRecord.project[0].funding.push({
          name: funding?.name ?? casual.company_name,
          funder_id: {
            identifier: funding?.funder_id?.identifier ?? getMockROR(),
            type: funding?.funder_id?.type ?? 'ror'
          },
          funding_status: funding?.funding_status ?? getRandomEnumValue(DMPFundingStatus),
          dmproadmap_project_number: funding?.dmproadmap_project_number ?? casual.uuid,
          dmproadmap_opportunity_number: funding?.dmproadmap_opportunity_number ?? casual.integer(1, 9999).toString(),
          grant_id: {
            identifier: funding?.grant_id?.identifier ?? casual.url,
            type: funding?.grant_id?.type ?? 'url'
          },
        });
      }
    }
  } else {
    // A project title is required
    dmpRecord.project.push({ title: casual.sentence });
  }

  if (Array.isArray(options.dataset)) {
    for (const dataset of options.dataset) {
      dmpRecord.dataset.push({
        title: dataset?.title ?? casual.sentence,
        type: dataset?.type ?? 'dataset',
        personal_data: dataset?.personal_data ?? getRandomEnumValue(DMPYesNoUnknown),
        sensitive_data: dataset?.sensitive_data ?? getRandomEnumValue(DMPYesNoUnknown),
        dataset_id: {
          identifier: dataset?.dataset_id?.identifier ?? casual.uuid,
          type: dataset?.dataset_id?.type ?? 'other'
        }
      });
    }
  } else {
    dmpRecord.dataset.push({
      title: casual.sentence,
      type: 'dataset',
      personal_data: getRandomEnumValue(DMPYesNoUnknown),
      sensitive_data: getRandomEnumValue(DMPYesNoUnknown),
      dataset_id: { identifier: casual.url, type: 'url' }
    });
  }

  if (Array.isArray(options.contributor)) {
    for (const contributor of options.contributor) {
      dmpRecord.contributor.push({
        name: contributor?.name ?? casual.name,
        mbox: contributor?.mbox ?? casual.email,
        constibutor_id: {
          identifier: contributor?.orcid ?? getMockORCID(),
          type: contributor?.orcid ?? 'orcid'
        },
        dmproadmap_affiliation: {
          name: contributor?.dmproadmap_affiliation?.name ?? casual.company_name,
          dmproadmap_affiliation_id: {
            identifier: contributor?.dmproadmap_affiliation?.dmproadmap_affiliation_id?.identifier ?? getMockROR(),
            type: contributor?.dmproadmap_affiliation?.dmproadmap_affiliation_id?.type ?? 'ror'
          }
        },
        role: contributor?.role ?? [casual.url],
      });
    }
  }
}

// Initialize the table
export const initPlanVersionStore = (count = 10): DMPCommonStandard[] => {
  addMockTableStore(tableName, []);

  for (let i = 0; i < count; i++) {
    addEntryToMockTable(tableName, generateNewPlanVersion({}));
  }

  return getPlanVersionStore();
}

// Mock the queries
export const mockQueryTable = async (_, __, input: QueryCommandInput): Promise<QueryCommandOutput> => {
  const results = findEntriesInMockTableByFilter(
    tableName,
    (entry) => {
      return input?.ExpressionAttributeValues[":pk"]?.S === entry.PK?.S &&
        (!input?.ExpressionAttributeValues[":sk"]?.S || input?.ExpressionAttributeValues[":sk"]?.S === entry?.SK?.S)
    }
  );
  // Remove the default mockStore row id, createdById and modifiedById and then return
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return { $metadata: {}, Items: results.map(({ id, createdById, modifiedById, ...entry }) => entry) };
};

// Mock the mutations
export const mockPutItem = async (_, __, input: PutItemCommandInput): Promise<PutItemCommandOutput> => {
  const item = input.Item;
  if (!item.PK) item.PK = { S: `DMP#${item.dmp_id?.M?.identifier?.S.replace(/(^\w+:|^)\/\//, '')}` };
  if (!item.SK) item.SK = { S: 'VERSION#latest' };

  const existing = findEntryInMockTableByFilter(
    tableName,
    (entry) => {
      return entry.PK === item.PK.S && entry.SK === item.SK?.S;
    }
  );
  if (existing) {
    // The item already exists, update it
    updateEntryInMockTable(tableName, item);
    return { $metadata: { } };

  } else {
    // Its a new entry
    const response = addEntryToMockTable(tableName, item);
    return response ? { $metadata: { } } : null;
  }
};

export const mockDeleteItem = async (_, __, key: Record<string, AttributeValue>): Promise<boolean> => {
  const existing = findEntryInMockTableByFilter(
    tableName,
    (entry) => {
      return entry.PK === key["PK"] && entry.SK === key["SK"];
    }
  );
  const result = deleteEntryFromMockTable(tableName, existing.id);
  return result ? true : false;
};
