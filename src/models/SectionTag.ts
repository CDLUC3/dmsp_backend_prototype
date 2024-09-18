import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";

const tableName = "sectionTags";
// A Template for creating a DMP
export class SectionTag extends MySqlModel {
    public sectionId: number;
    public tagId: number;

    constructor(options) {
        super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

        this.sectionId = options.sectionId;
        this.tagId = options.tagId;
    }


    // Save the current record
    async create(context: MyContext): Promise<SectionTag> {
        // Insert new SectionTag records
        await SectionTag.insert(context, tableName, this, 'SectionTag.create');
        return this;
    }

    // Get SectionTags by sectionId
    static async getSectionTagsBySectionId(reference: string, context: MyContext, sectionId: number): Promise<SectionTag[]> {
        const sql = 'SELECT * FROM sectionTags WHERE sectionId = ?';
        const results = await SectionTag.query(context, sql, [sectionId.toString()], reference);
        return Array.isArray(results) ? results : [];
    }
}

