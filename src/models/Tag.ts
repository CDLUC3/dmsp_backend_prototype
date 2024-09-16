import { MySqlModel } from "./MySqlModel";
import { MyContext } from "../context";

const tableName = 'tags';
export class Tag extends MySqlModel {
    public name: string;
    public description?: string;

    constructor(options) {
        super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

        this.name = options.name;
        this.description = options.description;
    }


    // Save the current record
    async create(context: MyContext): Promise<Tag> {
        const current = await Tag.findTagByTagName(
            'Section.create',
            context,
            this.name,
        );

        // Then make sure it doesn't already exist
        if (current) {
            this.errors.push('Tag with this name already exists');
        } else {
            const newId = await Tag.insert(context, tableName, this, 'Tag.create');
            const response = await Tag.getTagById('Tag.create', context, newId);
            return response
        }
        return this;
    }

    async update(context: MyContext): Promise<Tag> {
        const id = this.id;
        await Tag.update(context, tableName, this, 'Tag.update');
        const updatedTag = await Tag.getTagById('Tag.update', context, id);
        return updatedTag as Tag;
    }

    async delete(context: MyContext): Promise<Tag> {
        if (this.id) {
            /*Get tag info to be deleted so we can return this info to the user
            since calling 'delete' doesn't return anything*/
            const deletedSection = await Tag.getTagById('Tag.delete', context, this.id);

            await Tag.delete(context, tableName, this.id, 'Tag.delete');
            return deletedSection;
        }
    }

    static async getAllTags(reference: string, context: MyContext): Promise<Tag[]> {
        const sql = 'SELECT * FROM tags';
        const results = await Tag.query(context, sql, [], reference);
        return Array.isArray(results) && results.length > 0 ? results : null;
    }

    static async getTagById(reference: string, context: MyContext, tagId: number): Promise<Tag> {
        const sql = 'SELECT * FROM tags where id = ?';
        const result = await Tag.query(context, sql, [tagId.toString()], reference);
        return Array.isArray(result) && result.length > 0 ? result[0] : null;
    }

    static async getTagsBySectionId(reference: string, context: MyContext, sectionId: number): Promise<Tag[]> {
        const sql = `SELECT tags.*
        FROM sectionTags
        JOIN tags ON sectionTags.tagId = tags.id
        WHERE sectionTags.sectionId = ?;`;
        const result = await Tag.query(context, sql, [sectionId.toString()], reference);
        return Array.isArray(result) ? result.map(item => new Tag(item)) : [];
    }

    // Find tag by tag name
    static async findTagByTagName(
        reference: string,
        context: MyContext,
        name: string,
    ): Promise<Tag> {
        const sql = 'SELECT * FROM tags WHERE LOWER(name) = ?';
        const vals = [name.toLowerCase()];
        const results = await Tag.query(context, sql, vals, reference);
        return Array.isArray(results) && results.length > 0 ? results[0] : null;
    }
}

