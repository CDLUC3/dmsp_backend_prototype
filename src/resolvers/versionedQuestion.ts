import {
  Resolvers,
  CustomizableObjectOwnership,
  Affiliation as AffiliationGQL,
  VersionedCustomQuestion as VersionedCustomQuestionGQL,
} from "../types.js";
import { MyContext } from "../context.js";
import { VersionedQuestion } from "../models/VersionedQuestion.js";
import { VersionedCustomQuestion } from "../models/VersionedCustomQuestion.js";
import { Answer } from "../models/Answer.js";
import { AuthenticationError, ForbiddenError, InternalServerError } from "../utils/graphQLErrors.js";
import { VersionedQuestionCondition } from "../models/VersionedQuestionCondition.js";
import { prepareObjectForLogs } from "../logger.js";
import { isAuthorized } from "../services/authService.js";
import { GraphQLError } from "graphql";
import { isNullOrUndefined, normaliseDateTime } from "../utils/helpers.js";
import { VersionedTemplate } from "../models/VersionedTemplate.js";
import { VersionedTemplateCustomization } from "../models/VersionedTemplateCustomization.js";
import { VersionedQuestionCustomization } from "../models/VersionedQuestionCustomization.js";
import { Affiliation } from "../models/Affiliation.js";


interface PublishedQuestionResult {
  id: number;
  questionText: string;
  requirementText?: string;
  guidanceText?: string;
  sampleText?: string;
  required: boolean;
  hasAnswer: boolean;
  questionType: CustomizableObjectOwnership;
  // Type-specific IDs — one will always be present depending on questionType
  versionedQuestionId?: number;  // present when questionType === 'BASE'
  customQuestionId?: number;     // present when questionType === 'CUSTOM'
  json?: string;                 // present when questionType === 'CUSTOM'
}


