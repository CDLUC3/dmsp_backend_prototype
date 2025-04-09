
import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";
import { ProjectOutput } from '../models/Output';
import { MetadataStandard } from '../models/MetadataStandard';
import { Project } from '../models/Project';
import { Repository } from '../models/Repository';
import { MyContext } from '../context';
import { isAuthorized } from '../services/authService';
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from '../utils/graphQLErrors';
import { hasPermissionOnProject } from '../services/projectService';
import { OutputType } from '../models/OutputType';
import { GraphQLError } from 'graphql';

// Process updates to the Repository associations
async function processRepositoryUpdates(
  reference: string,
  context: MyContext,
  projectOutputId: number,
  currentRepoIds: number[],
  newRepoIds: number[]
): Promise<string[]> {
  const out = [];
  // Use the helper function to determine which Repositories to keep
  const { idsToBeRemoved, idsToBeSaved } = ProjectOutput.reconcileAssociationIds(currentRepoIds, newRepoIds);

  const removeErrors = [];
  // Delete any Repository associations that were removed
  for (const id of idsToBeRemoved) {
    const repo = await Repository.findById(reference, context, id);
    if (repo) {
      const wasRemoved = repo.removeFromProjectOutput(context, projectOutputId);
      if (!wasRemoved) {
        removeErrors.push(id);
      }
    }
  }
  // if any errors were found when adding/removing repositories then return them
  if (removeErrors.length > 0) out.push(`unable to remove repositories: ${removeErrors.join(', ')}`);

  const addErrors = [];
  // Add any new Repository associations
  for (const id of idsToBeSaved) {
    const repo = await Repository.findById(reference, context, id);
    if (repo) {
      const wasAdded = repo.addToProjectOutput(context, projectOutputId);
      if (!wasAdded) {
        addErrors.push(id);
      }
    }
  }
  // if any errors were found when adding/removing repositories then return them
  if (addErrors.length > 0) {
    out.push(`unable to assign repositories: ${addErrors.join(', ')}`);
  }

  return out;
}

// Process updates to the MetadataStandard associations
async function processMetadataStandardUpdates(
  reference: string,
  context: MyContext,
  projectOutputId: number,
  currentStandardIds: number[],
  newStandardIds: number[]
): Promise<string[]> {
  const out = [];
  // Use the helper function to determine which MetadataStandards to keep
  const { idsToBeRemoved, idsToBeSaved } = ProjectOutput.reconcileAssociationIds(currentStandardIds, newStandardIds);

  const removeErrors = [];
  // Delete any MetadataStandards associations that were removed
  for (const id of idsToBeRemoved) {
    const standard = await MetadataStandard.findById(reference, context, id);
    if (standard) {
      const wasRemoved = standard.removeFromProjectOutput(context, projectOutputId);
      if (!wasRemoved) {
        removeErrors.push(id);
      }
    }
  }
  // if any errors were found when adding/removing metadata standards then return them
  if (removeErrors.length > 0) out.push(`unable to remove metadata standards: ${removeErrors.join(', ')}`);

  const addErrors = [];
  // Add any new MetadataStandards associations
  for (const id of idsToBeSaved) {
    const standard = await MetadataStandard.findById(reference, context, id);
    if (standard) {
      const wasAdded = standard.addToProjectOutput(context, projectOutputId);
      if (!wasAdded) {
        addErrors.push(id);
      }
    }
  }
  // if any errors were found when adding/removing metadata standards then return them
  if (addErrors.length > 0) {
    out.push(`unable to assign metadata standards: ${addErrors.join(', ')}`);
  }

  return out;
}

