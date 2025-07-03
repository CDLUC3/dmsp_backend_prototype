
import casual from "casual";
import { isNullOrUndefined } from "../../utils/helpers";
import { MyContext } from "../../context";
import { Tag } from "../Tag";

export interface MockTagOptions {
  name?: string;
  description?: string;
}

// Generate a mock/test Tag
export const mockTag = (
  options: MockTagOptions
): Tag => {
  // Use the options provided or default a value
  return new Tag({
    name: options.name ?? `${casual.word}-${casual.integer(1, 999)}`,
    description: options.description ?? casual.sentences(2),
  });
}

// Save a mock/test Tag in the DB for integration tests
export const persistTag = async (
  context: MyContext,
  tag: Tag
): Promise<Tag | null> => {
  // Ensure the createdById and modifiedId are set
  if (isNullOrUndefined(tag.createdById) || isNullOrUndefined(tag.modifiedById)) {
    tag.createdById = context.token.id;
    tag.modifiedById = context.token.id;
  }

  try {
    const created = await tag.create(context);
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting tag ${tag.name}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}
