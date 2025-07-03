import casual from "casual";
import { ResearchDomain } from "../ResearchDomain";
import { MyContext } from "../../context";
import {isNullOrUndefined} from "../../utils/helpers";

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

// Save a mock/test ResearchDomain in the DB for integration tests
export const persistResearchDomain = async (
  context: MyContext,
  domain: ResearchDomain
): Promise<ResearchDomain | null> => {
  // Ensure the createdById and modifiedId are set
  if (isNullOrUndefined(domain.createdById) || isNullOrUndefined(domain.modifiedById)) {
    domain.createdById = context.token.id;
    domain.modifiedById = context.token.id;
  }

  try {
    const created = await domain.create(context);
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting research domain ${domain.name}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}
