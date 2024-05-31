import casual from 'casual';
import { BaseMock } from './BaseMock';

// Abstract class that provides common functionality for all Mocks
export class MockMySQLTable extends BaseMock {
  private _store: any[];

  // Add the incoming items to the local store
  constructor(items) {
    super();

    const entries = items || [];
    this._store = entries.map((entry, idx) => {
      return this._prepareNewMySQLRecord({ id: (idx + 1).toString(), ...entry });
    });
  }

  // Return all items within the store
  public items() {
    return this._store;
  }

  // Return the number of items in the store
  public count() {
    return this._store?.length || 0;
  }

  // Return a random item from the store
  public randomItem() {
    if (!this._store) {
      return null;
    }
    return this._store[Math.floor(Math.random() * this._store.length)];
  }

  // Find an entry in the store by it's id
  public findItemById(id) {
    return this._store.find((item) => item.id === id) || null;
  }

  // Find an entry in the store by a property other than it's id
  public findItemByProperty(propertyName, value) {
    return this._store.find((item) => item[propertyName] === value) || null;
  }

  // Add an item to the store
  public addItem(item) {
    const newItem = this._prepareNewMySQLRecord(item);
    const existing = this.findItemById(newItem?.id);
    if (!existing) {
      this._store.push(newItem);
      return newItem;
    }
    return null;
  }

  // update an item within the store
  public updateItem(item) {
    const existing = this.findItemById(item?.id);
    if (existing) {
      const idx = this._store.indexOf(existing);
      this._store[idx] = this._prepareUpdatedMySQLRecord({ ...existing, ...item });
      return this.findItemById(item?.id);
    }
    return null;
  }

  // remove an item from the store
  public removeItem(id) {
    const existing = this.findItemById(id);
    if (existing) {
      const idx = this._store.indexOf(existing);
      delete this._store[idx];
      return true;
    }
    return false;
  }

  // Standardized way to create a new mock record for a MySQL table
  private _prepareNewMySQLRecord(args) {
    return {
      // Allow the id to be passed in and thus override this default
      id: casual.uuid,
      ...args,
      // Always override any created/modified dates
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    }
  }

  private _prepareUpdatedMySQLRecord(args) {
    return {
      ...args,
      // Always override the modified date
      modified: new Date().toISOString(),
    }
  }
}