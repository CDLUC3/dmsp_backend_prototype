// Template visibility
//     Private - Template is only available to Researchers that share the same affiliation
//     Public  - Template is available to everyone
export enum Visibility {
  Private = 'Private',
  Public = 'Public',
}

// A Template for creating a DMP
export class Template {
  public errors: string[];

  constructor(
    public name: string,
    public affiliationId: string,
    public ownerId: number,
    public visibility: Visibility = Visibility.Private,
    public currentVersion: string = '',
    public isDirty: boolean = true,
    public created: string = new Date().toUTCString(),
    public modified: string = new Date().toUTCString(),
    public id: number = null,
  ){
    this.errors = [];
  }
}

// A Snapshot/Published copy of a Template
export class PublishedTemplate {
  constructor(
    public templateId: number,
    public version: string,
    public name: string,
    public affiliationId: string,
    public publishedById: number,
    public visibility: Visibility = Visibility.Private,
    public comment: string = '',
    public active: boolean = false,
    public created: string = new Date().toUTCString(),
    public id: number = null,
  ){}
}
