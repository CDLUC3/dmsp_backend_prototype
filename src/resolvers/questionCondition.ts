import { Resolvers } from "../types";
import { MyContext } from "../context";
import { QuestionCondition } from "../models/QuestionCondition";
import { NotFoundError, ForbiddenError, AuthenticationError, InternalServerError } from "../utils/graphQLErrors";
import { isAdmin } from "../services/authService";
import { hasPermissionOnQuestion } from "../services/questionService";
import { Question } from "../models/Question";
import { formatLogMessage } from "../logger";


export const resolvers: Resolvers = {
  Query: {
    // return all of the question conditions for the specified question
    questionConditions: async (_, { questionId }, context: MyContext): Promise<QuestionCondition[]> => {
      try {
        return await QuestionCondition.findByQuestionId('questionConditions resolver', context, questionId);
      } catch (err) {
        formatLogMessage(context).error(err, 'Failure in questionConditions resolver');
        throw InternalServerError();
      }
    },
  },
  Mutation: {
    // add a new question condition
    addQuestionCondition: async (_, { input: {
      questionId,
      action,
      conditionType,
      conditionMatch,
      target } }, context: MyContext): Promise<QuestionCondition> => {

      try {
        // If the user is an admin and has permission on the question
        if (isAdmin(context.token) && hasPermissionOnQuestion(context, questionId)) {
          const condition = new QuestionCondition({ questionId, action, conditionType, conditionMatch, target });
          const created = await condition.create(context);

          if (created?.id) {
            return created;
          }

          // A null was returned so add a generic error and return it
          if (!condition.errors['general']) {
            condition.addError('general', 'Unable to create Question Condition');
          }
          return condition;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        formatLogMessage(context).error(err, 'Failure in addQuestionCondition resolver');
        throw InternalServerError();
      }
    },

    // update an existing question condition
    updateQuestionCondition: async (_, { input: {
      questionConditionId,
      action,
      conditionType,
      conditionMatch,
      target } }, context: MyContext): Promise<QuestionCondition> => {

      const reference = 'updateQuestionCondition resolver';
      try {
        if (isAdmin(context.token)) {
          // Get QuestionCondition based on provided questionConditionId
          const questionConditionData = await QuestionCondition.findById(reference, context, questionConditionId);

          // Throw Not Found error if QuestionConditionData is not found
          if (!questionConditionData) {
            throw NotFoundError('QuestionCondition not found');
          }

          const question = await Question.findById(reference, context, questionConditionData.questionId);
          // If the user has permission on the Question
          if (await hasPermissionOnQuestion(context, question.templateId)) {
            const questionCondition = new QuestionCondition({
              id: questionConditionId,
              questionId: questionConditionData.questionId,
              action: action || questionConditionData.action,
              createdById: questionConditionData.createdById,
              condition: conditionType || questionConditionData.conditionType,
              conditionMatch: conditionMatch || questionConditionData.conditionMatch,
              target: target || questionConditionData.target
            });

            return await questionCondition.update(context);
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // remove a question condition
    removeQuestionCondition: async (_, { questionConditionId }, context: MyContext): Promise<QuestionCondition> => {
      const reference = 'removeQuestionCondition resolver';
      try {
        if (isAdmin(context.token)) {
          // Retrieve existing questionCondition
          const questionConditionData = await QuestionCondition.findById(reference, context, questionConditionId);

          // Throw Not Found error if QuestionConditionData is not found
          if (!questionConditionData) {
            throw NotFoundError('QuestionCondition not found');
          }

          const question = await Question.findById(reference, context, questionConditionId);
          // If the user has permission on the Question
          if (await hasPermissionOnQuestion(context, question.templateId)) {
            //Need to create a new instance of QuestionCondition so that it recognizes the 'delete' function of that instance
            const questionCondition = new QuestionCondition({ ...questionConditionData, id: questionConditionId });
            return await questionCondition.delete(context);
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },
};
