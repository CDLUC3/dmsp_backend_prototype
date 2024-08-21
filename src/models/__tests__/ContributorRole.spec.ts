import casual from 'casual';
import { ContributorRole } from '../ContributorRole';

describe('ContributorRole', () => {
  it('constructor should initialize as expected', () => {
    const displayOrder = casual.integer(1, 9);
    const label = casual.words(3);
    const url = casual.url;
    const createdById = casual.integer(1, 999);

    const role = new ContributorRole({ displayOrder, label, url, createdById });

    expect(role.displayOrder).toEqual(displayOrder);
    expect(role.label).toEqual(label);
    expect(role.url).toEqual(url);
    expect(role.description).toBeFalsy();
    expect(role.createdById).toEqual(createdById);
  });

  it('isValid returns true when the displayOrder, label and url are present', async () => {
    const displayOrder = casual.integer(1, 9);
    const label = casual.words(3);
    const url = casual.url;
    const createdById = casual.integer(1, 999);

    const role = new ContributorRole({ displayOrder, label, url, createdById });
    expect(await role.isValid()).toBe(true);
  });

  it('isValid returns false when the displayOrder is NOT present', async () => {
    const label = casual.words(3);
    const url = casual.url;
    const createdById = casual.integer(1, 999);

    const role = new ContributorRole({ label, url, createdById });
    expect(await role.isValid()).toBe(false);
    expect(role.errors.length).toBe(1);
    expect(role.errors[0].includes('Display order')).toBe(true);
  });

  it('isValid returns false when the label is NOT present', async () => {
    const displayOrder = casual.integer(1, 9);
    const url = casual.url;
    const createdById = casual.integer(1, 999);

    const role = new ContributorRole({ displayOrder, url, createdById });
    expect(await role.isValid()).toBe(false);
    expect(role.errors.length).toBe(1);
    expect(role.errors[0].includes('Label')).toBe(true);
  });

  it('isValid returns false when the url is NOT present', async () => {
    const displayOrder = casual.integer(1, 9);
    const label = casual.words(3);
    const createdById = casual.integer(1, 999);

    const role = new ContributorRole({ displayOrder, label, createdById });
    expect(await role.isValid()).toBe(false);
    expect(role.errors.length).toBe(1);
    expect(role.errors[0].includes('URL')).toBe(true);
  });
});
