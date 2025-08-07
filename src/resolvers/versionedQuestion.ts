import { Resolvers } from "../types";
import { MyContext } from "../context";
import { VersionedQuestion } from "../models/VersionedQuestion";
import { Answer } from "../models/Answer";
import { AuthenticationError, ForbiddenError, InternalServerError } from "../utils/graphQLErrors";
import { VersionedQuestionCondition } from "../models/VersionedQuestionCondition";
import { prepareObjectForLogs } from "../logger";
import { isAuthorized } from "../services/authService";
import { GraphQLError } from "graphql";
import { normaliseDateTime } from "../utils/helpers";

type VersionedQuestionWithFilled = VersionedQuestion & { hasAnswer: boolean };
// Define the interface for VersionedQuestionWithFilled
/*
interface VersionedQuestionWithFilled {
  id: number;
  createdById: number;
  created: string;
  modifiedById: number;
  modified: string;
  errors: Record<string, string>;
  versionedTemplateId: number;
  versionedSectionId: number;
  questionId: number;
  displayOrder?: number;
  json: string;
  questionText: string;
  requirementText?: string;
  guidanceText?: string;
  sampleText?: string;
  useSampleTextAsDefault?: boolean;
  required?: boolean;
  versionedQuestionConditions?: VersionedQuestionCondition[];
  hasAnswer: boolean;
}
*/

export const resolvers: Resolvers = {
  Query: {
    // return all of the published questions for the specified versioned section
    publishedQuestions: async (_, { versionedSectionId }, context: MyContext): Promise<VersionedQuestionWithFilled[]> => {
      const reference = 'publishedQuestions resolver';
      try {
        if (isAuthorized(context.token)) {
          const questions = await VersionedQuestion.findByVersionedSectionId(reference, context, versionedSectionId);

          // Fetch answers for the questions
          const questionIds = questions.map(q => q.id);
          const answers = await Answer.findFilledAnswersByQuestionIds(context, questionIds);

          // Map the answers to the questions
          const answersMap = new Set(answers.map(a => a.versionedQuestionId));
          return questions.map(question => ({
            ...question,
            hasAnswer: answersMap.has(question.id),
          })) as VersionedQuestionWithFilled[];
        }
        // Unauthorized!
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    publishedQuestion: async (_, { versionedQuestionId }, context: MyContext): Promise<VersionedQuestion> => {
      const reference = 'publishedQuestion resolver';
      try {
        if (isAuthorized(context?.token)) {
          // Grab the versionedSection so we can get the section, and then the templateId
          return await VersionedQuestion.findById(reference, context, versionedQuestionId);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  VersionedQuestion: {
    // Chained resolver to return the VersionedQuestionConditions associated with this VersionedQuestion
    versionedQuestionConditions: async (parent: VersionedQuestion, _, context: MyContext): Promise<VersionedQuestionCondition[]> => {
      return await VersionedQuestionCondition.findByVersionedQuestionId(
        'Chained VersionedQuestion.versionedQuestionConditions',
        context,
        parent.id
      );
    },
    created: (parent: VersionedQuestion) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent: VersionedQuestion) => {
      return normaliseDateTime(parent.modified);
    }
  }
};
