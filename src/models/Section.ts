import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";
import { Tag } from "../types";

const tableName = 'sections';

// A Template for creating a DMP
export class Section extends MySqlModel {
    public templateId: number;
    public sourceSectionId: number;
    public name: string;
    public introduction?: string;
    public requirements?: string;
    public guidance?: string;
    public displayOrder: number;
    public tags: Tag[];
    public isDirty: boolean;
    // TODO: Think about whether we need to add bestPractice here, or whether it will inherit from associated Template
    //public bestPractice: boolean; 


    constructor(options) {
        super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

        this.templateId = options.templateId;
        this.sourceSectionId = options.sourceSectionId;
        this.name = options.name;
        this.introduction = options.introduction;
        this.requirements = options.requirements;
        this.guidance = options.guidance;
        this.displayOrder = options.displayOrder;
        this.tags = options.tags;
        this.isDirty = options.isDirty || true;
        // TODO: Think about whether we need to add bestPractice here, or whether it will inherit from associated Template
        //this.bestPractice = options.bestPractice || false;
    }

    //Check that the Section data contains the required name field
    async isValid(): Promise<boolean> {
        await super.isValid();

        if (!this.name) {
            this.errors.push('Name can\'t be blank');
        }
        return this.errors.length <= 0;
    }


    //Create a new Section
    async create(context: MyContext): Promise<Section> {

        // First make sure the record is valid
        if (await this.isValid()) {
            const current = await Section.findSectionBySectionName(
                'Section.create',
                context,
                this.name,
            );

            // Then make sure it doesn't already exist
            if (current) {
                this.errors.push('Section with this name already exists');
            } else {
                /*Need to remove tags, because this does not exist in the sections table, but we need to
                add tags into the response*/
                delete this.tags;

                // Save the record and then fetch it
                const newId = await Section.insert(context, tableName, this, 'Section.create');
                const response = await Section.getSectionBySectionId('Section.create', context, newId);
                return response;
            }
        }
        // Otherwise return as-is with all the errors
        return this;
    }

    //Update an existing Section
    async update(context: MyContext): Promise<Section> {
        /*Need to remove tags, because this does not exist in the sections table, but we need to
                add tags into the response*/
        delete this.tags;
        const id = this.id;

        if (await this.isValid()) {
            if (id) {
                await Section.update(context, tableName, this, 'Section.update');
                return await Section.getSectionBySectionId('Section.update', context, id);
            }
            // This template has never been saved before so we cannot update it!
            this.errors.push('Section has never been saved');
        }
        return this;
    }

    //Delete Section based on the Section object's id and return
    async delete(context: MyContext): Promise<Section> {
        if (this.id) {
            /*First get the section to be deleted so we can return this info to the user
            since calling 'delete' doesn't return anything*/
            const deletedSection = await Section.getSectionBySectionId('Section.delete', context, this.id);

            const successfullyDeleted = await Section.delete(context, tableName, this.id, 'Section.delete');
            if (successfullyDeleted) {
                return deletedSection;
            } else {
                return null
            }
        }
        return null;
    }

    // Find section by section name
    static async findSectionBySectionName(
        reference: string,
        context: MyContext,
        name: string,
    ): Promise<Section> {
        const sql = 'SELECT * FROM sections WHERE LOWER(name) = ?';
        const vals = [name.toLowerCase()];
        const results = await Section.query(context, sql, vals, reference);
        return Array.isArray(results) && results.length > 0 ? results[0] : null;
    }


    // Find all Sections associated with the specified templateId
    static async getSectionsByTemplateId(reference: string, context: MyContext, templateId: number): Promise<Section[]> {
        const sql = 'SELECT * FROM sections WHERE templateId = ?';
        const results = await Section.query(context, sql, [templateId.toString()], reference);
        return Array.isArray(results) ? results : [];
    }

    static async getSectionBySectionId(reference: string, context: MyContext, sectionId: number): Promise<Section> {
        const sql = 'SELECT * FROM sections where id = ?';
        const result = await Section.query(context, sql, [sectionId.toString()], reference);
        return Array.isArray(result) && result.length > 0 ? result[0] : null;
    }

}

