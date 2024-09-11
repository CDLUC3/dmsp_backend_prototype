import { Resolvers } from "../types";
import { MyContext } from "../context";
import { Section } from "../models/Section";
import { Template } from "../models/Template";
import { VersionedSection } from '../models/VersionedSection';
import { cloneSection } from "../services/sectionService";
import { ForbiddenError, NotFoundError } from "../utils/graphQLErrors";


export const resolvers: Resolvers = {
    Query: {
        sections: async (_, { templateId }, context: MyContext): Promise<Section[]> => {

            // Get all templates that belong to user's affiliation id
            const templates = await Template.findByUser('sections resolver', context);

            // Check if submitted templateId is in the list of templates with user's affiliation id
            const template = templates.find(t => t.id === templateId);

            // If there are no templates connected to the user's affiliation id
            if (!template) {
                throw ForbiddenError();
            }

            const sections = await Section.getSectionsByTemplateId('sections resolver', context, templateId);

            return sections;
        },
        section: async (_, { sectionId }, context: MyContext): Promise<Section> => {

            // Find section with matching sectionId
            const section = await Section.getSectionBySectionId('section resolver', context, sectionId);

            // Find associated template info
            const template = await Template.findById('section resolver', context, section.templateId);

            if (!template) {
                throw NotFoundError();
            }

            // If the User is not affiliated with this template
            if (template.ownerId !== context.token?.affiliationId) {
                throw ForbiddenError();
            }

            return section;
        }
    },

    Mutation: {
        addSection: async (_, { input: { templateId, name, copyFromSectionId, introduction, requirements, guidance, displayOrder } }, context: MyContext): Promise<Section> => {

            // Find associated template info
            const template = await Template.findById('addSection resolver', context, templateId);

            if (!template) {
                throw NotFoundError();
            }

            // If the User is not affiliated with this template
            if (template.ownerId !== context.token?.affiliationId) {
                throw ForbiddenError();
            }

            let section: Section;
            if (copyFromSectionId) {
                // Fetch the VersionedTemplate we are cloning
                const original = await VersionedSection.getVersionedSectionById(
                    'addSection resolver',
                    context,
                    copyFromSectionId
                );

                section = cloneSection(context.token?.id, templateId, copyFromSectionId, original);
                section.name = name;
            }
            if (!section) {
                // Create a new blank section
                section = new Section({ name, templateId, introduction, requirements, guidance, displayOrder });
            }

            // create the new section
            const newSection = await section.create(context);

            return newSection;


        },
    }
};
