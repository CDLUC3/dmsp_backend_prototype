import casual from 'casual';
import { Template, PublishedTemplate, Visibility } from "../../models/Template";
import { clone, publish } from '../templateService';

describe('publish', () => {
  let id;
  let name;
  let affiliationId;
  let ownerId;
  let tmplt;

  beforeEach(() => {
    id = casual.integer(1, 999);
    name = casual.title;
    affiliationId = casual.url;
    ownerId = casual.integer(1, 999);

    tmplt = new Template(name, affiliationId, ownerId);
    tmplt.id = id;
  });

  it('throws an error if the specified Template has no id (it hasn\'t been saved!)', async () => {
    tmplt.id = null;
    const expectedMessage = 'Cannot publish unsaved Template';
    await expect(publish(tmplt, [], ownerId, 'Testing unsaved')).rejects.toThrow(Error);
    await expect(publish(tmplt, [], ownerId, 'Testing unsaved')).rejects.toThrow(expectedMessage);
  });

  it('throws an error if the specified Template has a current version but no changes', async () => {
    tmplt.currentVersion = 'v1'
    tmplt.isDirty = false
    const expectedMessage = 'There are no changes to publish';
    await expect(publish(tmplt, [], ownerId, 'Testing unsaved')).rejects.toThrow(Error);
    await expect(publish(tmplt, [], ownerId, 'Testing unsaved')).rejects.toThrow(expectedMessage);
  });

  it('publish initializes a new PublishedTemplate and sets the currentVersion number', async () => {
    const publisher = casual.integer(1, 999);
    const comment = casual.sentences(10);

    const { template, versions } = await publish(tmplt, [], publisher, comment);
    expect(template.currentVersion).toEqual('v1');
    expect(versions.length).toBe(1);
    const published = versions[0];

    expect(published).toBeInstanceOf(PublishedTemplate);
    expect(published.templateId).toEqual(tmplt.id);
    expect(published.name).toEqual(tmplt.name);
    expect(published.visibility).toEqual(tmplt.visibility);
    expect(published.version).toEqual('v1');
    expect(published.publishedById).toEqual(publisher);
    expect(published.comment).toEqual(comment);
    expect(published.active).toBe(true);
  });

  it('publish initializes a new PublishedTemplate and bumps the currentVersion number', async () => {
    const publisher = casual.integer(1, 999);
    const comment = casual.sentences(10);

    const ver = casual.integer(1, 999);
    const priorVersion = new PublishedTemplate(
      tmplt.id,
      `v${ver}`,
      'Prior version',
      affiliationId,
      casual.integer(1, 999),
      Visibility.Public,
      'This was the prior version',
      true,
    );
    tmplt.currentVersion = ver;

    const { template, versions } = await publish(tmplt, [priorVersion], publisher, comment);
    expect(template.currentVersion).toEqual(`v${ver + 1}`);
    expect(versions.length).toBe(2);
    const published = versions[1];

    expect(published).toBeInstanceOf(PublishedTemplate);
    expect(published.templateId).toEqual(template.id);
    expect(published.name).toEqual(template.name);
    expect(published.visibility).toEqual(template.visibility);
    expect(published.version).toEqual(`v${ver + 1}`);
    expect(published.publishedById).toEqual(publisher);
    expect(published.comment).toEqual(comment);
    expect(published.active).toBe(true);

    expect(versions[0]?.active).toBe(false);
  });
});

describe('publish', () => {
  let id;
  let name;
  let affiliationId;
  let ownerId;
  let tmplt;

  beforeEach(() => {
    id = casual.integer(1, 999);
    name = casual.title;
    affiliationId = casual.url;
    ownerId = casual.integer(1, 999);

    tmplt = new Template(name, affiliationId, ownerId);
    tmplt.id = id;
  });

  it('Clone retains the expected parts of the specified Template', () => {
    const newOwnerId = casual.integer(1, 999);
    const newAffiliationId = casual.word;
    const copy = clone(newOwnerId, newAffiliationId, tmplt);

    expect(copy).toBeInstanceOf(Template);
    expect(copy.id).toBeFalsy();
    expect(copy.name).toEqual(`Copy of ${tmplt.name}`);
    expect(copy.affiliationId).toEqual(newAffiliationId);
    expect(copy.visibility).toEqual(Visibility.Private);
    expect(copy.currentVersion).toBeFalsy();
    expect(copy.errors).toEqual([]);
    expect(copy.ownerId).toEqual(newOwnerId);
    expect(copy.created).toBeTruthy();
    expect(copy.modified).toBeTruthy();
  });

  it('Clone retains the expected parts of the specified PublishedTemplate', () => {
    const newOwnerId = casual.integer(1, 999);
    const newAffiliationId = casual.word;
    const published = new PublishedTemplate(
      tmplt.id,
      `v34`,
      'Published version',
      affiliationId,
      ownerId,
    );
    const copy = clone(newOwnerId, newAffiliationId, published);

    expect(copy).toBeInstanceOf(Template);
    expect(copy.id).toBeFalsy();
    expect(copy.name).toEqual(`Copy of ${published.name}`);
    expect(copy.affiliationId).toEqual(newAffiliationId);
    expect(copy.visibility).toEqual(Visibility.Private);
    expect(copy.currentVersion).toBeFalsy();
    expect(copy.errors).toEqual([]);
    expect(copy.ownerId).toEqual(newOwnerId);
    expect(copy.created).toBeTruthy();
    expect(copy.modified).toBeTruthy();
  });
});
