import { Affiliation, AffiliationSearch } from '../Affiliation';

const rawAffiliationSearchRecord = {
  "PK": "AFFILIATION",
  "SK": "advancedphotonsciencesunitedstates",
  "aliases": ["Photon Sciences", "APS"],
  "countryCode": "us",
  "countryName": "United States",
  "fundref_id": "100006389",
  "fundref_url": "https://api.crossref.org/funders/100006389",
  "links": [ "photonsci.com" ],
  "name": "Advanced Photon Sciences (United States)",
  "ror_id": "00182ep39",
  "ror_url": "https://ror.org/00182ep39",
  "searchName": "advancedphotonsciencesunitedstates"
};

const rawAffiliationRecord = {
  "RESOURCE_TYPE": "AFFILIATION",
  "ID": "https://ror.org/00dmfq477",
  "acronyms": [ "UCOP" ],
  "aliases": ["UC Office of the President"],
  "active": 1,
  "addresses": [
    {
      "city": "Oakland",
      "country_geonames_id": 6252001,
      "geonames_city": {
        "city": "Oakland",
        "geonames_admin1": {
          "ascii_name": "California",
          "code": "US.CA",
          "id": 5332921,
          "name": "California"
        },
        "geonames_admin2": {
          "ascii_name": "Alameda",
          "code": "US.CA.001",
          "id": 5322745,
          "name": "Alameda"
        },
        "id": 5378538,
        "license": {
          "attribution": "Data from geonames.org under a CC-BY 3.0 license",
          "license": "http://creativecommons.org/licenses/by/3.0/"
        }
      },
      "lat": 37.80437,
      "lng": -122.2708,
      "state": "California",
      "state_code": "US-CA"
    }
  ],
  "country": { "country_code": "US", "country_name": "United States" },
  "domain": "ucop.edu",
  "external_ids": {
    "FundRef": { "all": [ "100014576" ], "preferred": "100014576" },
    "ISNI": { "all": [ "0000 0004 0615 4051" ], "preferred": "0000 0004 0615 4051" }
  },
  "lables": [
    {
      "label": "Oficina del Presidente de la Universidad de California",
      "iso639": "es"
    }
  ],
  "funder": 1,
  "label": "University of California Office of the President (ucop.edu)",
  "links": [ "https://www.ucop.edu" ],
  "name": "University of California Office of the President",
  "parents": [ "https://ror.org/00pjdza24" ],
  "relationships": [
    {
      "id": "https://ror.org/00pjdza24",
      "label": "University of California System",
      "type": "Parent"
    }
  ],
  "searchable_names": [
    "university of california office of the president",
    "ucop.edu",
    "UCOP"
  ],
  "types": [ "Education" ],
  "_SOURCE": "ROR",
  "_SOURCE_SYNCED_AT": "2024-07-23T00:04:11Z",
}

