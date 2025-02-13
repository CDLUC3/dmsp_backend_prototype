import { Buffer } from "buffer";
import { AugmentedRequest, RESTDataSource } from "@apollo/datasource-rest";
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import { formatLogMessage, logger } from '../logger';
import { Affiliation, AffiliationSearch } from "../models/Affiliation"
import { JWTAccessToken } from '../services/tokenService';
import { MyContext } from "../context";

// Singleton class that retrieves an Auth token from the API
export class Authorizer extends RESTDataSource {
  static #instance: Authorizer;

  override baseURL = process.env.DMPHUB_AUTH_URL;

  public env: string;
  public oauth2Token: string;

  private creds: string;
  private expiry: Date;

  constructor() {
    super();

    this.env = this.baseURL.includes('uc3prd') ? 'prd' : (this.baseURL.includes('uc3stg') ? 'stg' : 'dev');
    // Base64 encode the credentials for the auth request
    const hdr = `${process.env.DMPHUB_API_CLIENT_ID}:${process.env.DMPHUB_API_CLIENT_SECRET}`;
    this.creds = Buffer.from(hdr, 'binary').toString('base64');

    this.authenticate();
  }

  // Singleton function to ensure we aren't reauthenticating every time
  public static get instance(): Authorizer {
    if (!Authorizer.#instance) {
      Authorizer.#instance = new Authorizer();
    }

    return Authorizer.#instance;
  }

  // Call the authenticate method and set this class' expiry timestamp
  async authenticate() {
    // const context = buildContext(logger);
    const response = await this.post(`/oauth2/token`);

    logger.info(`Authenticating with DMPHub`);
    this.oauth2Token = response.access_token;
    const currentDate = new Date();
    this.expiry = new Date(currentDate.getTime() + 600 * 1000);
  }

  // Check if the current token has expired
  hasExpired() {
    const currentDate = new Date();
    return currentDate >= this.expiry;
  }

  // Attach all of the necessary HTTP headers and the body prior to calling the token endpoint
  override willSendRequest(_path: string, request: AugmentedRequest) {
    request.headers['authorization'] =`Basic ${this.creds}`;
    request.headers['content-type'] = 'application/x-www-form-urlencoded';
    request.body = `grant_type=client_credentials&scope=${this.baseURL}/${this.env}.read ${this.baseURL}/${this.env}.write`;
  }
}

// DataSource that interacts with the DMPHub API. This file is similar to the DdmphubAPI.ts. It has
// been separated out because these endpoints will eventually be replaced with queries to
// OpenSearch once that has been deployed.
export class DMPHubAPI extends RESTDataSource {
  override baseURL = process.env.DMPHUB_API_BASE_URL;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private token: JWTAccessToken;
  private authorizer: Authorizer;

  constructor(options: { cache: KeyValueCache, token: JWTAccessToken }) {
    super(options);

    this.token = options.token;

    this.authorizer = Authorizer.instance;
  }

  // Add the Authorization token to the headers prior to the request
  override willSendRequest(_path: string, request: AugmentedRequest) {
    // Check the current token's expiry. If it has expired re-authenticate
    if (this.authorizer.hasExpired) {
      this.authorizer.authenticate();
    }
    request.headers['authorization'] = `Bearer ${this.authorizer.oauth2Token}`;
  };

  // Remove the protocol from the DMSP ID and encode it but preserve the `/` characters
  removeProtocol(id) {
    return id.toString().replace(/^(https?:\/\/|https?%3A%2F%2F)/i, '').replace(/%2F/g, '/');
  }

  // Fetch a single DMP from the DMPHub API
  async getDMP(context: MyContext, dmpId: string, version = 'LATEST'): Promise<DMPHubPlanInterface | null> {
    try {
      const id = this.removeProtocol(dmpId);
      const sanitizedDOI = encodeURI(id);
      const sanitizedVersion = version === 'LATEST' ? `?version=${encodeURI(version)}` : '';
      const path = `dmps/${sanitizedDOI}${sanitizedVersion}`;

      formatLogMessage(context).info(`Calling DMPHub: ${this.baseURL}/${path}`)
      const response = await this.get(path);

console.log(response)

      if (response?.status === 200 && Array.isArray(response?.items) && response?.items?.length > 0) {
        return response?.items[0]?.dmp as DMPHubPlanInterface;
      }

      formatLogMessage(context).error(
        { dmpId, code: response?.status, errs: response?.errors },
        'Error retrieving DMP from DMPHub API'
      );
      return null;
    } catch(err) {
      formatLogMessage(context).error({ dmpId, err }, 'Error calling DMPHub API getDMP.');
      throw(err);
    }
  }

