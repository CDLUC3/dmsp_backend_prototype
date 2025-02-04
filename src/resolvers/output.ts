
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

// Process updates to the Repository associations
async function processRepositoryUpdates(
  reference: string,
  context: MyContext,
  projectOutputId: number,
  currentRepoIds: number[],
  newRepoIds: number[]
) {
  // Use the helper function to determine which Repositories to keep
  const { idsToBeRemoved, idsToBeSaved } = ProjectOutput.reconcileAssociationIds(currentRepoIds, newRepoIds);

  // Delete any Repository associations that were removed
  for (const id of idsToBeRemoved) {
    const repo = await Repository.findById(reference, context, id);
    if (repo) repo.removeFromProjectOutput(context, projectOutputId)
  }
  // Add any new Repository associations
  for (const id of idsToBeSaved) {
    const repo = await Repository.findById(reference, context, id);
    if (repo) repo.addToProjectOutput(context, projectOutputId)
  }
}

// Process updates to the MetadataStandard associations
async function processMetadataStandardUpdates(
  reference: string,
  context: MyContext,
  projectOutputId: number,
  currentStandardIds: number[],
  newStandardIds: number[]
) {
  // Use the helper function to determine which MetadataStandards to keep
  const { idsToBeRemoved, idsToBeSaved } = ProjectOutput.reconcileAssociationIds(currentStandardIds, newStandardIds);

  // Delete any MetadataStandards associations that were removed
  for (const id of idsToBeRemoved) {
    const standard = await MetadataStandard.findById(reference, context, id);
    if (standard) standard.removeFromProjectOutput(context, projectOutputId)
  }
  // Add any new MetadataStandards associations
  for (const id of idsToBeSaved) {
    const standard = await MetadataStandard.findById(reference, context, id);
    if (standard) standard.addToProjectOutput(context, projectOutputId)
  }
}

export const resolvers: Resolvers = {
  Query: {
    // Fetch all of the possible project output types
    outputTypes: async (_, __, context: MyContext): Promise<OutputType[]> => {
      const reference = 'outputTypes resolver';
      try {
        if (isAuthorized(context.token)) return await OutputType.all(reference, context);

        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
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

          if (project && hasPermissionOnProject(context, project)) {
            return await ProjectOutput.findByProjectId(reference, context, projectId);
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
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

          if (project && hasPermissionOnProject(context, project)) return projectFunder;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
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
          if (!project || !hasPermissionOnProject(context, project)) throw ForbiddenError();

          const newOutput = new ProjectOutput(input);
          const created = await newOutput.create(context, project.id);

          // If any Repositories were specified and there were no errors creating the record
          if (Array.isArray(input.respositoryIds)) {
            if (created && Array.isArray(created.errors) && created.errors.length === 0){
              // Add any Repository associations
              for (const id of input.respositoryIds) {
                const repo = await Repository.findById(reference, context, id);
                if (repo) await repo.addToProjectOutput(context, created.id);
              }
            }
          }

          // If any MetadataStandards were specified and there were no errors creating the record
          if (Array.isArray(input.metadataStandardIds)) {
            if (created && Array.isArray(created.errors) && created.errors.length === 0){
              // Add any MetadataStandard associations
              for (const id of input.metadataStandardIds) {
                const standard = await MetadataStandard.findById(reference, context, id);
                if (standard) await standard.addToProjectOutput(context, created.id);
              }
            }
          }

          return created;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    updateProjectOutput: async (_, { input }, context) => {
      const reference = 'updateProjectOutput resolver';
      try {
        if (isAuthorized(context.token)) {
          const output = await ProjectOutput.findById(reference, context, input.projectOutputId);
          if (!output) throw NotFoundError();

          // Only allow the owner of the project to edit it
          const project = await Project.findById(reference, context, output.projectId);
          if (!hasPermissionOnProject(context, project)) throw ForbiddenError();

          const toUpdate = new ProjectOutput(input);
          const updated = await toUpdate.update(context);

          if (updated && Array.isArray(updated.errors) && updated.errors.length === 0){
            // Fetch all of the current Repositories and MetadataStandards associated with this Output
            const repos = await Repository.findByProjectOutputId(reference, context, output.id);
            const standards = await MetadataStandard.findByProjectOutputId(reference, context, output.id);
            const currentRepoIds = repos ? repos.map((d) => d.id) : [];
            const currentStandardIds = standards ? standards.map((d) => d.id) : [];

            // Process the Repository and MetadataStandard associations
            processRepositoryUpdates(reference, context, output.id, currentRepoIds, input.respositoryIds);
            processMetadataStandardUpdates(reference, context, output.id, currentStandardIds, input.metadataStandardIds);

            // Reload since the roles may have changed
            return await ProjectOutput.findById(reference, context, output.id);
          }
          // Otherwise there were errors so return the object with errors
          return updated;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch(err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    removeProjectOutput: async (_, { projectOutputId }, context) => {
      const reference = 'removeProjectOutput resolver';
      try {
        if (isAuthorized(context.token)) {
          const output = await ProjectOutput.findById(reference, context, projectOutputId);
          if (!output) throw NotFoundError();

          // Only allow the owner of the project to delete it
          const project = await Project.findById(reference, context, output.projectId);
          if (!hasPermissionOnProject(context, project)) throw ForbiddenError();

          const deleted = await output.delete(context);
          // No need to remove the related repsoitory and metadata standards associations
          // the DB will cascade the deletion.
          return deleted
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch(err) {
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
