import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";

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
        // Save the tags to sectionTags table
        await SectionTag.insert(context, 'sectionTags', this, 'SectionTag.create');
        return this;
    }

    // Look for the existing record in sectionTags
    static async findSectionTag(
        reference: string,
        context: MyContext,
        name: string,
    ): Promise<SectionTag> {
        const sql = 'SELECT * FROM sections WHERE LOWER(name) = ?';
        const vals = [name.toLowerCase()];
        const results = await SectionTag.query(context, sql, vals, reference);
        return Array.isArray(results) && results.length > 0 ? results[0] : null;
    }

}

