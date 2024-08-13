import { logger, formatLogMessage } from "../logger";
import { DMPToolAPI } from "../datasources/dmptoolAPI";
import { MyContext } from "../context";
// import { Affiliation } from "../types";

// Represents an Institution, Organization or Company
export class Affiliation {
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
  public locales: AffiliationLocale[];
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

    // If there are any labels/locales defined, initialize them
    this.locales = [];
    if(Array.isArray(options.locales)) {
      this.locales = options.labels.map((lbl) => new AffiliationLocale(lbl));
    }

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
    if (Object.prototype.hasOwnProperty.call(options, "external_ids")) {
      this.externalIds = Object.keys(options.external_ids).map((key) => {
        return new ExternalId({
          type: key,
          ...options.external_ids[key]
        })
      });
      this.fundref = this.externalIds?.find(id => id.type === 'fundref')?.id;
    }
  }

  static async findById(caller: string, context: MyContext, id: string): Promise<Affiliation | null> {
    const { logger, dataSources } = context;
    const logMessage = `Affiliation.findById query for ${caller}, affiliation: ${id}`;
    const affiliationId = id.replace(/https?:\/\//g, '')
    return new Promise((resolve, reject) => {
      dataSources.dmptoolAPIDataSource.getAffiliation(affiliationId)
        .then(row => {
          formatLogMessage(logger).debug(logMessage);
          resolve(row);
        })
        .catch(err => {
          formatLogMessage(logger).error(`Affiliation.findById ERROR for ${caller}, affiliation: ${id} - ${err.message}`);
          reject(err)
        });
    });
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

export class AffiliationLocale {
  public label!: string;
  public locale!: string;

  constructor(options) {
    this.label = options.label;
    this.locale = options.iso639;
  }
}

// A pared down version of the full Affiliation object. This type is returned by
// our index searches
export class AffiliationSearch {
  public id!: string;
  public fetchId!: string;
  public name!: string;
  public displayName!: string;
  public funder!: boolean;
  public fundref: string;
  public aliases: string[];
  public countryCode: string;
  public countryName: string;
  public links: string[];
  public locales: AffiliationLocale[];

  // Initialize a new AffiliationSearch result
  constructor(options) {
    const suffix = options.domain || options.countryName;

    // This is our opportunity to convert ruby variable names over to JS
    this.id = options.ror_url || options.id;
    this.fetchId = this.id?.replace(/https?:\/\//g, '');
    this.name = options.name;
    this.displayName = suffix ? `${options.name} (${suffix})` : options.name;
    this.funder = Object.prototype.hasOwnProperty.call(options, "fundref_id");
    this.fundref = options.fundref_url || options.fundref;
    this.aliases = options.aliases || [];
    this.countryCode = options.countryCode;
    this.countryName = options.countryName;
    this.links = options.links || [options.domain];

    // If there are any labels/locales defined, initialize them
    this.locales = [];
    if(Array.isArray(options.locales)) {
      this.locales = options.labels?.map((lbl) => new AffiliationLocale(lbl));
    }
  }

  static async search(context: MyContext, options: { name: string, funderOnly: boolean }): Promise<AffiliationSearch[] | null> {
    const { logger, dataSources } = context;
    const logMessage = `Resolving query affiliations(options: '${options}')`;

    return new Promise((resolve, reject) => {
      dataSources.dmptoolAPIDataSource.getAffiliations(options)
        .then(rows => {
          formatLogMessage(logger).debug(logMessage);
          resolve(rows)
        })
        .catch(err => {
          formatLogMessage(logger, { err, options }).error(`ERROR: ${logMessage} - ${err.message}`);
          reject(err)
        });
    });
  }
}
