
import casual from "casual";
import { isNullOrUndefined } from "../../utils/helpers";
import { MyContext } from "../../context";
import {
  QuestionConditionActionType,
  QuestionConditionCondition
} from "../QuestionCondition";
import { VersionedQuestionCondition } from "../VersionedQuestionCondition";
import { getRandomEnumValue } from "../../__tests__/helpers";

export interface MockVersionedQuestionConditionOptions {
  versionedQuestionId: number;
  questionConditionId: number;
  action?: string;
  conditionType?: string;
  conditionMatch?: string;
  target?: string;
}

// Generate a mock/test VersionedQuestionCondition
export const mockVersionedQuestionCondition = (
  options: MockVersionedQuestionConditionOptions
): VersionedQuestionCondition => {
  // Use the options provided or default a value
  return new VersionedQuestionCondition({
    versionedQuestionId: options.versionedQuestionId,
    questionConditionId: options.questionConditionId,
    action: options.action,
    conditionType: options.conditionType,
    conditionMatch: options.conditionMatch,
    target: options.target,
  });
}

// Save a mock/test VersionedQuestionCondition in the DB for integration tests
export const persistVersionedQuestionCondition = async (
  context: MyContext,
  questionCondition: VersionedQuestionCondition
): Promise<VersionedQuestionCondition | null> => {
  // Ensure the createdById and modifiedId are set
  if (isNullOrUndefined(questionCondition.createdById) || isNullOrUndefined(questionCondition.modifiedById)) {
    questionCondition.createdById = context.token.id;
    questionCondition.modifiedById = context.token.id;
  }

  try {
    const created = await questionCondition.create(context);
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting versionedQuestionCondition "${questionCondition.action}": ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}
