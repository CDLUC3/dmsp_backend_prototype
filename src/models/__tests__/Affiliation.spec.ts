import { AffiliationModel, AffiliationSearchModel } from '../Affiliation';
import { data as mockData, searchData as mockSearchData } from '../../mocks/affiliation';

const affiliationProps = mockData[0];
const affiliationSearchProps = mockSearchData[0];

describe('Affiliation constructor', () => {
  it('should set the expected defaults', () => {
    const affiliation = new AffiliationModel({});
    expect(affiliation.provenance).toEqual('dmptool');
    expect(affiliation.provenanceSyncDate === undefined).toBe(false);
    expect(affiliation.active).toBe(false);
    expect(affiliation.funder).toBe(false);
    expect(affiliation.types).toEqual([]);
    expect(affiliation.acronyms).toEqual([]);
    expect(affiliation.aliases).toEqual([]);
    expect(affiliation.links).toEqual([]);
    expect(affiliation.addresses).toEqual([]);
    expect(affiliation.relationships).toEqual([]);
    expect(affiliation.id).toBe(undefined);
    expect(affiliation.name).toBe(undefined);
    expect(affiliation.displayName).toBe(undefined);
    expect(affiliation.countryCode).toBe(undefined);
    expect(affiliation.countryName).toBe(undefined);
    expect(affiliation.domain).toBe(undefined);
  });

  it('should set the expected properties', () => {
    const affiliation = new AffiliationModel(affiliationProps);
    expect(affiliation.id).toEqual(affiliationProps.ID);
    expect(affiliation.provenance).toEqual(affiliationProps._SOURCE);
    expect(affiliation.provenanceSyncDate).toEqual(affiliationProps._SOURCE_SYNCED_AT);
    expect(affiliation.types).toEqual(Array.isArray(affiliationProps.types) ? affiliationProps.types : []);
    expect(affiliation.name).toEqual(affiliationProps.name);
    expect(affiliation.displayName).toEqual(affiliationProps.label);
    expect(affiliation.active).toEqual(affiliationProps.active === 1);
    expect(affiliation.funder).toEqual(affiliationProps.funder === 1);
    expect(affiliation.acronyms).toEqual(Array.isArray(affiliationProps.acronyms) ? affiliationProps.acronyms : []);
    expect(affiliation.aliases).toEqual(Array.isArray(affiliationProps.aliases) ? affiliationProps.aliases : []);
    expect(affiliation.countryCode).toEqual(affiliationProps.country?.country_code);
    expect(affiliation.countryName).toEqual(affiliationProps.country?.country_name);
    expect(affiliation.domain).toEqual(affiliationProps.domain);
    expect(affiliation.links).toEqual(Array.isArray(affiliationProps.links) ? affiliationProps.links : []);
  });

  it('should ignore unexpected properties', () => {
    const affiliation = new AffiliationModel(affiliationProps);
    expect(affiliation.id).toEqual(affiliationProps.ID);
    expect(affiliation['test']).toBeUndefined();
  });

  it('should include an AffiliationAddress for each addresses entry', () => {
    const affiliation = new AffiliationModel(affiliationProps);
    expect(affiliation.id).toEqual(affiliationProps.ID);
    affiliation.addresses.forEach(address => {
      const addrs = affiliationProps.addresses.find((a) => a.lat === address.lat && a.lng === address.lng);
      expect(addrs.city).toEqual(address.city);
      expect(addrs.state).toEqual(address.state);
      expect(addrs.state_code).toEqual(address.stateCode);
      expect(addrs.country_geonames_id).toEqual(address.countryGeonamesId);
      expect(addrs.lat).toEqual(address.lat);
      expect(addrs.lng).toEqual(address.lng);
    });
  });

  it('should include an AffiliationRelationship for each relationships entry', () => {
    const affiliation = new AffiliationModel(affiliationProps);
    expect(affiliation.id).toEqual(affiliationProps.ID);
    affiliation.relationships.forEach(relation => {
      const relations = affiliationProps.relationships.find((r) => r.id === relation.id);
      expect(relations.type).toEqual(relation.type);
      expect(relations.label).toEqual(relation.name);
    });
  });

  it('should handle Fundref as the `preferred` id in the `external_id`', () => {
    const props = { "external_ids": [{ "type": "FundRef", "preferred": "9999999999" }] };
    const affiliation = new AffiliationModel(props);
    expect(affiliation.fundref).toEqual(props.external_ids[0].preferred);
  });

  it('should handle Fundref as the 1st `all` entry when it is an Array', () => {
    const props = { "external_ids": [{ "type": "FundRef", "all": ["9999999999", "000000000"] }] };
    const affiliation = new AffiliationModel(props);
    expect(affiliation.fundref).toEqual(props.external_ids[0].all[0]);
  });

  it('should handle Fundref as the `all` entry what it is a string', () => {
    const props = { "external_ids": [{ "type": "FundRef", "all": "9999999999" }] };
    const affiliation = new AffiliationModel(props);
    expect(affiliation.fundref).toEqual(props.external_ids[0].all);
  });

  it('handles relationship with a `name` instead of `label', () => {
    const props = { "relationships": [{ "type": "Tester", "name": "TEST" }] };
    const affiliation = new AffiliationModel(props);
    expect(affiliation.relationships[0].name).toEqual(props.relationships[0].name);
  });
});

describe('AffiliationSearch constructor', () => {
  it('should set the expected defaults', () => {
    const affiliation = new AffiliationSearchModel({});
    expect(affiliation.id).toBe(undefined);
    expect(affiliation.name).toBe(undefined);
    expect(affiliation.funder).toBe(false);
    expect(affiliation.fundref).toBe(undefined);
    expect(affiliation.aliases).toEqual([]);
    expect(affiliation.countryCode).toBe(undefined);
    expect(affiliation.countryName).toBe(undefined);
    expect(affiliation.links).toEqual([]);
  });

  it('should set the expected properties', () => {
    const affiliation = new AffiliationSearchModel(affiliationSearchProps);
    expect(affiliation.id).toEqual(affiliationSearchProps.ror_id);
    expect(affiliation.name).toEqual(affiliationSearchProps.name);
    expect(affiliation.funder).toEqual(affiliationSearchProps.hasOwnProperty('fundref_id'));
    expect(affiliation.fundref).toEqual(affiliationSearchProps.fundref_url);
    expect(affiliation.aliases).toEqual(Array.isArray(affiliationSearchProps.aliases) ? affiliationSearchProps.aliases : []);
    const parts =  affiliationSearchProps.country_name || [];
    const code = parts.find((c) => c.length <= 3);
    const name = parts.find((n) => n.length > 3);
    expect(affiliation.countryCode).toEqual(code);
    expect(affiliation.countryName).toEqual(name);
    expect(affiliation.links).toEqual(Array.isArray(affiliationSearchProps.links) ? affiliationSearchProps.links : []);
  });
});
