
import casual from "casual";
import { isNullOrUndefined } from "../../utils/helpers";
import { MyContext } from "../../context";
import { Question } from "../Question";

export interface MockQuestionOptions {
  templateId: number;
  sectionId: number;
  sourceQuestionId?: number;
  json?: string;
  questionText?: string;
  requirementText?: string;
  guidanceText?: string;
  sampleText?: string;
  useSampleTextAsDefault?: boolean;
  displayOrder?: number;
  required?: boolean;
  isDirty?: boolean;
}

// Generate a mock/test Question
export const mockQuestion = (
  options: MockQuestionOptions
): Question => {
  // Use the options provided or default a value
  return new Question({
    templateId: options.templateId,
    sectionId: options.sectionId,
    sourceQuestionId: options.sourceQuestionId,
    json: options.json ?? '{"type": "textArea","meta":{"asRichText":true}}',
    questionText: options.questionText ?? casual.sentences(2),
    requirementText: options.requirementText ?? casual.sentences(2),
    guidanceText: options.guidanceText ?? casual.sentences(2),
    sampleText: options.sampleText ?? casual.sentences(2),
    useSampleTextAsDefault: options.useSampleTextAsDefault ?? casual.boolean,
    displayOrder: options.displayOrder ?? casual.integer(1, 99),
    required: options.required ?? casual.boolean,
    isDirty: options.isDirty ?? false
  });
}

// Save a mock/test Question in the DB for integration tests
export const persistQuestion = async (
  context: MyContext,
  question: Question
): Promise<Question | null> => {
  // Ensure the createdById and modifiedId are set
  if (isNullOrUndefined(question.createdById) || isNullOrUndefined(question.modifiedById)) {
    question.createdById = context.token.id;
    question.modifiedById = context.token.id;
  }

  try {
    const created = await question.create(context);
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting question "${question.questionText}": ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}
