import { MyContext } from "../context";
import { Section } from "../models/Section";
import { Template } from "../models/Template";
import { SectionTag } from "../models/SectionTag";
import { Tag } from "../models/Tag";
import { VersionedSection } from "../models/VersionedSection";
import { ForbiddenError, NotFoundError } from "../utils/graphQLErrors";


// Make a copy of the specified Section
export const cloneSection = (
    clonedById: number,
    templateId: number,
    copyFromVersionedSectionId: number,
    section: Section | VersionedSection
): Section => {
    const sectionCopy = new Section({
        sourceSectionId: copyFromVersionedSectionId,
        name: `Copy of ${section.name}`,
        introduction: section.introduction,
        requirements: section.requirements,
        guidance: section.requirements,
        displayOrder: section.displayOrder,
        templateId: templateId
    });

    sectionCopy.createdById = clonedById;
    return sectionCopy;
}

// Determine whether the specified user has permission to access the Section
export const hasPermission = async (context: MyContext, templateId: number): Promise<boolean> => {

    // Find associated template info
    const template = await Template.findById('section resolver.hasPermission', context, templateId);

    if (!template) {
        throw NotFoundError();
    }

    // If the User is not affiliated with this template
    if (template.ownerId !== context.token?.affiliationId) {
        throw ForbiddenError();
    }

    return true;
}

export const getTagsToAdd = async (tags: Tag[], context: MyContext, sectionId: number): Promise<Tag[]> => {

    //Get all the existing tags associated with this section in SectionTags
    const existingTags = await SectionTag.getSectionTagsBySectionId('updateSection resolver', context, sectionId);

    // Create a Set of existing tag ids
    const existingTagIds = new Set(existingTags.map(sectionTag => sectionTag.tagId));

    // Filter out the tags that already exist in the sectiontable.
    const tagsToAdd = tags.filter(tag => !existingTagIds.has(tag.id));

    return Array.isArray(tagsToAdd) ? tagsToAdd : [];

}
