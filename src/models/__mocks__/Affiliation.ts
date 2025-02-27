import casual from "casual";
import { getCurrentDate } from "../../utils/helpers";
import {
  addEntryToMockTable,
  addMockTableStore,
  clearMockTableStore,
  deleteEntryFromMockTable,
  findEntriesInMockTableByFilter,
  findEntryInMockTableByFilter,
  findEntryInMockTableById,
  getMockTableStore,
  updateEntryInMockTable
} from "./MockStore";
import {
  Affiliation,
  AffiliationProvenance,
  AffiliationSearch,
  AffiliationType,
  DEFAULT_ROR_AFFILIATION_URL
} from "../Affiliation";
import { getRandomEnumValue } from "../../__tests__/helpers";
import { MyContext } from "../../context";

export const getAffiliationStore = () => {
  return getMockTableStore('affiliations');
}

export const getRandomAffiliation = (): Affiliation => {
  const store = getMockTableStore('affiliations');
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)];
}

export const clearAffiliationStore = () => {
  clearMockTableStore('affiliations');
}

export const generateNewAffiliation = (options) => {
  const name = casual.company_name;
  const homepage = casual.url;
  const domain = homepage.replace(/http(s)?:\/\//, '').replace('/', '').toLowerCase();
  const acronyms = casual.array_of_words(2);
  const aliases = casual.array_of_words(2);

  return {
    name: options.name ?? name,
    uri: options.uri ?? `${DEFAULT_ROR_AFFILIATION_URL}/${casual.uuid}`,
    funder: options.funder ?? casual.boolean,
    types: options.types ?? [getRandomEnumValue(AffiliationType)],
    displayName: options.displayName ?? `${name} (${domain})`,
    searchName: options.searchName ?? [name, domain, acronyms.join(' | '), aliases.join(' | ')].join(' | '),
    provenance: options.provenance ?? AffiliationProvenance.ROR,
    homepage: options.homepage ?? homepage,
    acronyms: options.acronyms ?? acronyms,
    aliases: options.aliases ?? aliases,
    fundrefId: options.fundrefId ?? casual.uuid,
    active: options.active ?? casual.boolean,

    managed: options.managed ?? casual.boolean,
    logoURI: options.logoURI ?? casual.url,
    logoName: options.logoName ?? casual.words(2),
    contactEmail: options.contactEmail ?? casual.email,
    contactName: options.contactName ?? casual.name,
    ssoEntityId: options.ssoEntityId ?? casual.uuid,

    feedbackEnabled: options.feedbackEnabled ?? casual.boolean,
    feedbackMessage: options.feedbackMessage ?? casual.sentence,
    feedbackEmails: options.feedbackEmails ?? [casual.email, casual.email],
  }
}

// Initialize the table
export const initAffiliationStore = (count = 10): Affiliation[] => {
  addMockTableStore('affiliations', []);

  for (let i = 0; i < count; i++) {
    addEntryToMockTable('affiliations', generateNewAffiliation({}));
  }

  return getAffiliationStore();
}

// Mock the queries
export const mockFindAffiliationById = async (_, __, id: number): Promise<Affiliation> => {
  const result = findEntryInMockTableById('affiliations', id);
  return result ? new Affiliation(result) : null;
};

export const mockFindAffiliationByURI = async (_, __, uri: string): Promise<Affiliation> => {
  const result = findEntryInMockTableByFilter(
    'affiliations',
    (entry) => { return entry.uri.toLowerCase().trim() === uri.toLowerCase().trim() }
  );
  return result ? new Affiliation(result) : null;
};

export const mockFindAffiliationByName = async (_, __, name: string): Promise<Affiliation> => {
  const result = findEntryInMockTableByFilter(
    'affiliations',
    (entry) => { return entry.name.toLowerCase().trim() === name.toLowerCase().trim() }
  );
  return result ? new Affiliation(result) : null;
};

export const mockAffiliationSearch = async (
  _,
  { name, funderOnly = false }: { name: string, funderOnly: boolean}
): Promise<AffiliationSearch[]> => {
  const affiliations = findEntriesInMockTableByFilter(
    'affiliations',
    (entry) => entry.name.toLowerCase().includes(name.toLowerCase())
  );
  // If funderOnly is true, filter the affiliations to only include funders
  const results = funderOnly ? affiliations.filter((entry) => entry.funder) : affiliations;
  return results ? results.map((entry) => { return new AffiliationSearch(entry) }) : [];
};

// Mock the mutations
export const mockInsertAffiliation = async (context: MyContext, _, obj: Affiliation): Promise<number> => {
  const newObj = generateNewAffiliation(obj);
  const { insertId } = addEntryToMockTable('affiliations', {
    ...newObj,
    createdById: context.token.id,
    created: getCurrentDate(),
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return insertId;
};

export const mockUpdateAffiliation = async (context: MyContext, _, obj: Affiliation): Promise<Affiliation> => {
  const result = updateEntryInMockTable('affiliations', {
    ...obj,
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return result ? new Affiliation(result) : null;
};

export const mockDeleteAffiliation = async (_, __, id: number): Promise<boolean> => {
  const result = deleteEntryFromMockTable('affiliations', id);
  return result ? true : false;
};