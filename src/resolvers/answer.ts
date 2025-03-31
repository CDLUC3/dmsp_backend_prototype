import { GraphQLError } from "graphql";
import { MyContext } from "../context";
import { Plan } from "../models/Plan";
import { formatLogMessage } from "../logger";
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from "../utils/graphQLErrors";
import { Project } from "../models/Project";
import { isAuthorized } from "../services/authService";
import { hasPermissionOnProject } from "../services/projectService";
import { Resolvers } from "../types";
import { Answer } from "../models/Answer";
import { VersionedQuestion } from "../models/VersionedQuestion";
import { VersionedSection } from "../models/VersionedSection";
import { AnswerComment } from "../models/AnswerComment";
import { addVersion } from "../models/PlanVersion";

export const resolvers: Resolvers = {
  Query: {
    // return all of the projects that the current user owns or is a collaborator on
    answers: async (_, { projectId, planId, versionedSectionId }, context: MyContext): Promise<Answer[]> => {
      const reference = 'planSectionAnswers resolver';
      try {
        if (isAuthorized(context.token)) {
          const project = await Project.findById(reference, context, projectId);
          if (!project) {
            throw NotFoundError(`Project with ID ${projectId} not found`);
          }
          if (await hasPermissionOnProject(context, project)) {
            return await Answer.findByPlanIdAndVersionedSectionId(reference, context, planId, versionedSectionId);
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Find the plan by its id
    answer: async (_, { projectId, answerId }, context: MyContext): Promise<Answer> => {
      const reference = 'plan resolver';
      try {
        const project = await Project.findById(reference, context, projectId);
        if (project && await hasPermissionOnProject(context, project)) {
          return await Answer.findById(reference, context, answerId);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  Mutation: {
    // Create a new plan
    addAnswer: async (_, { planId, versionedSectionId, versionedQuestionId, answerText }, context: MyContext): Promise<Answer> => {
      const reference = 'addAnswer resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findById(reference, context, planId);
          if (!plan) {
            throw NotFoundError(`Plan with ID ${planId} not found`);
          }
          const project = await Project.findById(reference, context, plan.projectId);
          if (!project) {
            throw NotFoundError(`Project with ID ${plan.projectId} not found`);
          }

          if (await hasPermissionOnProject(context, project)) {
            const answer = new Answer({ planId, versionedSectionId, versionedQuestionId, answerText });
            const newAnswer = await answer.create(context);
            if (newAnswer && !newAnswer.hasErrors()) {
              // Version the plan
              await addVersion(context, plan, reference);
            }
            return newAnswer;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Delete a plan
    updateAnswer: async (_, { answerId, answerText }, context: MyContext): Promise<Answer> => {
      const reference = 'updateAnswer resolver';
      try {
        if (isAuthorized(context.token)) {
          const answer = await Answer.findById(reference, context, answerId);
          if (!answer) {
            throw NotFoundError(`Answer with ID ${answerId} not found`);
          }
          const plan = await Plan.findById(reference, context, answer.planId);
          if (!plan) {
            throw NotFoundError(`Plan ${answer.planId} not found`);
          }
          const project = await Project.findById(reference, context, plan.projectId);
          if (await hasPermissionOnProject(context, project)) {
            answer.answerText = answerText;
            const updatedAnswer = await answer.update(context);

            if (updatedAnswer && !updatedAnswer.hasErrors()) {
              // Version the plan
              await addVersion(context, plan, reference);
            }

            return updatedAnswer;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  Answer: {
    // The project the plan is associated with
    plan: async (parent: Answer, _, context: MyContext): Promise<Plan> => {
      if (parent?.planId) {
        return await Plan.findById('Answer plan resolver', context, parent.planId);
      }
      return null;
    },
    // The template the plan is based on
    versionedSection: async (parent: Answer, _, context: MyContext): Promise<VersionedSection> => {
      if (parent?.versionedSectionId) {
        return await VersionedSection.findById('Answer versionedSection resolver', context, parent.versionedSectionId);
      }
      return null;
    },
    // The contributors to the plan
    versionedQuestion: async (parent: Answer, _, context: MyContext): Promise<VersionedQuestion> => {
      if (parent?.versionedQuestionId) {
        return await VersionedQuestion.findById('Answer versionedQuestion resolver', context, parent.versionedQuestionId);
      }
      return null;
    },
    // The comments associated with the answer
    comments: async (parent: Answer, _, context: MyContext): Promise<AnswerComment[]> => {
      if (parent?.id) {
        return await AnswerComment.findByAnswerId('Answer comments resolver', context, parent.id);
      }
      return [];
    },
  },
}
