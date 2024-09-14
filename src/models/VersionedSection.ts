import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";
import { VersionedTemplate } from "../types";
import { Tag } from "../models/Tag";
import { TemplateVersionType } from "../models/VersionedTemplate";


export class VersionedSection extends MySqlModel {
    public versionedTemplateId: number;
    public name: string;
    public introduction?: string;
    public requirements?: string;
    public guidance?: string;
    public displayOrder: number;
    public tags?: Tag[];  // Array of Tag objects
    versionedTemplate: VersionedTemplate;
    // TODO: Think about whether we need to add bestPractice here, or whether it will inherit from associated VersionedTemplate
    //public bestPractice: boolean;

    constructor(options) {
        super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

        this.versionedTemplateId = options.templateId;
        this.name = options.name;
        this.introduction = options.introduction;
        this.requirements = options.requirements;
        this.guidance = options.guidance;
        this.displayOrder = options.displayOrder;
        this.tags = options.tags;
        this.versionedTemplate = options.versionedTemplate;
        // TODO: Think about whether we need to add bestPractice here, or whether it will inherit from associated VersionedTemplate
        //this.bestPractice = options.bestPractice || false;
    }

    // Find the VersionedSection by id
    static async getVersionedSectionById(reference: string, context: MyContext, sectionId: number): Promise<VersionedSection> {
        const sql = 'SELECT * FROM versionedSections WHERE id = ?';
        const results = await VersionedSection.query(context, sql, [sectionId.toString()], reference);
        return Array.isArray(results) && results.length > 0 ? results[0] : null;
    }


    static async getVersionedSectionsBySectionId(reference: string, context: MyContext, sectionId: number): Promise<VersionedSection[]> {

        const sql = `SELECT 
    vs.id,
    vs.versionedTemplateId,
    vs.sectionId,
    vs.name,
    vs.introduction,
    vs.requirements,
    vs.guidance,
    vs.displayOrder,
    vs.created,
    vs.createdById,
    vs.modified,
    vs.modifiedById,
    JSON_OBJECT(
        'id', vt.id,
        'active', vt.active,
        'version', vt.version,
        'versionType', vt.versionType,
        'comment', vt.comment,
        'name', vt.name,
        'description', vt.description,
        'ownerId', vt.ownerId,
        'visibility', vt.visibility,
        'bestPractice', vt.bestPractice
    ) AS versionedTemplate,
    JSON_OBJECT(
        'id', s.id,
        'templateId', s.templateId,
        'sourceSectionId', s.sourceSectionId,
        'name', s.name,
        'introduction', s.introduction,
        'requirements', s.requirements,
        'guidance', s.guidance,
        'displayOrder', s.displayOrder,
        'isDirty', s.isDirty
    ) AS section,
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', t.id,
                'name', t.name,
                'description', t.description
            )
        )
        FROM sectionTags st
        JOIN tags t ON st.tagId = t.id
        WHERE st.sectionId = vs.sectionId
    ) AS tags
FROM versionedSections vs
JOIN versionedTemplates vt ON vs.versionedTemplateId = vt.id
JOIN sections s ON vs.sectionId = s.id
WHERE vs.sectionId = ?`;

        const results = await VersionedSection.query(context, sql, [sectionId.toString()], reference);
        return results.map(section => {
            return new VersionedSection({
                ...section,
                tags: JSON.parse(section.tags || '[]'),
            });
        });
    }

    static async getVersionedSectionsByName(reference: string, context: MyContext, term: string): Promise<VersionedSection[]> {

        const sql = `SELECT 
    vs.id,
    vs.versionedTemplateId,
    vs.sectionId,
    vs.name,
    vs.introduction,
    vs.requirements,
    vs.guidance,
    vs.displayOrder,
    vs.created,
    vs.createdById,
    vs.modified,
    vs.modifiedById,
    JSON_OBJECT(
        'id', vt.id,
        'active', vt.active,
        'version', vt.version,
        'versionType', vt.versionType,
        'comment', vt.comment,
        'name', vt.name,
        'description', vt.description,
        'ownerId', vt.ownerId,
        'visibility', vt.visibility,
        'bestPractice', vt.bestPractice
    ) AS versionedTemplate,
    JSON_OBJECT(
        'id', s.id,
        'templateId', s.templateId,
        'sourceSectionId', s.sourceSectionId,
        'name', s.name,
        'introduction', s.introduction,
        'requirements', s.requirements,
        'guidance', s.guidance,
        'displayOrder', s.displayOrder,
        'isDirty', s.isDirty
    ) AS section,
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', t.id,
                'name', t.name,
                'description', t.description
            )
        )
        FROM sectionTags st
        JOIN tags t ON st.tagId = t.id
        WHERE st.sectionId = vs.sectionId
    ) AS tags
FROM versionedSections vs
JOIN versionedTemplates vt ON vs.versionedTemplateId = vt.id
JOIN sections s ON vs.sectionId = s.id
WHERE vs.name LIKE ? AND vt.active = 1
AND vt.versionType = ?`;

        const vals = [`%${term}%`, TemplateVersionType.PUBLISHED];
        const results = await VersionedSection.query(context, sql, vals, reference);
        // Process the results to ensure tags is always an array
        return results.map(section => {
            return new VersionedSection({
                ...section,
                tags: JSON.parse(section.tags || '[]'),
            });
        });
    }

}

