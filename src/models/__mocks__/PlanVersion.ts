
import casual from "casual";
import {
  DMPCommonStandard,
  DMPFundingStatus,
  DMPIdentifierType,
  DMPPrivacy,
  DMPStatus,
  DMPYesNoUnknown
} from "../../types/DMP";
import { getMockDMPId, getMockORCID, getMockROR, getRandomEnumValue } from "../../__tests__/helpers";
import { generalConfig } from "../../config/generalConfig";
import { MyContext } from "../../context";
import { createDMP, deleteDMP } from "../../datasources/dynamo";
import {isNullOrUndefined} from "../../utils/helpers";

// Generate a mock/test PlanVersion
export const mockPlanVersion = (
  options: DMPCommonStandard
): DMPCommonStandard => {
  let featured = options.dmproadmap_featured ?? casual.boolean;
  if (typeof featured === 'boolean') {
    featured = featured ? '1' : '0';
  } else {
    featured = featured.toString();
  }
  // Use the options provided or default a value
  const dmpRecord = {
    title: options.title ?? casual.sentence,
    created: options.created ?? casual.date('YYY-MM-DDTHH:mm:ss.SSSZ'),
    modified: options.modified ?? casual.date('YYY-MM-DDTHH:mm:ss.SSSZ'),
    registered: options.registered ?? casual.date('YYYY-MM-DDTH:mm:ss.SSSZ'),
    language: options.language ?? 'eng',
    ethical_issues_exist: options.ethical_issues_exist ?? getRandomEnumValue(DMPYesNoUnknown),
    dmphub_provenance_id: options.dmphub_provenance_id ?? generalConfig.applicationName.toLowerCase(),
    dmproadmap_featured: featured,
    dmproadmap_privacy: options.dmproadmap_privacy ?? getRandomEnumValue(DMPPrivacy),
    dmproadmap_status: options.dmproadmap_status ?? getRandomEnumValue(DMPStatus),
    dmp_id: {
      identifier: options.dmp_id?.identifier ?? getMockDMPId(),
      type: DMPIdentifierType[options.dmp_id?.type] ?? 'doi'
    },
    contact: {
      name: options.contact?.name ?? casual.name,
      mbox: options.contact?.mbox ?? casual.email,
      contact_id: {
        identifier: options.contact.contact_id?.identifier ?? getMockORCID(),
        type: DMPIdentifierType[options.contact.contact_id?.type] ?? 'orcid'
      },
      dmproadmap_affiliation: {
        name: options.contact.dmproadmap_affiliation?.name ?? casual.company_name,
        dmproadmap_affiliation_id: {
          identifier: options.contact.dmproadmap_affiliation?.affiliation_id?.identifier ?? getMockROR(),
          type: DMPIdentifierType[options.contact.dmproadmap_affiliation?.affiliation_id?.type] ?? 'ror'
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
      // TODO: Enable this once v1.2 is out and supports project ids
      /*project_id: {
        identifier: options.project[0]?.project_id?.identifier ?? casual.uuid,
        type: DMPIdentifierType[options.project[0]?.project_id?.type] ?? 'other'
      },*/
      funding: []
    });

    if (options.project[0] && Array.isArray(options.project[0].funding)) {
      for (const funding of options.project[0].funding) {
        dmpRecord.project[0].funding.push({
          name: funding?.name ?? casual.company_name,
          funder_id: {
            identifier: funding?.funder_id?.identifier ?? getMockROR(),
            type: DMPIdentifierType[funding?.funder_id?.type] ?? 'ror'
          },
          funding_status: funding?.funding_status ?? getRandomEnumValue(DMPFundingStatus),
          dmproadmap_project_number: funding?.dmproadmap_project_number ?? casual.uuid,
          dmproadmap_opportunity_number: funding?.dmproadmap_opportunity_number ?? casual.integer(1, 9999).toString(),
          grant_id: {
            identifier: funding?.grant_id?.identifier ?? casual.url,
            type: DMPIdentifierType[funding?.grant_id?.type] ?? 'url'
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
          type: DMPIdentifierType[dataset?.dataset_id?.type] ?? 'other'
        }
      });
    }
  } else {
    // TODO: Implement this part once we support question level research outputs
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
          identifier: contributor?.contributor_id.identifier ?? getMockORCID(),
          type: DMPIdentifierType[contributor?.contributor_id.type] ?? 'orcid'
        },
        dmproadmap_affiliation: {
          name: contributor?.dmproadmap_affiliation?.name ?? casual.company_name,
          dmproadmap_affiliation_id: {
            identifier: contributor?.dmproadmap_affiliation?.affiliation_id?.identifier ?? getMockROR(),
            type: DMPIdentifierType[contributor?.dmproadmap_affiliation?.affiliation_id?.type] ?? 'ror'
          }
        },
        role: contributor?.role ?? [casual.url],
      });
    }
  }
  return dmpRecord;
}

// Save a mock/test PlanVersion in the Dynamo table for integration tests
export const persistPlanVersion = async (
  context: MyContext,
  dmpId: string,
  version: string,
  dmp: DMPCommonStandard
): Promise<DMPCommonStandard | null> => {
  try {
    const persisted = createDMP(context, dmpId, dmp, version);
    return isNullOrUndefined(persisted) ? null : persisted;
  } catch (e) {
    console.error(`Error persisting plan version id: ${dmpId}, ver: ${version}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}
