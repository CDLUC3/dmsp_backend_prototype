import { MyContext } from "../context";
import { Template } from "../models/Template";
import { hasPermissionOnTemplate } from "./templateService";
import { Question } from "../models/Question";
import { VersionedQuestion } from "../models/VersionedQuestion";
import { NotFoundError } from "../utils/graphQLErrors";
import { QuestionCondition } from "../models/QuestionCondition";
import { QuestionOption } from "../models/QuestionOption";
import { VersionedQuestionCondition } from "../models/VersionedQuestionCondition";
import { formatLogMessage, logger } from "../logger";

// Determine whether the specified user has permission to access the Section
export const hasPermissionOnQuestion = async (context: MyContext, templateId: number): Promise<boolean> => {
  // Find associated template info
  const template = await Template.findById('question resolver.hasPermission', context, templateId);

  if (!template) {
    throw NotFoundError();
  }

  // Offload permission checks to the Template
  return await hasPermissionOnTemplate(context, template);
}

// Creates a new Version/Snapshot the specified Question (as a point in time snapshot)
//    - creates a new VersionedQuestion
export const generateQuestionVersion = async (
  context: MyContext,
  question: Question,
  versionedTemplateId: number,
  versionedSectionId: number,
): Promise<boolean> => {

  // If the section has no id then it has not yet been saved so throw an error
  if (!question.id) {
    throw new Error('Cannot publish unsaved Question');
  }

  // Intialize the new Version
  const versionedQuestion = new VersionedQuestion({
    versionedTemplateId,
    versionedSectionId,
    questionId: question.id,
    questionTypeId: question.questionTypeId,
    questionText: question.questionText,
    requirementText: question.requirementText,
    guidanceText: question.guidanceText,
    sampleText: question.sampleText,
    displayOrder: question.displayOrder,
    required: question.required,
    createdById: question.createdById,
    created: question.created,
    modifiedById: question.modifiedById,
    modified: question.modified,
  });

  try {
    const saved = await versionedQuestion.create(context);

    if (saved && (!saved.errors || (Array.isArray(saved.errors) && saved.errors.length === 0))) {
      // Version any QuestionConditions as well
      const questionConditions = await QuestionCondition.findByQuestionId('generateQuestionVersion', context, saved.questionId);
      let allConditionsWereVersioned = true;

      if (questionConditions.length > 0) {
        for (const condition of questionConditions) {
          const questionConditionInstance = new QuestionCondition({
            ...condition
          });

          const passed = await generateQuestionConditionVersion(context, questionConditionInstance, saved.id);
          if (!passed) {
            // If one of the conditions failed to version
            allConditionsWereVersioned = false;
          }
        }
      }


      // Only proceed if all the conditions were able to version properly
      if (allConditionsWereVersioned) {
        // Reset the dirty flag
        question.isDirty = false;
        const updated = await question.update(context, true);

        if (updated && (!updated.errors || (Array.isArray(updated.errors) && updated.errors.length === 0))) {
          return true;
        } else {
          // There were errors on the object so report them
          const msg = `Unable to generateQuestionVersion for question: ${question.id}, errs: ${updated.errors}`;
          formatLogMessage(logger).error(null, msg);
          throw new Error(msg);
        }
      }
    } else {
      // There were errors on the object so report them
      const msg = `Unable to generateQuestionVersion for versionedQuestion errs: ${saved.errors}`;
      formatLogMessage(logger).error(null, msg);
      throw new Error(msg);
    }
  } catch (err) {
    formatLogMessage(logger).error(err, `Unable to generateQuestionVersion for question: ${question.id}`);
    throw err
  }

  return false;
}

// Make a copy of the specified Question (excluding any related QuestionConditions)
export const cloneQuestion = (
  clonedById: number,
  templateId: number,
  sectionId: number,
  question: Question | VersionedQuestion
): Question => {
  // If the incoming is a VersionedQuestion, then use the questionId (the question it was based off of)
  const sourceId = Object.keys(question).includes('questionId') ? question['questionId'] : question.id;
  const questionCopy = new Question({
    templateId,
    sectionId,
    sourceQuestionId: sourceId,
    questionTypeId: question.questionTypeId,
    questionText: question.questionText,
    requirementText: question.requirementText,
    guidanceText: question.guidanceText,
    sampleText: question.sampleText,
    displayOrder: question.displayOrder,
    required: false,
    isDirty: true,
    createdById: question.createdById,
    created: question.created,
    modifiedById: question.modifiedById,
    modified: question.modified,
  });

  questionCopy.createdById = clonedById;
  return questionCopy;
}

// Creates a new Version/Snapshot the specified QuestionCondition (as a point in time snapshot)
//    - creates a new VersionedQuestionCondition
export const generateQuestionConditionVersion = async (
  context: MyContext,
  questionCondition: QuestionCondition,
  versionedQuestionId: number,
): Promise<boolean> => {
  // If the section has no id then it has not yet been saved so throw an error
  if (!questionCondition.id) {
    throw new Error('Cannot publish unsaved QuestionCondition');
  }

  // Intialize the new Version
  const versionedQuestionCondition = new VersionedQuestionCondition({
    versionedQuestionId,
    questionConditionId: questionCondition.id,
    action: questionCondition.action,
    conditionType: questionCondition.conditionType,
    conditionMatch: questionCondition.conditionMatch,
    target: questionCondition.target,
  });

  const created = await versionedQuestionCondition.create(context);
  if (created && (!created.errors || (Array.isArray(created.errors) && created.errors.length === 0))) {
    return true;
  } else {
    // There were errors on the object so report them
    const msg = `Unable to generateQuestionConditionVersion for questionCondition errs: ${created.errors}`
    formatLogMessage(logger).error(null, `${msg}, errs: ${created.errors}`);
    throw new Error(msg);
  }
}


export const getQuestionOptionsToRemove = async (questionOptions: QuestionOption[], context: MyContext, questionId: number): Promise<QuestionOption[]> => {
  //Get all the existing question options associated with this question
  const existingOptions = await QuestionOption.findByQuestionId('questionService', context, questionId);
  interface QuestionOptionWithId extends QuestionOption {
    questionOptionId?: number;  // Mark as optional if not always present
  }
  // Create a Set of question option ids
  const questionOptionIds = new Set(
    (questionOptions as QuestionOptionWithId[]).map(option => option.questionOptionId)
  );

  // Get options that exist in questionOptions table, but are not included in updated questionOptions
  const optionsToRemove = existingOptions.filter(existing => !questionOptionIds.has(existing.id))

  return Array.isArray(optionsToRemove) ? optionsToRemove : [];
}

