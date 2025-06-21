import casual from "casual";
import { isNullOrUndefined } from "../../utils/helpers";
import { getRandomEnumValue } from "../../__tests__/helpers";
import { MyContext } from "../../context";
import {
  Affiliation,
  AffiliationProvenance,
  AffiliationType,
  DEFAULT_ROR_AFFILIATION_URL
} from "../Affiliation";

export interface MockAffiliationOptions {
  name?: string;
  uri?: string;
  funder?: boolean;
  types?: AffiliationType[];
  provenance?: AffiliationProvenance;
  homepage?: string;
  acronyms?: string[];
  aliases?: string[];
  fundrefId?: string;
  active?: boolean;
}

// Generate a mock/test Affiliation
export const mockAffiliation = (
  options: MockAffiliationOptions
): Affiliation => {
  const name = options.name ?? `${casual.company_name} - ${casual.integer(1, 9999)}`;
  const homepage = options.homepage ?? casual.url;
  const domain = homepage.replace(/http(s)?:\/\//, '')
                                .replace('/', '')
                                .toLowerCase();
  const acronyms = options.acronyms ?? casual.array_of_words(2);
  const aliases = options.aliases ?? casual.array_of_words(2);
  const searchName = [
    name,
    domain,
    acronyms.join(' | '),
    aliases.join(' | ')
  ].filter((s) => s.length > 0);

  // Use the options provided or default a value
  return new Affiliation({
    name: options.name ?? `TEST - ${name}`,
    uri: options.uri ?? `${DEFAULT_ROR_AFFILIATION_URL}/${casual.uuid}`,
    funder: options.funder ?? casual.boolean,
    types: options.types ?? [getRandomEnumValue(AffiliationType)],
    displayName: `${name} (${domain})`,
    searchName,
    provenance: options.provenance ?? AffiliationProvenance.ROR,
    homepage: options.homepage ?? homepage,
    acronyms: options.acronyms ?? acronyms,
    aliases: options.aliases ?? aliases,
    fundrefId: options.fundrefId ?? casual.uuid,
    active: options.active ?? casual.boolean,
  });
}

// Save a mock/test Affiliation in the DB for integration tests
export const persistAffiliation = async (
  context: MyContext,
  affiliation: Affiliation
): Promise<Affiliation | null> => {
  // Ensure the createdById and modifiedId are set
  if (isNullOrUndefined(affiliation.createdById) || isNullOrUndefined(affiliation.modifiedById)) {
    affiliation.createdById = context.token.id;
    affiliation.modifiedById = context.token.id;
  }

  const created = await affiliation.create(context);

  return isNullOrUndefined(created) ? null : created;
}

// Clean up all mock/test Affiliations
export const cleanUpAddedAffiliation = async (
  context: MyContext,
  id: number,
) : Promise<void> => {
  const reference = 'cleanUpAddedAffiliations';
  try {
    // Do a direct delete on the MySQL model because the tests might be mocking the Affiliation functions
    await Affiliation.delete(context, Affiliation.tableName, id, reference);
  } catch (e) {
    console.error(`Error cleaning up affiliation id ${id}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
  }
}

// Fetch a random persisted Affiliation
export const randomAffiliation = async (
  context: MyContext
): Promise<Affiliation | null> => {
  const sql = `SELECT * FROM ${Affiliation.tableName} WHERE active = 1 ORDER BY RAND() LIMIT 1`;
  try {
    const results = await Affiliation.query(context, sql, [], 'randomAffiliation');
    if (Array.isArray(results) && results.length > 0) {
      return new Affiliation(results[0]);
    }
  } catch (e) {
    console.error(`Error getting random affiliation: ${e.message}`);
  }
  return null;
}
