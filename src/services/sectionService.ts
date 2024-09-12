import { MyContext } from "../context";
import { Section } from "../models/Section";
import { Template } from "../models/Template";
import { VersionedSection } from "../models/VersionedSection";
import { ForbiddenError, NotFoundError } from "../utils/graphQLErrors";


// Make a copy of the specified Section
export const cloneSection = (
    clonedById: number,
    templateId: number,
    copyFromSectionId: number,
    section: Section | VersionedSection
): Section => {
    const sectionCopy = new Section({
        templateId: templateId,
        sourceSectionId: copyFromSectionId,
        name: `Copy of ${section.name}`,
        introduction: section.introduction,
        requirements: section.requirements,
        guidance: section.requirements,
        displayOrder: section.displayOrder,
    });

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