  // Retrieve a single affiliation record
  async getAffiliation(context: MyContext, affiliationId: string) {
    try {
      const id = this.removeProtocol(affiliationId);
      formatLogMessage(context).info(`Calling DMPHub: ${this.baseURL}/affiliations/${id}`)
      const response = await this.get(`affiliations/${encodeURI(id)}`);

      if (response) {
        const affiliation = new Affiliation(response);
        return affiliation ? affiliation : null;
      }
      return null;
    } catch(err) {
      formatLogMessage(context).error(err, 'Error calling DMPHub API getAffiliation.');
      throw(err);
    }
  }

  // Perform a search for affiliation records
  async getAffiliations(
    context: MyContext,
    { name, funderOnly = false }: { name: string, funderOnly?: boolean }
  ) {
    try {
      const sanitizedName = encodeURI(name);
      const funderBool = funderOnly ? (funderOnly === true) : false;
      const queryString = `search=${sanitizedName}&funderOnly=${funderBool}`;
      formatLogMessage(context).info(`Calling DMPHub: ${this.baseURL}/affiliations?${queryString}`)

      const response = await this.get(`affiliations?${queryString}`);
      if (response) {
        const affiliations = response.map((rec) => new AffiliationSearch(rec)) || [];
        return affiliations ? affiliations : [];
      }
      return null;
    } catch(err) {
      formatLogMessage(context).error(err, 'Error calling DMPHub API getAffiliations.');
      throw(err);
    }
  }
}

// See the DMPHub API Wiki for the full list of available fields:
//   https://github.com/CDLUC3/dmsp_api_prototype/wiki/api-overview#examples-of-dmp-json-metadata
export interface DMPHubPlanInterface {
  PK: string;
  SK: string;
  contact: DMPHubContact;
  contributors: [DMPHubContributor];
  cost: [DMPHubCost];
  created: string;
  dataset: [DMPHubDataset];
  description: string;
  dmp_id: DMPHubIdentifier;
  dmphub_provenance_id: string;
  dmphub_versions: [DMPHubVersion];
  dmproadmap_featured: boolean;
  dmproadmap_privacy: DMPHubVisibility;
  dmproadmap_template_id: number;
  dmproadmap_related_identifiers: [DMPHubRelatedIdentifier];
  dmproadmap_research_facilities: [DMPHubResearchFacility];
  ethical_issues_description: string;
  ethical_issues_exist: DMPHubBoolean;
  ethical_issues_report: string;
  language: DMPHubLanguageCode;
  modified: string;
  project: [DMPHubProject];
  registered: string;
  title: string;
}

interface DMPHubAffiliation {
  name: string;
  affiliation_id: DMPHubIdentifier;
}

interface DMPHubContact {
  contact_id: DMPHubIdentifier;
  dmproadmap_affiliation: DMPHubAffiliation;
  name: string;
  mbox: string;
}

interface DMPHubContributor {
  contributor_id: DMPHubIdentifier;
  dmproadmap_affiliation: DMPHubAffiliation;
  name: string;
  mbox: string;
  role: [string];
}

interface DMPHubCost {
  title: string;
  currency_code: DMPHubCurrencyCode;
  description: string;
  value: number;
}

interface DMPHubDataset {
  data_quality_assurance: [string];
  dataset_id: DMPHubIdentifier;
  description: string;
  distribution: [DMPHubDistribution];
  issued: string;
  keyword: [string];
  metadata: [DMPHubMetadata];
  personal_data: DMPHubBoolean;
  preservation_statement: string;
  security_and_privacy: [DMPHubSecurityAndPrivacy];
  sensitive_data: DMPHubBoolean;
  technical_resource: [DMPHubTechnicalResource];
  title: string;
  type: string;
}

