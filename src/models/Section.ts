import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";
import { Tag } from "../types";


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
    //public tags?: Tag[];  // Array of Tag objects
    public isDirty: boolean;
    // TODO: Think about whether we need to add bestPractice here, or whether it will inherit from associated Template
    //public bestPractice: boolean; 

    //private tableName = 'sections';

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
        //this.tags = options.tags;
        this.isDirty = options.isDirty || true;
        // TODO: Think about whether we need to add bestPractice here, or whether it will inherit from associated Template
        //this.bestPractice = options.bestPractice || false;
    }

    // Validation to be used prior to saving the record
    async isValid(): Promise<boolean> {
        await super.isValid();

        if (!this.name) {
            this.errors.push('Name can\'t be blank');
        }
        return this.errors.length <= 0;
    }


    // Save the current record
    async create(context: MyContext): Promise<Section> {

        // First make sure the record is valid
        if (await this.isValid()) {
            const current = await Section.findSectionByNameAndTemplateId(
                'Section.create',
                context,
                this.name,
            );

            // Then make sure it doesn't already exist
            if (current) {
                this.errors.push('Section with this name already exists');
            } else {
                /*Need to remove tags, because this does not exist in the sections table, but we need it to
                add tags back into the response when adding a new section*/
                delete this.tags;
                // Save the record and then fetch it
                const newId = await Section.insert(context, 'sections', this, 'Section.create');

                const response = await Section.getSectionBySectionId('Section.create', context, newId);
                return response;
            }
        }

        // Otherwise return as-is with all the errors
        return this;
    }

    // Look for the template by it's name and owner
    static async findSectionByNameAndTemplateId(
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

    static async getSectionsWithTagsByTemplateId(reference: string, context: MyContext, templateId: number): Promise<Section[]> {
        const sql = `SELECT s.*, 
       COALESCE(
         JSON_ARRAYAGG(
           CASE 
             WHEN t.id IS NOT NULL THEN JSON_OBJECT('id', t.id, 'name', t.name, 'description', t.description)
             ELSE NULL
           END
         ),
         JSON_ARRAY()
       ) AS tags
        FROM sections s
        LEFT JOIN sectionTags st ON s.id = st.sectionId
        LEFT JOIN tags t ON st.tagId = t.id
        WHERE s.templateId = ?
        GROUP BY s.id`;

        const results = await Section.query(context, sql, [templateId.toString()], reference);
        const parsedResults = results.map(section => ({
            ...section,
            tags: section.tags ? JSON.parse(section.tags || []) : []
        }));

        return Array.isArray(parsedResults) ? parsedResults : [];
    }

    static async getSectionBySectionId(reference: string, context: MyContext, sectionId: number): Promise<Section> {

        const sql = `SELECT s.*, 
       COALESCE(
         JSON_ARRAYAGG(
           CASE 
             WHEN t.id IS NOT NULL THEN JSON_OBJECT('id', t.id, 'name', t.name, 'description', t.description)
             ELSE NULL
           END
         ),
         JSON_ARRAY()
       ) AS tags
        FROM sections s
        LEFT JOIN sectionTags st ON s.id = st.sectionId
        LEFT JOIN tags t ON st.tagId = t.id
        WHERE s.id = ?
        GROUP BY s.id`;
        const results = await Section.query(context, sql, [sectionId.toString()], reference);
        const parsedResults = results.map(section => ({
            ...section,
            tags: section.tags ? JSON.parse(section.tags || []) : []
        }));

        return Array.isArray(parsedResults) && parsedResults.length > 0 ? parsedResults[0] : null;
    }

}