describe('Affiliation constructor', () => {
  it('should set the expected defaults', () => {
    const affiliation = new Affiliation({});
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
    const affiliation = new Affiliation(rawAffiliationRecord);
    expect(affiliation.id).toEqual(rawAffiliationRecord.ID);
    expect(affiliation.provenance).toEqual(rawAffiliationRecord._SOURCE);
    expect(affiliation.provenanceSyncDate).toEqual(rawAffiliationRecord._SOURCE_SYNCED_AT);
    expect(affiliation.types).toEqual(Array.isArray(rawAffiliationRecord.types) ? rawAffiliationRecord.types : []);
    expect(affiliation.name).toEqual(rawAffiliationRecord.name);
    expect(affiliation.displayName).toEqual(rawAffiliationRecord.label);
    expect(affiliation.active).toEqual(rawAffiliationRecord.active === 1);
    expect(affiliation.funder).toEqual(rawAffiliationRecord.funder === 1);
    expect(affiliation.acronyms).toEqual(Array.isArray(rawAffiliationRecord.acronyms) ? rawAffiliationRecord.acronyms : []);
    expect(affiliation.aliases).toEqual(Array.isArray(rawAffiliationRecord.aliases) ? rawAffiliationRecord.aliases : []);
    expect(affiliation.countryCode).toEqual(rawAffiliationRecord.country?.country_code);
    expect(affiliation.countryName).toEqual(rawAffiliationRecord.country?.country_name);
    expect(affiliation.domain).toEqual(rawAffiliationRecord.domain);
    expect(affiliation.links).toEqual(Array.isArray(rawAffiliationRecord.links) ? rawAffiliationRecord.links : []);
  });

  it('should ignore unexpected properties', () => {
    const affiliation = new Affiliation(rawAffiliationRecord);
    expect(affiliation.id).toEqual(rawAffiliationRecord.ID);
    expect(affiliation['test']).toBeUndefined();
  });

  it('should include an AffiliationAddress for each addresses entry', () => {
    const affiliation = new Affiliation(rawAffiliationRecord);
    expect(affiliation.id).toEqual(rawAffiliationRecord.ID);
    affiliation.addresses.forEach(address => {
      const addrs = rawAffiliationRecord.addresses.find((a) => a.lat === address.lat && a.lng === address.lng);
      expect(addrs.city).toEqual(address.city);
      expect(addrs.state).toEqual(address.state);
      expect(addrs.state_code).toEqual(address.stateCode);
      expect(addrs.country_geonames_id).toEqual(address.countryGeonamesId);
      expect(addrs.lat).toEqual(address.lat);
      expect(addrs.lng).toEqual(address.lng);
    });
  });

  it('should include an AffiliationRelationship for each relationships entry', () => {
    const affiliation = new Affiliation(rawAffiliationRecord);
    expect(affiliation.id).toEqual(rawAffiliationRecord.ID);
    affiliation.relationships.forEach(relation => {
      const relations = rawAffiliationRecord.relationships.find((r) => r.id === relation.id);
      expect(relations.type).toEqual(relation.type);
      expect(relations.label).toEqual(relation.name);
    });
  });

  it('should include an AffiliationLocale for each locale entry', () => {
    const affiliation = new Affiliation(rawAffiliationRecord);
    expect(affiliation.id).toEqual(rawAffiliationRecord.ID);
    affiliation.locales.forEach(locale => {
      const locales = rawAffiliationRecord.lables.find((l) => l.iso639 === locale.locale);
      expect(locales.iso639).toEqual(locale.locale);
      expect(locales.label).toEqual(locale.label);
    });
  });

  it('should handle Fundref as the `preferred` id in the `external_id`', () => {
    const props = { "external_ids": [{ "type": "FundRef", "preferred": "9999999999" }] };
    const affiliation = new Affiliation(props);
    expect(affiliation.fundref).toEqual(props.external_ids[0].preferred);
  });

  it('should handle Fundref as the 1st `all` entry when it is an Array', () => {
    const props = { "external_ids": [{ "type": "FundRef", "all": ["9999999999", "000000000"] }] };
    const affiliation = new Affiliation(props);
    expect(affiliation.fundref).toEqual(props.external_ids[0].all[0]);
  });

  it('should handle Fundref as the `all` entry what it is a string', () => {
    const props = { "external_ids": [{ "type": "FundRef", "all": "9999999999" }] };
    const affiliation = new Affiliation(props);
    expect(affiliation.fundref).toEqual(props.external_ids[0].all);
  });

  it('handles relationship with a `name` instead of `label', () => {
    const props = { "relationships": [{ "type": "Tester", "name": "TEST" }] };
    const affiliation = new Affiliation(props);
    expect(affiliation.relationships[0].name).toEqual(props.relationships[0].name);
  });
});

describe('AffiliationSearch constructor', () => {
  it('should set the expected defaults', () => {
    const affiliation = new AffiliationSearch({});
    expect(affiliation.id).toBe(undefined);
    expect(affiliation.fetchId).toBe(undefined);
    expect(affiliation.name).toBe(undefined);
    expect(affiliation.funder).toBe(false);
    expect(affiliation.fundref).toBe(undefined);
    expect(affiliation.aliases).toEqual([]);
    expect(affiliation.countryCode).toBe(undefined);
    expect(affiliation.countryName).toBe(undefined);
    expect(affiliation.links).toEqual([]);
  });

  it('should set the expected properties', () => {
    const affiliation = new AffiliationSearch(rawAffiliationSearchRecord);
    expect(affiliation.id).toEqual(rawAffiliationSearchRecord.ror_url);
    expect(affiliation.fetchId).toEqual(affiliation.id.replace(/https?:\/\//g, ''));
    expect(affiliation.name).toEqual(rawAffiliationSearchRecord.name);
    const isFunder = Object.prototype.hasOwnProperty.call(rawAffiliationSearchRecord, "fundref_id");
    expect(affiliation.funder).toEqual(isFunder);
    expect(affiliation.fundref).toEqual(rawAffiliationSearchRecord.fundref_url);
    expect(affiliation.aliases).toEqual(Array.isArray(rawAffiliationSearchRecord.aliases) ? rawAffiliationSearchRecord.aliases : []);
    expect(affiliation.countryCode).toEqual(rawAffiliationSearchRecord.countryCode);
    expect(affiliation.countryName).toEqual(rawAffiliationSearchRecord.countryName);
    expect(affiliation.links).toEqual(Array.isArray(rawAffiliationSearchRecord.links) ? rawAffiliationSearchRecord.links : []);
  });
});
