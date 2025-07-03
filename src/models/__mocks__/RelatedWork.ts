import casual from "casual";
import { isNullOrUndefined } from "../../utils/helpers";
import { RelatedWork, RelatedWorkRelationDescriptor, RelatedWorkType } from "../RelatedWork";
import { MyContext } from "../../context";
import { getRandomEnumValue } from "../../__tests__/helpers";

export interface MockRelatedWorkOptions {
  workType?: RelatedWorkType;
  relationDescriptor?: RelatedWorkRelationDescriptor;
  identifier?: string;
  citation?: string;
}

// Generate a mock/test RelatedWork
export const mockRelatedWork = (
  options: MockRelatedWorkOptions
): RelatedWork => {
  // Use the options provided or default a value
  return new RelatedWork({
    workType: options.workType ?? getRandomEnumValue(RelatedWorkType),
    relationDescriptor: options.relationDescriptor ?? getRandomEnumValue(RelatedWorkRelationDescriptor),
    identifier: options.identifier ?? casual.uuid,
    citation: options.citation ?? casual.sentences(3),
  });
}

// Save a mock/test RelatedWork in the DB for integration tests
export const persistRelatedWork = async (
  context: MyContext,
  work: RelatedWork
): Promise<RelatedWork | null> => {
  // Ensure the createdById and modifiedId are set
  if (isNullOrUndefined(work.createdById) || isNullOrUndefined(work.modifiedById)) {
    work.createdById = context.token.id;
    work.modifiedById = context.token.id;
  }

  try {
    const created = await work.create(context);
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting related work ${work.identifier}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}
