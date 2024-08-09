import casual from 'casual';
import { Template, PublishedTemplate, Visibility } from "../Template";

describe('Template', () => {
  let name;
  let affiliationId;
  let ownerId;
  let template;

  beforeEach(() => {
    name = casual.title;
    affiliationId = casual.url;
    ownerId = casual.integer(1, 999);

    template = new Template(name, affiliationId, ownerId);
  });

  it('constructor should initialize as expected', () => {
    expect(template.id).toBeFalsy();
    expect(template.name).toEqual(name);
    expect(template.affiliationId).toEqual(affiliationId);
    expect(template.ownerId).toEqual(ownerId);
    expect(template.visibility).toEqual(Visibility.Private);
    expect(template.created).toBeTruthy();
    expect(template.modified).toBeTruthy();
    expect(template.currentVersion).toBeFalsy();
    expect(template.isDirty).toBeTruthy();
    expect(template.errors).toEqual([]);
  });
});

describe('PublishedTemplate', () => {
  it('constructor should initialize as expected', () => {
    const templateId = casual.integer(1, 999);
    const affiliationId = casual.url;
    const version = casual.word;
    const name = casual.sentence;
    const publishedById = casual.integer(1, 999);

    const publishedTemplate = new PublishedTemplate(templateId, version, name, affiliationId, publishedById);

    expect(publishedTemplate.id).toBeFalsy();
    expect(publishedTemplate.templateId).toEqual(templateId);
    expect(publishedTemplate.version).toEqual(version);
    expect(publishedTemplate.name).toEqual(name);
    expect(publishedTemplate.affiliationId).toEqual(affiliationId);
    expect(publishedTemplate.publishedById).toEqual(publishedById);
    expect(publishedTemplate.visibility).toEqual(Visibility.Private);
    expect(publishedTemplate.created).toBeTruthy();
    expect(publishedTemplate.active).toBe(false);
    expect(publishedTemplate.comment).toEqual('');
  });
});
