import { Resolvers } from "../types";
import { MyContext } from "../context";
import { VersionedQuestionCondition } from "../models/VersionedQuestionCondition";
import { VersionedQuestion } from "../models/VersionedQuestion";
import { Question } from "../models/Question";
import { hasPermissionOnQuestion } from "../services/questionService";
import { ForbiddenError } from "../utils/graphQLErrors";


export const resolvers: Resolvers = {
  Query: {
    publishedConditionsForQuestion: async (_, { versionedQuestionId }, context: MyContext): Promise<VersionedQuestionCondition[]> => {
      // Grab the versionedQuestion so we can get the question, and then the templateId
      const versionedQuestion = await VersionedQuestion.findById('publishedConditionsForQuestion resolver', context, versionedQuestionId);
      const question = await Question.findById('publishedConditionsForQuestion resolver', context, versionedQuestion.questionId);

      if (await hasPermissionOnQuestion(context, question.templateId)) {
        return await VersionedQuestionCondition.findByVersionedQuestionId('publishedQuestions resolver', context, versionedQuestionId);
      }
      throw ForbiddenError();
    },
  },
};
