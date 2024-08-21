import casual from 'casual';
import { Visibility } from "../Template";
import { VersionedTemplate, VersionType } from '../VersionedTemplate';

describe('VersionedTemplate', () => {
  let templateId;
  let ownerId;
  let version;
  let name;
  let versionedById;
  let versioned;

  beforeEach(() => {
    templateId = casual.integer(1, 999);
    ownerId = casual.url;
    version = casual.word;
    name = casual.sentence;
    versionedById = casual.integer(1, 999);

    versioned = new VersionedTemplate({ templateId, version, name, ownerId, versionedById });
  });

  it('constructor should initialize as expected', () => {
    expect(versioned.id).toBeFalsy();
    expect(versioned.templateId).toEqual(templateId);
    expect(versioned.version).toEqual(version);
    expect(versioned.name).toEqual(name);
    expect(versioned.ownerId).toEqual(ownerId);
    expect(versioned.versionedById).toEqual(versionedById);
    expect(versioned.visibility).toEqual(Visibility.Private);
    expect(versioned.created).toBeTruthy();
    expect(versioned.active).toBe(false);
    expect(versioned.comment).toEqual('');
  });

  it('isValid returns true when the record is valid', async () => {
    expect(await versioned.isValid()).toBe(true);
  });

  it('isValid returns false if the templateId is null', async () => {
    versioned.templateId = null;
    expect(await versioned.isValid()).toBe(false);
    expect(versioned.errors.length).toBe(1);
    expect(versioned.errors[0].includes('Template')).toBe(true);
  });

  it('isValid returns false if the versionedById is null', async () => {
    versioned.versionedById = null;
    expect(await versioned.isValid()).toBe(false);
    expect(versioned.errors.length).toBe(1);
    expect(versioned.errors[0].includes('Versioned by')).toBe(true);
  });

  it('isValid returns false if the version is blank', async () => {
    versioned.version = '';
    expect(await versioned.isValid()).toBe(false);
    expect(versioned.errors.length).toBe(1);
    expect(versioned.errors[0].includes('Version')).toBe(true);
  });

  it('isValid returns false if the name is blank', async () => {
    versioned.name = '';
    expect(await versioned.isValid()).toBe(false);
    expect(versioned.errors.length).toBe(1);
    expect(versioned.errors[0].includes('Name')).toBe(true);
  });

  it('isValid returns false if the ownerId is null', async () => {
    versioned.ownerId = null;
    expect(await versioned.isValid()).toBe(false);
    expect(versioned.errors.length).toBe(1);
    expect(versioned.errors[0].includes('Owner')).toBe(true);
  });
});
