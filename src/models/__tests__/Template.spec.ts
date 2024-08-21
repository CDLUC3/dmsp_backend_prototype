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
