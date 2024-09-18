import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";
import { VersionedTemplate } from "../types";
import { Tag } from "../models/Tag";

export class VersionedSection extends MySqlModel {
    public versionedTemplateId: number;
    public name: string;
    public introduction?: string;
    public requirements?: string;
    public guidance?: string;
    public displayOrder: number;
    public tags?: Tag[];
    public versionedTemplate: VersionedTemplate;
    public sectionId: number;
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
        this.sectionId = options.sectionId;
        // TODO: Think about whether we need to add bestPractice here, or whether it will inherit from associated VersionedTemplate
        //this.bestPractice = options.bestPractice || false;
    }

    // Find the VersionedSection by id
    static async getVersionedSectionById(reference: string, context: MyContext, id: number): Promise<VersionedSection> {
        const sql = 'SELECT * FROM versionedSections WHERE id= ?';
        const results = await VersionedSection.query(context, sql, [id.toString()], reference);
        return Array.isArray(results) && results.length > 0 ? results[0] : null;
    }

    // Find the VersionedSections by sectionId
    static async getVersionedSectionsBySectionId(reference: string, context: MyContext, sectionId: number): Promise<VersionedSection[]> {
        const sql = 'SELECT * FROM versionedSections WHERE sectionId = ?';
        const results = await VersionedSection.query(context, sql, [sectionId.toString()], reference);
        return Array.isArray(results) && results.length > 0 ? results : null;
    }

    // Find the VersionedSections by templateId
    static async getVersionedSectionsByTemplateId(reference: string, context: MyContext, versionedTemplateId: number): Promise<VersionedSection[]> {
        const sql = 'SELECT * FROM versionedSections WHERE versionedTemplateId = ?';
        const results = await VersionedSection.query(context, sql, [versionedTemplateId.toString()], reference);
        return Array.isArray(results) && results.length > 0 ? results : null;
    }

    // Find the VersionedSection by name
    static async getVersionedSectionsByName(reference: string, context: MyContext, term: string): Promise<VersionedSection[]> {
        const sql = 'SELECT * FROM versionedSections WHERE name LIKE ?';
        const vals = [`%${term}%`];
        const results = await VersionedSection.query(context, sql, vals, reference);
        return Array.isArray(results) && results.length > 0 ? results : null;
    }
}

