import { Resolvers } from "../types";
import { MyContext } from "../context";
import { VersionedQuestion } from "../models/VersionedQuestion";
import { VersionedSection } from "../models/VersionedSection";
import { Section } from "../models/Section";
import { hasPermissionOnQuestion } from "../services/questionService";
import { ForbiddenError } from "../utils/graphQLErrors";


export const resolvers: Resolvers = {
  Query: {
    publishedQuestions: async (_, { versionedSectionId }, context: MyContext): Promise<VersionedQuestion[]> => {
      // Grab the versionedSection so we can get the section, and then the templateId
      const versionedSection = await VersionedSection.findById('publishedQuestions resolver', context, versionedSectionId);
      const section = await Section.findById('publishedQuestions resolver', context, versionedSection.sectionId);
      if (await hasPermissionOnQuestion(context, section.templateId)) {
        return await VersionedQuestion.findByVersionedSectionId('publishedQuestions resolver', context, versionedSectionId);
      }
      throw ForbiddenError();
    },
  },
};
