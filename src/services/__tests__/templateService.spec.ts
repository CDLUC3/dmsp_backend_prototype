import casual from 'casual';
import { Template, Visibility } from "../../models/Template";
import { VersionedTemplate, VersionType } from '../../models/VersionedTemplate';
import { clone, generateVersion } from '../templateService';

describe('generateVersion', () => {
  let id;
  let name;
  let description;
  let createdById;
  let ownerId;
  let tmplt;

  beforeEach(() => {
    id = casual.integer(1, 999);
    name = casual.title;
    description = casual.sentences(3);
    ownerId = casual.url;
    createdById = casual.integer(1, 999);

    tmplt = new Template({ name, description, ownerId, createdById });
    tmplt.id = id;
  });

  it('throws an error if the specified Template has no id (it hasn\'t been saved!)', async () => {
    tmplt.id = null;
    const expectedMessage = 'Cannot publish unsaved Template';
    await expect(generateVersion(tmplt, [], ownerId, 'Testing unsaved')).rejects.toThrow(Error);
    await expect(generateVersion(tmplt, [], ownerId, 'Testing unsaved')).rejects.toThrow(expectedMessage);
  });

  it('throws an error if the specified Template has a current version but no changes', async () => {
    tmplt.currentVersion = 'v1'
    tmplt.isDirty = false
    const expectedMessage = 'There are no changes to publish';
    await expect(generateVersion(tmplt, [], ownerId, 'Testing unsaved')).rejects.toThrow(Error);
    await expect(generateVersion(tmplt, [], ownerId, 'Testing unsaved')).rejects.toThrow(expectedMessage);
  });

  it('publish initializes a new PublishedTemplate and sets the currentVersion number', async () => {
    const publisher = casual.integer(1, 999);
    const comment = casual.sentences(10);

    const { template, versions } = await generateVersion(tmplt, [], publisher, comment);
    expect(template.currentVersion).toEqual('v1');
    expect(versions.length).toBe(1);
    const published = versions[0];

    expect(published).toBeInstanceOf(VersionedTemplate);
    expect(published.templateId).toEqual(tmplt.id);
    expect(published.name).toEqual(tmplt.name);
    expect(published.visibility).toEqual(tmplt.visibility);
    expect(published.version).toEqual('v1');
    expect(published.versionedById).toEqual(publisher);
    expect(published.comment).toEqual(comment);
    expect(published.active).toBe(true);
  });

  it('publish initializes a new PublishedTemplate and bumps the currentVersion number', async () => {
    const publisher = casual.integer(1, 999);
    const comment = casual.sentences(10);

    const ver = casual.integer(1, 999);
    const priorVersion = new VersionedTemplate({
      id: tmplt.id,
      version: `v${ver}`,
      name: 'Prior version',
      ownerId,
      createdById: casual.integer(1, 999),
      visibility: Visibility.Public,
      comment: 'This was the prior version',
      active: true,
    });
    tmplt.currentVersion = ver;

    const { template, versions } = await generateVersion(tmplt, [priorVersion], publisher, comment);
    expect(template.currentVersion).toEqual(`v${ver + 1}`);
    expect(versions.length).toBe(2);
    const published = versions[1];

    expect(published).toBeInstanceOf(VersionedTemplate);
    expect(published.templateId).toEqual(template.id);
    expect(published.name).toEqual(template.name);
    expect(published.visibility).toEqual(template.visibility);
    expect(published.version).toEqual(`v${ver + 1}`);
    expect(published.versionedById).toEqual(publisher);
    expect(published.comment).toEqual(comment);
    expect(published.active).toBe(true);

    expect(versions[0]?.active).toBe(false);
  });
});

describe('publish', () => {
  let id;
  let name;
  let description;
  let createdById;
  let ownerId;
  let tmplt;

  beforeEach(() => {
    id = casual.integer(1, 999);
    name = casual.title;
    description = casual.sentences(3);
    ownerId = casual.url;
    createdById = casual.integer(1, 999);

    tmplt = new Template({ name, description, ownerId, createdById });
    tmplt.id = id;
  });

  it('Clone retains the expected parts of the specified Template', () => {
    const clonedById = casual.integer(1, 99);
    const newOwnerId = casual.url;
    const copy = clone(clonedById, newOwnerId, tmplt);

    expect(copy).toBeInstanceOf(Template);
    expect(copy.id).toBeFalsy();
    expect(copy.name).toEqual(`Copy of ${tmplt.name}`);
    expect(copy.ownerId).toEqual(newOwnerId);
    expect(copy.visibility).toEqual(Visibility.Private);
    expect(copy.currentVersion).toBeFalsy();
    expect(copy.errors).toEqual([]);
    expect(copy.description).toEqual(description);
    expect(copy.created).toBeTruthy();
    expect(copy.createdById).toEqual(clonedById)
    expect(copy.modified).toBeTruthy();
  });

  it('Clone retains the expected parts of the specified PublishedTemplate', () => {
    const clonedById = casual.integer(1, 999);
    const newOwnerId = casual.word;
    const published = new VersionedTemplate({
      templateId: tmplt.id,
      version: `v34`,
      name: 'Published version',
      description,
      ownerId: casual.url,
      VersionType: VersionType.Draft,
      createdById: casual.integer(1, 9999),
    });

    const copy = clone(clonedById, newOwnerId, published);

    expect(copy).toBeInstanceOf(Template);
    expect(copy.id).toBeFalsy();
    expect(copy.name).toEqual(`Copy of ${published.name}`);
    expect(copy.ownerId).toEqual(newOwnerId);
    expect(copy.visibility).toEqual(Visibility.Private);
    expect(copy.currentVersion).toBeFalsy();
    expect(copy.errors).toEqual([]);
    expect(copy.createdById).toEqual(clonedById);
    expect(copy.description).toEqual(description);
    expect(copy.created).toBeTruthy();
    expect(copy.modified).toBeTruthy();
  });
});
