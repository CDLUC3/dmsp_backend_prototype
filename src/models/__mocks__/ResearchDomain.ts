import casual from "casual";
import { ResearchDomain } from "../ResearchDomain";
import { MyContext } from "../../context";

export interface MockResearchDomainOptions {
  name?: string;
  uri?: string;
  description?: string;
}

// Generate a mock/test ResearchDomain
export const mockResearchDomain = (
  options: MockResearchDomainOptions
): ResearchDomain => {
  // Use the options provided or default a value
  return new ResearchDomain({
    name: options.name ?? `TEST - ${casual.sentence}`,
    uri: options.uri ?? `${casual.url}/TEST/${casual.integer(1, 9999)}`,
    description: options.description ?? casual.sentences(2),
  });
}

// Fetch a random persisted Affiliation
export const randomResearchDomain = async (
  context: MyContext
): Promise<ResearchDomain | null> => {
  const sql = `SELECT * FROM ${ResearchDomain.tableName} WHERE active = 1 ORDER BY RAND() LIMIT 1`;
  try {
    const results = await ResearchDomain.query(context, sql, [], 'randomResearchDomain');
    if (Array.isArray(results) && results.length > 0) {
      return new ResearchDomain(results[0]);
    }
  } catch (e) {
    console.error(`Error getting research domain role: ${e.message}`);
  }
  return null;
}
