import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";
import { Tag } from './Tag';

// A Template for creating a DMP
export class VersionedSection extends MySqlModel {
    public versionedTemplateId: number;
    public name: string;
    public introduction?: string;
    public requirements?: string;
    public guidance?: string;
    public displayOrder: number;
    public tags?: Tag[];  // Array of Tag objects
    // TODO: Think about whether we need to add bestPractice here, or whether it will inherit from associated VersionedTemplate
    //public bestPractice: boolean;

    private tableName = 'sections';

    constructor(options) {
        super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

        this.versionedTemplateId = options.templateId;
        this.name = options.name;
        this.introduction = options.introduction;
        this.requirements = options.requirements;
        this.guidance = options.guidance;
        this.displayOrder = options.displayOrder;
        this.tags = options.tags;
        // TODO: Think about whether we need to add bestPractice here, or whether it will inherit from associated VersionedTemplate
        //this.bestPractice = options.bestPractice || false;
    }

    // Find the VersionedSection by id
    static async getVersionedSectionById(reference: string, context: MyContext, sectionId: number): Promise<VersionedSection> {
        const sql = 'SELECT * FROM versionedSections WHERE id = ?';
        const results = await VersionedSection.query(context, sql, [sectionId.toString()], reference);
        return Array.isArray(results) && results.length > 0 ? results[0] : null;
    }

}

