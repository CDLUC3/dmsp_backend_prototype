
import casual from "casual";
import { isNullOrUndefined } from "../../utils/helpers";
import { MyContext } from "../../context";
import {
  QuestionCondition,
  QuestionConditionActionType,
  QuestionConditionCondition
} from "../QuestionCondition";
import { getRandomEnumValue } from "../../__tests__/helpers";

export interface MockQuestionConditionOptions {
  questionId: number;
  action?: string;
  conditionType?: string;
  conditionMatch?: string;
  target?: string;
}

// Generate a mock/test QuestionCondition
export const mockQuestionCondition = (
  options: MockQuestionConditionOptions
): QuestionCondition => {
  // Use the options provided or default a value
  return new QuestionCondition({
    questionId: options.questionId,
    action: options.action ?? getRandomEnumValue(QuestionConditionActionType),
    conditionType: options.conditionType ?? getRandomEnumValue(QuestionConditionCondition),
    conditionMatch: options.conditionMatch ?? casual.word,
    target: options.target ?? casual.word,
  });
}

// Save a mock/test QuestionCondition in the DB for integration tests
export const persistQuestionCondition = async (
  context: MyContext,
  questionCondition: QuestionCondition
): Promise<QuestionCondition | null> => {
  // Ensure the createdById and modifiedId are set
  if (isNullOrUndefined(questionCondition.createdById) || isNullOrUndefined(questionCondition.modifiedById)) {
    questionCondition.createdById = context.token.id;
    questionCondition.modifiedById = context.token.id;
  }

  try {
    const created = await questionCondition.create(context);
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting questionCondition "${questionCondition.action}": ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}
