import { Resolvers } from "../types";
import { MyContext } from "../context";
import { VersionedQuestion } from "../models/VersionedQuestion";
import { VersionedSection } from "../models/VersionedSection";
import { Section } from "../models/Section";
import { hasPermissionOnQuestion } from "../services/questionService";
import { AuthenticationError, ForbiddenError, InternalServerError } from "../utils/graphQLErrors";
import { VersionedQuestionCondition } from "../models/VersionedQuestionCondition";
import { prepareObjectForLogs } from "../logger";
import { isAdmin } from "../services/authService";
import { GraphQLError } from "graphql";

export const resolvers: Resolvers = {
  Query: {
    // return all of the published questions for the specified versioned section
    publishedQuestions: async (_, { versionedSectionId }, context: MyContext): Promise<VersionedQuestion[]> => {
      const reference = 'publishedQuestions resolver';
      try {
        if (isAdmin(context?.token)) {
          // Grab the versionedSection so we can get the section, and then the templateId
          const versionedSection = await VersionedSection.findById(reference, context, versionedSectionId);
          const section = await Section.findById(reference, context, versionedSection.sectionId);
          if (await hasPermissionOnQuestion(context, section.templateId)) {
            return await VersionedQuestion.findByVersionedSectionId(reference, context, versionedSectionId);
          }
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
    // Chained resolver to return the VersionedQuestionConditionss associated with this VersionedQuestion
    versionedQuestionConditions: async (parent: VersionedQuestion, _, context: MyContext): Promise<VersionedQuestionCondition[]> => {
      return await VersionedQuestionCondition.findByVersionedQuestionId(
        'Chained VersionedQuestion.versionedQuestionConditions',
        context,
        parent.id
      );
    },
  }
};
