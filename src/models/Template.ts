
export enum Visibility {
  Private = 'Private',
  Public = 'Public',
}

export class TemplateModel {
  public id!: number;
  public name!: string;
  public description?: string;
  public created!: string;
  public modified!: string;
  public visibility!: Visibility;
  public errors: string[];

  // familyId ties like versions together
  private familyId!: number;

  // Initialize a new User
  constructor(options) {
    this.id = options.id;
    this.name = options.name;
    this.description = options.description;
    this.visibility = options.visibility || Visibility.Public;
    this.created = options.created || new Date().toUTCString;
    this.modified = options.modified || new Date().toUTCString;
  }

  // Create a new version of the template
  static async newVersion(): Promise<TemplateModel | null> {
    // Placeholder to create a new version of the template
    return null;
  }
}