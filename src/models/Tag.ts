import { MySqlModel } from "./MySqlModel";

export class Tag extends MySqlModel {
    public id: number;
    public name: string;
    public description?: string;

    //private tableName = 'tags';

    constructor(options) {
        super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

        this.id = options.id;
        this.name = options.name;
        this.description = options.description;
    }
}

