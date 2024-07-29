import { AffiliationModel, AffiliationSearchModel } from '../models/Affiliation';

// Just define what is unique here. Any fields you skip will end up using the defaults
// for their respective type as defined in ./src/mocks.ts
export const data = [
  {
    "RESOURCE_TYPE": "AFFILIATION",
    "ID": "https://ror.org/00dmfq477",
    "acronyms": [ "UCOP" ],
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
  },
  {
    "RESOURCE_TYPE": "AFFILIATION",
    "ID": "https://ror.org/006dpe828",
    "active": 1,
    "addresses": [
     {
        "city": "San Francisco",
        "country_geonames_id": 6252001,
        "geonames_city": {
          "city": "San Francisco",
          "geonames_admin1": {
            "ascii_name": "California",
            "code": "US.CA",
            "id": 5332921,
            "name": "California"
          },
          "geonames_admin2": {
            "ascii_name": "City and County of San Francisco",
            "code": "US.CA.075",
            "id": 5391997,
            "name": "City and County of San Francisco"
          },
          "id": 5391959,
          "license": {
            "attribution": "Data from geonames.org under a CC-BY 3.0 license",
            "license": "http://creativecommons.org/licenses/by/3.0/"
          }
        },
        "lat": 37.781131,
        "lng": -122.41564,
        "state": "California",
        "state_code": "US-CA"
      }
    ],
    "aliases": [ "UC Hastings" ],
    "country": { "country_code": "US", "country_name": "United States" },
    "dmphub_forced_index_recreation_date": "2024-07-24T08:07",
    "domain": "uchastings.edu",
    "external_ids": {
      "GRID": { "all": "grid.427530.7", "preferred": "grid.427530.7" },
      "ISNI": { "all": [ "0000 0004 0461 8502" ] },
      "OrgRef": { "all": [ "507044" ] },
      "Wikidata": { "all": [ "Q3577853" ] }
    },
    "funder": 0,
    "label": "University of California Hastings College of the Law (uchastings.edu)",
    "links": [ "http://www.uchastings.edu/", "https://uchastings.edu" ],
    "name": "University of California Hastings College of the Law",
    "searchable_names": [
      "university of california hastings college of the law",
      "uchastings.edu/library/",
      "UC Hastings"
    ],
    "types": [ "Education" ],
    "wikipedia_url": "https://en.wikipedia.org/wiki/University_of_California,_Hastings_College_of_the_Law",
    "_SOURCE": "ROR",
    "_SOURCE_SYNCED_AT": "2024-07-23T00:04:11Z",
   }
]

export const searchData = [
  {
    "PK": "AFFILIATION",
    "SK": "advancedphotonsciencesunitedstates",
    "country_code": "us",
    "country_name": [ "unitedstates", "us" ],
    "fundref_id": "100006389",
    "fundref_url": "https://api.crossref.org/funders/100006389",
    "links": [ "photonsci.com" ],
    "name": "Advanced Photon Sciences (United States)",
    "ror_id": "00182ep39",
    "ror_url": "https://ror.org/00182ep39",
    "searchName": "advancedphotonsciencesunitedstates"
   },
   {
    "PK": "AFFILIATION",
    "SK": "universityofcaliforniahastingscollegeofthelaw",
    "aliases": [ "uchastings" ],
    "country_code": "us",
    "country_name": [ "unitedstates", "us" ],
    "links": [ "uchastings.edu" ],
    "name": "University of California Hastings College of the Law",
    "ror_id": "006dpe828",
    "ror_url": "https://ror.org/006dpe828",
    "searchName": "universityofcaliforniahastingscollegeofthelaw"
   },
   {
    "PK": "AFFILIATION",
    "SK": "universityofcaliforniaofficeofthepresident",
    "aliases": [ "ucop" ],
    "country_code": "us",
    "country_name": [ "unitedstates", "us" ],
    "fundref_id": "100014576",
    "fundref_url": "https://api.crossref.org/funders/100014576",
    "links": [ "ucop.edu" ],
    "name": "University of California Office of the President",
    "ror_id": "00dmfq477",
    "ror_url": "https://ror.org/00dmfq477",
    "searchName": "universityofcaliforniaofficeofthepresident"
   }
]

export const mock = {
  // Return a random item from the data array
  Affiliation: () => new AffiliationModel(data[Math.floor(Math.random() * data.length)]),

  Affiliations: () => searchData.map((rec) => new AffiliationSearchModel(rec)),
}