interface DMPHubDistribution {
  available_until: string;
  byte_size: number;
  data_access: DMPHubDataAccess;
  description: string;
  host: DMPHubHost;
  license: [DMPHubLicense];
  title: string;
}

interface DMPHubFunding {
  dmproadmap_opportunity_number: string;
  dmproadmap_project_number: string;
  funder_id: DMPHubIdentifier;
  funding_status: DMPHubFundingStatus;
  grant_id: DMPHubIdentifier;
  name: string;
}

interface DMPHubHost {
  description: string;
  dmproadmap_host_id: DMPHubIdentifier;
  title: string;
  url: string;
}

interface DMPHubIdentifier {
  identifier: string;
  type: string;
}

interface DMPHubLicense {
  license_ref: string;
  start_date: string;
}

interface DMPHubMetadata {
  description: string;
  language: DMPHubLanguageCode;
  metadata_standard_id: DMPHubIdentifier;
}

interface DMPHubProject {
  description: string;
  end: string;
  funding: [DMPHubFunding];
  start: string;
  title: string;
}

interface DMPHubRelatedIdentifier {
  citation: string;
  descriptor: DMPHubRelationType;
  identifier: DMPHubIdentifier;
  type: string;
  work_type: string;
}

interface DMPHubResearchFacility {
  facility_id: DMPHubIdentifier;
  name: string;
  type: DMPHubResearchFacilityType;
}

interface DMPHubSecurityAndPrivacy {
  description: string;
  title: string;
}

interface DMPHubTechnicalResource {
  description: string;
  name: string;
  technical_resource_id: DMPHubIdentifier;
}

interface DMPHubVersion {
  timestamp: string;
  url: string;
}

export enum DMPHubBoolean {
  YES = 'yes',
  NO = 'no',
  UNKNOWN = 'unknown',
}

export enum DMPHubVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum DMPHubDataAccess {
  OPEN = 'open',
  SHARED = 'shared',
  CLOSED = 'closed',
}

export enum DMPHubFundingStatus {
  PLANNED = 'planned',
  APPLIED = 'applied',
  GRANTED = 'granted',
  REJECTED = 'rejected',
}

export enum DMPHubRelationType {
  IS_CITED_BY = "is_cited_by",
  CITES = "cites",
  IS_SUPPLEMENT_TO = "is_supplement_to",
  IS_SUPPLEMENTED_BY = "is_supplemented_by",
  IS_DESCRIBED_BY = "is_described_by",
  DESCRIBES = "describes",
  HAS_METADATA = "has_metadata",
  IS_METADATA_FOR = "is_metadata_for",
  IS_PART_OF = "is_part_of",
  HAS_PART = "has_part",
  IS_REFERENCED_BY = "is_referenced_by",
  REFERENCES = "references",
  IS_DOCUMENTED_BY = "is_documented_by",
  DOCUMENTS = "documents",
  IS_NEW_VERSION_OF = "is_new_version_of",
  IS_PREVIOUS_VERSION_OF = "is_previous_version_of"
}

export enum DMPHubResearchFacilityType {
  FIELD_STATION = 'field_station',
  LABORATORY = 'laboratory',
}

