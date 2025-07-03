
import casual from "casual";
import { isNullOrUndefined } from "../../utils/helpers";
import { MyContext } from "../../context";
import { VersionedQuestion } from "../VersionedQuestion";

export interface MockVersionedQuestionOptions {
  versionedTemplateId: number;
  versionedSectionId: number;
  questionId: number;
  json?: string;
  questionText?: string;
  requirementText?: string;
  guidanceText?: string;
  sampleText?: string;
  useSampleTextAsDefault?: boolean;
  displayOrder?: number;
  required?: boolean;
}

// Generate a mock/test VersionedQuestion
export const mockVersionedQuestion = (
  options: MockVersionedQuestionOptions
): VersionedQuestion => {
  // Use the options provided or default a value
  return new VersionedQuestion({
    versionedTemplateId: options.versionedTemplateId,
    versionedSectionId: options.versionedSectionId,
    questionId: options.questionId,
    json: options.json ?? '',
    questionText: options.questionText ?? casual.sentences(2),
    requirementText: options.requirementText ?? casual.sentences(2),
    guidanceText: options.guidanceText ?? casual.sentences(2),
    sampleText: options.sampleText ?? casual.sentences(2),
    useSampleTextAsDefault: options.useSampleTextAsDefault ?? casual.boolean,
    displayOrder: options.displayOrder ?? casual.integer(1, 99),
    required: options.required ?? casual.boolean,
  });
}

// Save a mock/test VersionedQuestion in the DB for integration tests
export const persistVersionedQuestion = async (
  context: MyContext,
  versionedQuestion: VersionedQuestion
): Promise<VersionedQuestion | null> => {
  // Ensure the createdById and modifiedId are set
  if (isNullOrUndefined(versionedQuestion.createdById) || isNullOrUndefined(versionedQuestion.modifiedById)) {
    versionedQuestion.createdById = context.token.id;
    versionedQuestion.modifiedById = context.token.id;
  }

  try {
    const created = await versionedQuestion.create(context);
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting versionedQuestion "${versionedQuestion.questionText}": ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}
