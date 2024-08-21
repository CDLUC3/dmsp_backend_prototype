import casual from 'casual';
import { Template, Visibility } from "../Template";

describe('Template', () => {
  let name;
  let createdById;
  let ownerId;
  let template;

  beforeEach(() => {
    name = casual.title;
    ownerId = casual.url;
    createdById = casual.integer(1, 999);

    template = new Template({ name, ownerId, createdById });
  });

  it('constructor should initialize as expected', () => {
    expect(template.id).toBeFalsy();
    expect(template.name).toEqual(name);
    expect(template.ownerId).toEqual(ownerId);
    expect(template.visibility).toEqual(Visibility.Private);
    expect(template.created).toBeTruthy();
    expect(template.modified).toBeTruthy();
    expect(template.currentVersion).toBeFalsy();
    expect(template.isDirty).toBeTruthy();
    expect(template.errors).toEqual([]);
  });

  it('isValid returns true when the record is valid', async () => {
    expect(await template.isValid()).toBe(true);
  });

  it('isValid returns false if the ownerId is null', async () => {
    template.ownerId = null;
    expect(await template.isValid()).toBe(false);
    expect(template.errors.length).toBe(1);
    expect(template.errors[0].includes('Owner')).toBe(true);
  });

  it('isValid returns false if the name is null', async () => {
    template.name = null;
    expect(await template.isValid()).toBe(false);
    expect(template.errors.length).toBe(1);
    expect(template.errors[0].includes('Name')).toBe(true);
  });

  it('isValid returns false if the name is blank', async () => {
    template.name = '';
    expect(await template.isValid()).toBe(false);
    expect(template.errors.length).toBe(1);
    expect(template.errors[0].includes('Name')).toBe(true);
  });
});

describe('clone', () => {
  it('returns a copy of the template with the expected values', () => {
    const opts = {
      id: casual.integer(1, 99999),
      createdById: casual.integer(1, 999),
      modifiedById: casual.integer(1, 999),
      created: casual.date('YYYY-MM-DD'),
      modified: casual.date('YYYY-MM-DD'),
      errors: [casual.sentence, casual.sentence],

      name: casual.sentence,
      description: casual.sentences(5),
      ownerId: casual.url,
      visibility: Visibility.Public,
      currentVersion: casual.word,
    }

    const newOwnerId = casual.url;
    const newCreatedById = casual.integer(1, 99);

    const template = new Template(opts);
    const clone = template.clone(newCreatedById, newOwnerId);

    // Underlying MySqlModel properties are correctly set
    expect(clone.id).toBeFalsy();
    expect(clone.created).toBeTruthy();
    expect(clone.createdById).toEqual(newCreatedById);
    expect(clone.modified).toBeTruthy();
    expect(clone.modifiedById).toEqual(newCreatedById);
    expect(clone.errors).toEqual([]);

    // Template properties are correctly set
    expect(clone.name).toEqual(`Copy of ${opts.name}`);
    expect(clone.description).toEqual(opts.description);
    expect(clone.ownerId).toEqual(newOwnerId);
    expect(clone.visibility).toEqual(Visibility.Private);
    expect(clone.currentVersion).toBeFalsy();
  });
});