export enum DMPHubCurrencyCode {
  AED = 'AED',
  AFN = 'AFN',
  ALL = 'ALL',
  AMD = 'AMD',
  ANG = 'ANG',
  AOA = 'AOA',
  ARS = 'ARS',
  AUD = 'AUD',
  AWG = 'AWG',
  AZN = 'AZN',
  BAM = 'BAM',
  BBD = 'BBD',
  BDT = 'BDT',
  BGN = 'BGN',
  BHD = 'BHD',
  BIF = 'BIF',
  BMD = 'BMD',
  BND = 'BND',
  BOB = 'BOB',
  BRL = 'BRL',
  BSD = 'BSD',
  BTN = 'BTN',
  BWP = 'BWP',
  BYN = 'BYN',
  BZD = 'BZD',
  CAD = 'CAD',
  CDF = 'CDF',
  CHF = 'CHF',
  CLP = 'CLP',
  CNY = 'CNY',
  COP = 'COP',
  CRC = 'CRC',
  CUC = 'CUC',
  CUP = 'CUP',
  CVE = 'CVE',
  CZK = 'CZK',
  DJF = 'DJF',
  DKK = 'DKK',
  DOP = 'DOP',
  DZD = 'DZD',
  EGP = 'EGP',
  ERN = 'ERN',
  ETB = 'ETB',
  EUR = 'EUR',
  FJD = 'FJD',
  FKP = 'FKP',
  GBP = 'GBP',
  GEL = 'GEL',
  GGP = 'GGP',
  GHS = 'GHS',
  GIP = 'GIP',
  GMD = 'GMD',
  GNF = 'GNF',
  GTQ = 'GTQ',
  GYD = 'GYD',
  HKD = 'HKD',
  HNL = 'HNL',
  HRK = 'HRK',
  HTG = 'HTG',
  HUF = 'HUF',
  IDR = 'IDR',
  ILS = 'ILS',
  IMP = 'IMP',
  INR = 'INR',
  IQD = 'IQD',
  IRR = 'IRR',
  ISK = 'ISK',
  JEP = 'JEP',
  JMD = 'JMD',
  JOD = 'JOD',
  JPY = 'JPY',
  KES = 'KES',
  KGS = 'KGS',
  KHR = 'KHR',
  KMF = 'KMF',
  KPW = 'KPW',
  KRW = 'KRW',
  KWD = 'KWD',
  KYD = 'KYD',
  KZT = 'KZT',
  LAK = 'LAK',
  LBP = 'LBP',
  LKR = 'LKR',
  LRD = 'LRD',
  LSL = 'LSL',
  LYD = 'LYD',
  MAD = 'MAD',
  MDL = 'MDL',
  MGA = 'MGA',
  MKD = 'MKD',
  MMK = 'MMK',
  MNT = 'MNT',
  MOP = 'MOP',
  MRU = 'MRU',
  MUR = 'MUR',
  MVR = 'MVR',
  MWK = 'MWK',
  MXN = 'MXN',
  MYR = 'MYR',
  MZN = 'MZN',
  NAD = 'NAD',
  NGN = 'NGN',
  NIO = 'NIO',
  NOK = 'NOK',
  NPR = 'NPR',
  NZD = 'NZD',
  OMR = 'OMR',
  PAB = 'PAB',
  PEN = 'PEN',
  PGK = 'PGK',
  PHP = 'PHP',
  PKR = 'PKR',
  PLN = 'PLN',
  PYG = 'PYG',
  QAR = 'QAR',
  RON = 'RON',
  RSD = 'RSD',
  RUB = 'RUB',
  RWF = 'RWF',
  SAR = 'SAR',
  SBD = 'SBD',
  SCR = 'SCR',
  SDG = 'SDG',
  SEK = 'SEK',
  SGD = 'SGD',
  SHP = 'SHP',
  SLL = 'SLL',
  SOS = 'SOS',
  SPL = 'SPL',
  SRD = 'SRD',
  STN = 'STN',
  SVC = 'SVC',
  SYP = 'SYP',
  SZL = 'SZL',
  THB = 'THB',
  TJS = 'TJS',
  TMT = 'TMT',
  TND = 'TND',
  TOP = 'TOP',
  TRY = 'TRY',
  TTD = 'TTD',
  TVD = 'TVD',
  TWD = 'TWD',
  TZS = 'TZS',
  UAH = 'UAH',
  UGX = 'UGX',
  USD = 'USD',
  UYU = 'UYU',
  UZS = 'UZS',
  VEF = 'VEF',
  VND = 'VND',
  VUV = 'VUV',
  WST = 'WST',
  XAF = 'XAF',
  XCD = 'XCD',
  XDR = 'XDR',
  XOF = 'XOF',
  XPF = 'XPF',
  YER = 'YER',
  ZAR = 'ZAR',
  ZMW = 'ZMW',
  ZWD = 'ZWD'
}