export const resolvers: Resolvers = {
  Query: {
    // Fetch all of the possible project output types
    outputTypes: async (_, __, context: MyContext): Promise<OutputType[]> => {
      const reference = 'outputTypes resolver';
      try {
        if (isAuthorized(context.token)) {
          return await OutputType.all(reference, context);
        }

        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // return all of the outputs for the project
    projectOutputs: async (_, { projectId }, context: MyContext): Promise<ProjectOutput[]> => {
      const reference = 'projectFunders resolver';
      try {
        if (isAuthorized(context.token)) {
          const project = await Project.findById(reference, context, projectId);

          if (project && await hasPermissionOnProject(context, project)) {
            return await ProjectOutput.findByProjectId(reference, context, projectId);
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // return a specific project output
    projectOutput: async (_, { projectOutputId }, context: MyContext): Promise<ProjectOutput> => {
      const reference = 'projectFunder resolver';
      try {
        if (isAuthorized(context.token)) {
          const projectFunder = await ProjectOutput.findById(reference, context, projectOutputId);
          const project = await Project.findById(reference, context, projectFunder.projectId);

          if (project && await hasPermissionOnProject(context, project)) {
            return projectFunder;
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

  Mutation: {
    // add a new ProjectOutput
    addProjectOutput: async (_, { input }, context: MyContext) => {
      const reference = 'addprojectFunder resolver';
      try {
        if (isAuthorized(context.token)) {
          const project = await Project.findById(reference, context, input.projectId);
          if (!project || !(await hasPermissionOnProject(context, project))) {
            throw ForbiddenError();
          }

          const newOutput = new ProjectOutput(input);
          const created = await newOutput.create(context, project.id);

          if (!created?.id) {
            // A null was returned so add a generic error and return it
            if (!newOutput.errors['general']) {
              newOutput.addError('general', 'Unable to create Project Output');
            }
            return newOutput;
          }

          if (created && !created.hasErrors()) {
            // Process the Repository and MetadataStandard associations
            const repoErrors = await processRepositoryUpdates(
              reference,
              context,
              created.id,
              [],
              input.respositoryIds
            );
            const standardErrors = await processMetadataStandardUpdates(
              reference,
              context,
              created.id,
              [],
              input.metadataStandardIds
            );

            if (repoErrors.length > 0) {
              created.addError('repositories', `Create complete but ${repoErrors.join('. ')}`);
            }
            if (standardErrors.length > 0) {
              created.addError('metadataStandards', `Create complete but ${standardErrors.join('. ')}`);
            }

            // If there were no errors reload since the roles may have changed
            if (!created.hasErrors()) {
              await ProjectOutput.findById(reference, context, created.id);
            }
          }

          return created;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // update an existing ProjectOutput
    updateProjectOutput: async (_, { input }, context) => {
      const reference = 'updateProjectOutput resolver';
      try {
        if (isAuthorized(context.token)) {
          const output = await ProjectOutput.findById(reference, context, input.projectOutputId);
          if (!output) {
            throw NotFoundError();
          }

          // Only allow the owner of the project to edit it
          const project = await Project.findById(reference, context, output.projectId);
          if (!(await hasPermissionOnProject(context, project))) {
            throw ForbiddenError();
          }

          const toUpdate = new ProjectOutput(input);
          const updated = await toUpdate.update(context);

          if (updated && !updated.hasErrors()) {
            // Fetch all of the current Repositories and MetadataStandards associated with this Output
            const repos = await Repository.findByProjectOutputId(reference, context, output.id);
            const standards = await MetadataStandard.findByProjectOutputId(reference, context, output.id);
            const currentRepoIds = repos ? repos.map((d) => d.id) : [];
            const currentStandardIds = standards ? standards.map((d) => d.id) : [];

            // Process the Repository and MetadataStandard associations
            const repoErrors = await processRepositoryUpdates(
              reference,
              context,
              output.id,
              currentRepoIds,
              input.respositoryIds
            );
            const standardErrors = await processMetadataStandardUpdates(
              reference,
              context,
              output.id,
              currentStandardIds,
              input.metadataStandardIds
            );

            if (repoErrors.length > 0) {
              updated.addError('repositories', `Update completed but ${repoErrors.join('. ')}`);
            }
            if (standardErrors.length > 0) {
              updated.addError('metadataStandards', `Update completed but ${standardErrors.join('. ')}`);
            }

            // If there were no errors reload since the roles may have changed
            if (!updated.hasErrors()) {
              return await ProjectOutput.findById(reference, context, output.id);
            }
          }
          // Otherwise there were errors so return the object with errors
          return updated;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // delete an existing ProjectOutput
    removeProjectOutput: async (_, { projectOutputId }, context) => {
      const reference = 'removeProjectOutput resolver';
      try {
        if (isAuthorized(context.token)) {
          const output = await ProjectOutput.findById(reference, context, projectOutputId);
          if (!output) {
            throw NotFoundError();
          }

          // Only allow the owner of the project to delete it
          const project = await Project.findById(reference, context, output.projectId);
          if (!(await hasPermissionOnProject(context, project))) {
            throw ForbiddenError();
          }

          const deleted = await output.delete(context);
          // No need to remove the related repsoitory and metadata standards associations
          // the DB will cascade the deletion.
          return deleted
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  ProjectOutput: {
    project: async (parent: ProjectOutput, _, context: MyContext): Promise<Project> => {
      return await Project.findById('Chained ProjectOutput.project', context, parent.projectId);
    },
    outputType: async (parent: ProjectOutput, _, context: MyContext): Promise<OutputType> => {
      return await OutputType.findById('Chained ProjectOutput.outputType', context, parent.outputTypeId);
    },
    repositories: async (parent: ProjectOutput, _, context: MyContext): Promise<Repository[]> => {
      return await Repository.findByProjectOutputId(
        'Chained ProjectOutput.repositories',
        context,
        parent.id
      );
    },
    metadataStandards: async (parent: ProjectOutput, _, context: MyContext): Promise<MetadataStandard[]> => {
      return await MetadataStandard.findByProjectOutputId(
        'Chained ProjectOutput.metadataStandards',
        context,
        parent.id
      );
    }
  },
};