export const resolvers: Resolvers = {
  Query: {
    // return all published questions for the specified versioned section. Returns both base and custom questions, and 
    // includes a flag for if the question has an answer for the specified plan
    publishedQuestions: async (_, { planId, versionedSectionId }, context: MyContext): Promise<PublishedQuestionResult[]> => {
      const reference = 'publishedQuestionsWithAnsweredFlag resolver';
      try {
        if (isAuthorized(context.token)) {
          const [baseQuestionsRaw, customQuestionsRaw] = await Promise.all([
            VersionedQuestion.findByVersionedSectionId(reference, context, versionedSectionId),
            VersionedCustomQuestion.findByVersionedSectionIdAndType(reference, context, versionedSectionId, 'BASE')
          ]);

          // Persisted records always have an id; filter defensively so downstream code can
          // treat `id` as required without further null checks.
          const baseQuestions = baseQuestionsRaw.filter((q): q is typeof q & { id: number } => !isNullOrUndefined(q.id));
          const customQuestions = customQuestionsRaw.filter((q): q is typeof q & { id: number } => !isNullOrUndefined(q.id));

          const baseIds = baseQuestions.map(q => q.id);
          const customIds = customQuestions.map(q => q.id);

          const [baseAnswers, customAnswers] = await Promise.all([
            Answer.findFilledAnswersByQuestionIds(reference, context, planId, baseIds),
            Answer.findFilledAnswersByCustomQuestionIds(reference, context, planId, customIds)
          ]);

          const baseAnswersMap = new Set(baseAnswers.map(a => a.versionedQuestionId));
          const customAnswersMap = new Set(customAnswers.map(a => a.versionedCustomQuestionId));

          // Build ordered list starting with base questions
          const ordered: PublishedQuestionResult[] = baseQuestions.map(q => ({
            id: q.id,
            questionText: q.questionText,
            requirementText: q.requirementText,
            guidanceText: q.guidanceText,
            sampleText: q.sampleText,
            required: q.required,
            hasAnswer: baseAnswersMap.has(q.id),
            questionType: 'BASE' as CustomizableObjectOwnership,
            versionedQuestionId: q.id,
            customQuestionId: undefined,
          }));

          // Sort custom questions by id (same as injectCustomQuestions)
          const sortedCustom = [...customQuestions].sort((a, b) => a.id - b.id);

          // Splice each custom question in after its pinned question
          for (const q of sortedCustom) {
            const result: PublishedQuestionResult = {
              id: q.id,
              questionText: q.questionText ?? '',
              requirementText: q.requirementText,
              guidanceText: q.guidanceText,
              sampleText: q.sampleText,
              required: q.required,
              hasAnswer: customAnswersMap.has(q.id),
              questionType: 'CUSTOM' as CustomizableObjectOwnership,
              versionedQuestionId: undefined,
              customQuestionId: q.id,
            };

            if (q.pinnedVersionedQuestionId === null) {
              // No pin — goes first
              ordered.unshift(result);
            } else {
              const pinIdx = ordered.findIndex(o =>
                o.questionType === q.pinnedVersionedQuestionType && o.id === q.pinnedVersionedQuestionId
              );
              if (pinIdx !== -1) {
                ordered.splice(pinIdx + 1, 0, result);
              } else {
                // Pinned question not found — append to end
                ordered.push(result);
              }
            }
          }

          return ordered;
        }
        // Unauthorized
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // This only returns custom questions for a specified custom section, and include a flag for if the question has an answer for the specified plan
    publishedCustomQuestions: async (_, { planId, versionedCustomSectionId }, context: MyContext): Promise<PublishedQuestionResult[]> => {
      const reference = 'publishedCustomQuestionsWithAnsweredFlag resolver';
      try {
        if (isAuthorized(context.token)) {
          const questionsRaw = await VersionedCustomQuestion.findByVersionedCustomSectionId(
            reference, context, versionedCustomSectionId
          );

          // Persisted records always have an id; filter defensively so downstream code can
          // treat `id` as required without further null checks.
          const questions = questionsRaw.filter((q): q is typeof q & { id: number } => !isNullOrUndefined(q.id));

          const questionIds = questions.map(q => q.id);
          const answers = await Answer.findFilledAnswersByCustomQuestionIds(
            reference, context, planId, questionIds
          );

          const answersMap = new Set(answers.map(a => a.versionedCustomQuestionId));

          return questions.map(q => ({
            id: q.id,
            questionText: q.questionText ?? '',
            requirementText: q.requirementText,
            guidanceText: q.guidanceText,
            sampleText: q.sampleText,
            required: q.required,
            hasAnswer: answersMap.has(q.id),
            questionType: 'CUSTOM' as const,
            versionedQuestionId: undefined,
            customQuestionId: q.id,
            json: q.json,
          }));
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;
        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Return the VersionedQuestion for the specified versionedQuestionId which includes customization
    // sample text, guidance text, and info on the org that customized it
    publishedQuestion: async (_, { versionedQuestionId }, context: MyContext) => {
      const reference = 'publishedQuestion resolver';
      try {
        if (isAuthorized(context?.token)) {
          const [question, customization] = await Promise.all([
            VersionedQuestion.findById(reference, context, versionedQuestionId),
            VersionedQuestionCustomization.findActiveByTemplateAffiliationAndQuestion(
              reference, context, context.token.affiliationId, versionedQuestionId
            ),
          ]);

          if (!question) return null;

          return {
            ...question,
            customizationId: customization?.id ?? null,
            customizationGuidanceText: customization?.guidanceText ?? null,
            customizationSampleText: customization?.sampleText ?? null,
            customizationAffiliationId: customization ? context.token.affiliationId : null,
          };
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    publishedCustomQuestion: async (_, { versionedCustomQuestionId }, context: MyContext) => {
      const reference = 'publishedCustomQuestion resolver';
      try {
        if (isAuthorized(context?.token)) {
          const versionedCustomQuestion = await VersionedCustomQuestion.findById(
            reference, context, versionedCustomQuestionId
          );
          return versionedCustomQuestion as unknown as VersionedCustomQuestionGQL;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  VersionedCustomQuestion: {
    ownerAffiliation: async (parent, _, context: MyContext) => {
      const reference = 'VersionedCustomQuestion.ownerAffiliation resolver';
      const vtc = await VersionedTemplateCustomization.findById(
        reference, context, parent.versionedTemplateCustomizationId
      );
      if (!vtc?.currentVersionedTemplateId) return null;
      const versionedTemplate = await VersionedTemplate.findById(
        reference, context, vtc.currentVersionedTemplateId
      );
      if (!versionedTemplate?.ownerId) return null;
      const affiliation = await Affiliation.findByURI(reference, context, versionedTemplate.ownerId);
      return affiliation as unknown as AffiliationGQL;
    },
    created: (parent) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent) => {
      return normaliseDateTime(parent.modified);
    },
  },

  VersionedQuestion: {
    // Chained resolver to return the VersionedQuestionConditions associated with this VersionedQuestion
    versionedQuestionConditions: async (parent, _, context: MyContext) => {
      if (isNullOrUndefined(parent.id)) return [];
      return await VersionedQuestionCondition.findByVersionedQuestionConditionGroupId(
        'Chained VersionedQuestion.versionedQuestionConditions',
        context,
        parent.id
      );
    },
    ownerAffiliation: async (parent, _, context: MyContext) => {
      const reference = 'VersionedQuestion.ownerAffiliation resolver';
      const versionedTemplate = await VersionedTemplate.findById(
        reference,
        context,
        parent.versionedTemplateId
      );
      if (!versionedTemplate?.ownerId) return null;
      const affiliation = await Affiliation.findByURI(
        reference,
        context,
        versionedTemplate.ownerId
      );
      return affiliation as unknown as AffiliationGQL;
    },
    // `customizationAffiliationId` is not part of the GraphQL VersionedQuestion type — it's a
    // synthetic field stitched onto the parent by the `publishedQuestion` query resolver above.
    customizationOwnerAffiliation: async (parent, _, context: MyContext) => {
      const model = parent as unknown as VersionedQuestion & { customizationAffiliationId?: string };
      if (!model.customizationAffiliationId) return null;
      const affiliation = await Affiliation.findByURI(
        'VersionedQuestion.customizationOwnerAffiliation resolver',
        context,
        model.customizationAffiliationId
      );
      return affiliation as unknown as AffiliationGQL;
    },
    created: (parent) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent) => {
      return normaliseDateTime(parent.modified);
    }
  }
};
