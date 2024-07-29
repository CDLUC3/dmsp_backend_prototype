import { Affiliation, AffiliationSearch } from "../types";

// Represents an Institution, Organization or Company
export class AffiliationModel {
  public id!: string;
  public provenance!: string;
  public provenanceSyncDate!: string;
  public name!: string;
  public displayName!: string;
  public active!: boolean;
  public funder!: boolean;
  public fundref: string;
  public types: string[];
  public acronyms: string[];
  public aliases: string[];
  public countryCode: string;
  public countryName: string;
  public domain: string;
  public wikipediaURL: string;
  public links: string[];
  public relationships: AffiliationRelationship[];

  public addresses: AffiliationAddress[];
  private externalIds: ExternalId[];

  // Initialize a new Affiliation
  constructor(options) {
    // This is our opportunity to convert ruby variable names over to JS
    this.provenance = options._SOURCE || 'dmptool';
    this.provenanceSyncDate = options._SOURCE_SYNCED_AT || new Date().toUTCString();
    this.id = options.ID || options.id;
    this.types = options.types || [];
    this.name = options.name;
    this.displayName = options.label || options.displayName || options.name;
    this.active = options.active === 1;
    this.funder = options.funder === 1;
    this.acronyms = options.acronyms || [];
    this.aliases = options.aliases || [];
    this.countryCode = options.country?.country_code || options.countryCode;
    this.countryName = options.country?.country_name || options.countryName;
    this.domain = options.domain;
    this.links = options.links || [];

    // If there are any addresses defined, initialize them
    this.addresses = [];
    if(Array.isArray(options.addresses)) {
      this.addresses = options.addresses.map((addr) => new AffiliationAddress(addr));
    }

    // If there are any relationships defined, initialize them
    this.relationships = [];
    if(Array.isArray(options.relationships)) {
      this.relationships = options.relationships.map((rel) => new AffiliationRelationship(rel));
    }

    // If there are any external_ids defined, initialize them and set the FundRef ID
    this.externalIds = [];
    if (options.hasOwnProperty('external_ids')) {
      this.externalIds = Object.keys(options.external_ids).map((key) => {
        return new ExternalId({
          type: key,
          ...options.external_ids[key]
        })
      });
      this.fundref = this.externalIds?.find(id => id.type === 'fundref')?.id;
    }
  }
}

// Represents an external identifier like FundRef, GRID, ISSN, etc.
class ExternalId {
  public type!: string;
  public id!: string;

  constructor(options) {
    const allIds = Array.isArray(options.all) ? options.all : [options.all]

    this.type = options.type?.toLowerCase();
    this.id = options.preferred ? options.preferred : allIds[0];
  }
}

// Represents the city, state, country and Lat+Long for the affiliation
export class AffiliationAddress {
  public city: string;
  public state: string;
  public stateCode: string;
  public countryGeonamesId: number;
  public lat: number;
  public lng: number;

  constructor(options) {
    this.city = options.city;
    this.state = options.state;
    this.stateCode = options.state_code;
    this.countryGeonamesId = options.country_geonames_id;
    this.lat = options.lat;
    this.lng = options.lng
  }
}

// Represents a relationship between 2 affiliations
export class AffiliationRelationship {
  public id!: string;
  public type!: string;
  public name: string;

  constructor(options) {
    this.id = options.id;
    this.type = options.type;
    this.name = options.label || options.name;
  }
}

// A pared down version of the full Affiliation object. This type is returned by
// our index searches
export class AffiliationSearchModel {
  public id!: string;
  public name!: string;
  public funder!: boolean;
  public fundref: string;
  public aliases: string[];
  public countryCode: string;
  public countryName: string;
  public links: string[];

  // Initialize a new AffiliationSearch result
  constructor(options) {
    const countryParts = options.country_name || [];

    // This is our opportunity to convert ruby variable names over to JS
    this.id = options.ror_id || options.id;
    this.name = options.name;
    this.funder = options.hasOwnProperty('fundref_id');
    this.fundref = options.fundref_url || options.fundref;
    this.aliases = options.aliases || [];
    this.countryCode = countryParts.find((cntry) => cntry.length <= 3);
    this.countryName = countryParts.find((cntry) => cntry.length > 3);;
    this.links = options.links || [];
  }
}
