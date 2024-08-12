import { Visibility } from "./Template";

export enum VersionType {
  Draft = 'Draft',
  Published = 'Published',
}

// A Snapshot/Version of a Template
export class VersionedTemplate {
  constructor(
    public id: number,
    public templateId: number,
    public version: string,
    public versionedById: number,
    public versionType: VersionType = VersionType.Draft,
    public comment = '',
    public active = false,

    public name: string,
    public affiliationId: string = null,
    public ownerId: number = null,
    public visibility: Visibility = Visibility.Private,
    public bestPractice = false,

    public created: string = new Date().toUTCString(),
    public modified: string = new Date().toUTCString(),
  ){}
}
