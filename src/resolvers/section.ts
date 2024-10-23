import { Resolvers } from "../types";
import { MyContext } from "../context";
import { Section } from "../models/Section";
import { SectionTag } from "../models/SectionTag";
import { VersionedSection } from "../models/VersionedSection";
import { Tag } from "../models/Tag";
import { Template } from "../models/Template";
import { cloneSection, hasPermissionOnSection, getTagsToAdd } from "../services/sectionService";
import { ForbiddenError, NotFoundError, BadUserInput } from "../utils/graphQLErrors";


export const resolvers: Resolvers = {
  Query: {
    sections: async (_, { templateId }, context: MyContext): Promise<Section[]> => {

      if (await hasPermissionOnSection(context, templateId)) {
        return await Section.findByTemplateId('sections resolver', context, templateId);
      }
      throw ForbiddenError();
    },
    section: async (_, { sectionId }, context: MyContext): Promise<Section> => {

      // Find section with matching sectionId
      const section = await Section.findById('section resolver', context, sectionId);

      if (await hasPermissionOnSection(context, section.templateId)) {
        return section;
      }
      throw ForbiddenError();
    }
  },

  Mutation: {
    addSection: async (_, { input: { templateId, name, copyFromVersionedSectionId, introduction, requirements, tags, guidance, displayOrder } }, context: MyContext): Promise<Section> => {

      if (await hasPermissionOnSection(context, templateId)) {
        let section: Section;
        if (copyFromVersionedSectionId) {
          // Fetch the VersionedSection we are cloning
          const original = await VersionedSection.findById(
            'addSection resolver',
            context,
            copyFromVersionedSectionId
          );

          if (original) {
            section = cloneSection(context.token?.id, templateId, original);
            section.name = name;
          } else {
            throw NotFoundError();
          }

        }
        if (!section) {
          // Create a new blank section
          section = new Section({ name, templateId, introduction, requirements, guidance, displayOrder });
        }

        // create the new section
        const newSection = await section.create(context, templateId);

        // If there are errors than throw a Bad User Input error
        if (newSection.errors) {
          const errorMessages = newSection.errors.join(', ');
          throw BadUserInput(errorMessages);
        } else {
          const sectionId = newSection.id;

          /*Get list of tags that aren't already mapped to the sectionId in SectionTags, to avoid duplicate tag entries*/
          const tagsToAdd = await getTagsToAdd(tags as Tag[], context, sectionId);

          // Add tags to sectionTags table that did not already exist
          if (tags && tags.length > 0 && tagsToAdd.length > 0) {
            await Promise.all(
              tagsToAdd.map(async (tagId) => {
                const sectionTag = new SectionTag({
                  sectionId: newSection.id,
                  tagId: tagId.id
                });

                await sectionTag.create(context);
              })
            );
          }

          // Return newly created section with tags
          return await Section.findById('addSection resolver', context, sectionId);
        }
      }
    },

    updateSection: async (_, { input: { sectionId, name, introduction, requirements, guidance, tags, displayOrder } }, context: MyContext): Promise<Section> => {

      // Get Section based on provided sectionId
      const sectionData = await Section.findById('section resolver', context, sectionId);

      // Throw Not Found error if Section is not found
      if (!sectionData) {
        throw NotFoundError('Section not found')
      }

      // Check that user has permission to update this section
      if (await hasPermissionOnSection(context, sectionData.templateId)) {
        const section = new Section({
          id: sectionData.id,
          templateId: sectionData.templateId,
          createdById: sectionData.createdById,
          name: name,
          introduction: introduction,
          requirements: requirements,
          guidance: guidance,
          displayOrder: displayOrder,
          isDirty: true  // Mark as dirty for update
        });

        const updatedSection = await section.update(context);

        // If there are errors than throw a Bad User Input error
        if (updatedSection.errors) {
          const errorMessages = updatedSection.errors.join(', ');
          throw BadUserInput(errorMessages);
        } else {
          /*Get list of tags that aren't already mapped to the sectionId in SectionTags, to avoid duplicate tag entries*/
          const tagsToAdd = await getTagsToAdd(tags as Tag[], context, sectionId);

          // Add tags to sectionTags table that did not already exist
          if (tags && tags.length > 0 && tagsToAdd.length > 0) {
            await Promise.all(
              tagsToAdd.map(async (tagId) => {
                const sectionTag = new SectionTag({
                  sectionId: updatedSection.id,
                  tagId: tagId.id
                });

                await sectionTag.create(context);
              })
            );
          }

          // Return newly updated section with tags
          return await Section.findById('updateSection resolver', context, updatedSection.id);
        }
      }
      throw ForbiddenError();
    },

    removeSection: async (_, { sectionId }, context: MyContext): Promise<Section> => {
      // Retrieve existing Section
      const sectionData = await Section.findById('removeSection resolver', context, sectionId);

      // Throw Not Found error if Section is not found
      if (!sectionData) {
        throw NotFoundError('Section not found')
      }

      if (await hasPermissionOnSection(context, sectionData.templateId)) {
        //Need to create a new instance of Section so that it recognizes the 'delete' function of that instance
        const section = new Section({
          ...sectionData,
          id: sectionId
        });

        return await section.delete(context);
      }
      throw ForbiddenError();

    },
  },

  Section: {
    // Chained resolver to fetch the Affiliation info for the user
    tags: async (parent: Section, _, context: MyContext): Promise<Tag[]> => {
      return await Tag.getTagsBySectionId('updateSection resolver', context, parent.id);
    },
    template: async (parent: Section, _, context: MyContext): Promise<Template> => {
      return await Template.findById('template resolver', context, parent.templateId);
    }
  }
};
