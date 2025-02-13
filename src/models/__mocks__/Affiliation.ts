
import casual from "casual";
import { getCurrentDate } from "../../utils/helpers";
import { getRandomEnumValue } from "../../__tests__/helpers";
import { Affiliation, AffiliationProvenance, AffiliationSearch, AffiliationType, DEFAULT_ROR_AFFILIATION_URL } from "../Affiliation";

// Mock the affiliations table
export let affiliationStore = [];

// Reset the affiliations table
export const resetAffiliationStore = () => {
  affiliationStore = [];
}

// Seed the affiliations table
export const seedAffiliationStore = (count = 10) => {
  for (let i = 0; i < count; i++) {
    const tstamp = getCurrentDate();
    const name = casual.company_name;
    const homepage = casual.url;
    const domain = homepage.replace(/http(s)?:\/\//, '').replace('/', '').toLowerCase();
    const acronyms = casual.array_of_words(2);
    const aliases = casual.array_of_words(2);

    affiliationStore.push({
      id: casual.integer(1, 9999),
      createdById: casual.integer(1, 9999),
      created: tstamp,
      modifiedById: casual.integer(1, 9999),
      modified: tstamp,

      name: name,
      uri: `${DEFAULT_ROR_AFFILIATION_URL}/${casual.uuid}`,
      funder: casual.boolean,
      types: [getRandomEnumValue(AffiliationType)],
      displayName: `${name} (${domain})`,
      searchName: [name, domain, acronyms.join(' | '), aliases.join(' | ')].join(' | '),
      provenance: AffiliationProvenance.ROR,
      homepage: homepage,
      acronyms: acronyms,
      aliases: aliases,
      fundrefId: casual.url,
      active: casual.boolean,

      managed: casual.boolean,
      logoURI: casual.url,
      logoName: casual.first_name,
      contactEmail: casual.email,
      contactName: casual.name,
      ssoEntityId: casual.uuid,

      feedbackEnabled: casual.boolean,
      feedbackMessage: casual.sentences(5),
      feedbackEmails: [casual.email, casual.email],
    });
  }
}

// Mock the queries
export const mockFindById = async (_, __, id) => {
  const result = affiliationStore.find((entry) => { return entry.id === id });
  return result ? new Affiliation(result) : null;
};

export const mockFindByURI = async (_, __, uri) => {
  const result = affiliationStore.find((entry) => { return entry.uri.toLowerCase().trim() === uri.toLowerCase().trim() });
  return result ? new Affiliation(result) : null;
};

export const mockFindByName = async (_, __, name) => {
  const result = affiliationStore.find((entry) => { return entry.name.toLowerCase().trim() === name.toLowerCase().trim() });
  return result ? new Affiliation(result) : null;
};

export const mockSearch = async (_, { name, funderOnly = false }) => {
  // Filter the affiliations based on the search term
  const affiliations = affiliationStore.filter((entry) => entry.name.toLowerCase().includes(name.toLowerCase()));
  // If funderOnly is true, filter the affiliations to only include funders
  const results = funderOnly ? affiliations.filter((entry) => entry.funder) : affiliations;
  return results ? results.map((entry) => { return new AffiliationSearch(entry) }) : [];
};

// Mock the mutations
export const mockInsert = async (context, _, obj) => {
  obj.id = casual.integer(1, 9999);

  const tstamp = getCurrentDate();
  obj.createdById = context.token.id;
  obj.created = tstamp;
  obj.modifiedById = context.token.id;
  obj.modified = tstamp;

  affiliationStore.push(obj);
  return obj.id;
};

export const mockUpdate = async (context, _, obj) => {
  const index = affiliationStore.findIndex((entry) => { return entry.id === obj.id });
  const tstamp = getCurrentDate();
  const updatedEntry = {
    ...affiliationStore[index],
    ...obj,
    modifiedById: context.token.id,
    modified: tstamp,
    errors: null,
  };

  affiliationStore[index] = updatedEntry;
  return updatedEntry;
};

export const mockDelete = async (_, __, id) => {
  const existing = affiliationStore.find((entry) => { return entry.id === id });

  affiliationStore.splice(affiliationStore.indexOf(existing), 1);
  return existing ? true : false;
};