export enum DMPHubLanguageCode {
  aar = "aar",
  abk = "abk",
  afr = "afr",
  aka = "aka",
  amh = "amh",
  ara = "ara",
  arg = "arg",
  asm = "asm",
  ava = "ava",
  ave = "ave",
  aym = "aym",
  aze = "aze",
  bak = "bak",
  bam = "bam",
  bel = "bel",
  ben = "ben",
  bih = "bih",
  bis = "bis",
  bod = "bod",
  bos = "bos",
  bre = "bre",
  bul = "bul",
  cat = "cat",
  ces = "ces",
  cha = "cha",
  che = "che",
  chu = "chu",
  chv = "chv",
  cor = "cor",
  cos = "cos",
  cre = "cre",
  cym = "cym",
  dan = "dan",
  deu = "deu",
  div = "div",
  dzo = "dzo",
  ell = "ell",
  eng = "eng",
  epo = "epo",
  est = "est",
  eus = "eus",
  ewe = "ewe",
  fao = "fao",
  fas = "fas",
  fij = "fij",
  fin = "fin",
  fra = "fra",
  fry = "fry",
  ful = "ful",
  gla = "gla",
  gle = "gle",
  glg = "glg",
  glv = "glv",
  grn = "grn",
  guj = "guj",
  hat = "hat",
  hau = "hau",
  hbs = "hbs",
  heb = "heb",
  her = "her",
  hin = "hin",
  hmo = "hmo",
  hrv = "hrv",
  hun = "hun",
  hye = "hye",
  ibo = "ibo",
  ido = "ido",
  iii = "iii",
  iku = "iku",
  ile = "ile",
  ina = "ina",
  ind = "ind",
  ipk = "ipk",
  isl = "isl",
  ita = "ita",
  jav = "jav",
  jpn = "jpn",
  kal = "kal",
  kan = "kan",
  kas = "kas",
  kat = "kat",
  kau = "kau",
  kaz = "kaz",
  khm = "khm",
  kik = "kik",
  kin = "kin",
  kir = "kir",
  kom = "kom",
  kon = "kon",
  kor = "kor",
  kua = "kua",
  kur = "kur",
  lao = "lao",
  lat = "lat",
  lav = "lav",
  lim = "lim",
  lin = "lin",
  lit = "lit",
  ltz = "ltz",
  lub = "lub",
  lug = "lug",
  mah = "mah",
  mal = "mal",
  mar = "mar",
  mkd = "mkd",
  mlg = "mlg",
  mlt = "mlt",
  mon = "mon",
  mri = "mri",
  msa = "msa",
  mya = "mya",
  nau = "nau",
  nav = "nav",
  nbl = "nbl",
  nde = "nde",
  ndo = "ndo",
  nep = "nep",
  nld = "nld",
  nno = "nno",
  nob = "nob",
  nor = "nor",
  nya = "nya",
  oci = "oci",
  oji = "oji",
  ori = "ori",
  orm = "orm",
  oss = "oss",
  pan = "pan",
  pli = "pli",
  pol = "pol",
  por = "por",
  pus = "pus",
  que = "que",
  roh = "roh",
  ron = "ron",
  run = "run",
  rus = "rus",
  sag = "sag",
  san = "san",
  sin = "sin",
  slk = "slk",
  slv = "slv",
  sme = "sme",
  smo = "smo",
  sna = "sna",
  snd = "snd",
  som = "som",
  sot = "sot",
  spa = "spa",
  sqi = "sqi",
  srd = "srd",
  srp = "srp",
  ssw = "ssw",
  sun = "sun",
  swa = "swa",
  swe = "swe",
  tah = "tah",
  tam = "tam",
  tat = "tat",
  tel = "tel",
  tgk = "tgk",
  tgl = "tgl",
  tha = "tha",
  tir = "tir",
  ton = "ton",
  tsn = "tsn",
  tso = "tso",
  tuk = "tuk",
  tur = "tur",
  twi = "twi",
  uig = "uig",
  ukr = "ukr",
  urd = "urd",
  uzb = "uzb",
  ven = "ven",
  vie = "vie",
  vol = "vol",
  wln = "wln",
  wol = "wol",
  xho = "xho",
  yid = "yid",
  yor = "yor",
  zha = "zha",
  zho = "zho",
  zul = "zul"
}