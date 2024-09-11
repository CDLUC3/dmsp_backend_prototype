import { Section } from "../models/Section";
import { VersionedSection } from "../models/VersionedSection";

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

