import { AffiliationModel, AffiliationSearchModel } from '../models/Affiliation';

// Just define what is unique here. Any fields you skip will end up using the defaults
// for their respective type as defined in ./src/mocks.ts
export const data = [
  {
    "id": "https://ror.org/01nrxwf90",
    "provenance": "ROR",
    "provenanceSyncDate": "2024-07-22T07:43:26Z",
    "name": "University of Edinburgh",
    "displayName": "University of Edinburgh (ed.ac.uk)",
    "active": true,
    "funder": true,
    "fundref": "http://dx.doi.org/10.13039/501100000848",
    "types": ["Education"],
    "acronyms": [],
    "aliases": [],
    "labels": [],
    "countryCode": "GB",
    "countryName": "United Kingdom",
    "domain": "ed.ac.uk",
    "wikipediaURL": "http://en.wikipedia.org/wiki/University_of_Edinburgh",
    "links": ["http://www.ed.ac.uk/home"],
    "searchNames": [
      "University of Edinburgh",
      "ed.ac.uk",
    ],
    "relationships": [
      {
        "id": "https://ror.org/05a7t9b67",
        "type": "Child",
        "name": "Edinburgh Cancer Research",
      },
      {
        "id": "https://ror.org/009bsy196",
        "type": "Related",
        "name": "Edinburgh Royal Infirmary",
      }
    ],
    "addresses": [
      {
        "city": "Edinburgh",
        "state": null,
        "stateCode": null,
        "countryGeonamesId": 2635167,
        "lat": 55.95206,
        "lng": -3.19648,
      }
    ]
  },
  {
    "id": "https://ror.org/01tm6cn81",
    "provenance": "ROR",
    "provenanceSyncDate": "2024-07-27T12:44:13Z",
    "name": "University of Gothenburg",
    "displayName": "University of Gothenburg (gu.se)",
    "active": true,
    "funder": false,
    "fundref": null,
    "types": ["Education"],
    "acronyms": [],
    "aliases": [],
    "labels": [
      {
        "label": "Göteborgin yliopisto",
        "iso639": "fi",
      },
      {
        "label": "Göteborgs universitet",
        "iso639": "sv",
      }
    ],
    "countryCode": "SE",
    "countryName": "Sweden",
    "domain": "gu.se",
    "wikipediaURL": "http://en.wikipedia.org/wiki/University_of_Gothenburg",
    "links": ["http://www.gu.se/english"],
    "relationships": [
      {
        "id": "https://ror.org/04vgqjj36",
        "type": "Related",
        "name": "Sahlgrenska University Hospital",
      }
    ],
    "searchNames": [
      "Göteborgs universitet",
      "Göteborgin yliopisto",
      "University of Gothenburg",
      "gu.se",
    ],
    "addresses": [
      {
        "city": "Gothenburg",
        "state": null,
        "stateCode": null,
        "countryGeonamesId": 2661886,
        "lat": 57.70716,
        "lng": 11.96679,
      }
    ]
  },
  {
    "id": "https://ror.org/00dmfq477",
    "provenance": "ROR",
    "provenanceSyncDate": "2024-07-30T15:12:45Z",
    "name": "University of California Office of the President",
    "displayName": "University of California Office of the President (ucop.edu)",
    "active": true,
    "funder": true,
    "fundref": "http://dx.doi.org/10.13039/100014576",
    "types": ["Education"],
    "acronyms": ["UCOP"],
    "aliases": [],
    "countryCode": "US",
    "countryName": "United States",
    "domain": "ucop.edu",
    "wikipediaURL": null,
    "links": ["https://www.ucop.edu"],
    "searchNames": [
      "University of California, Office of the President",
      "ucop.edu",
      "ucop",
    ],
    "relationships": [
      {
        "id": "https://ror.org/033jnv181",
        "type": "Parent",
        "name": "United States Department of Health and Human Services",
      }
    ],
    "addresses": [
      {
        "city": "Oakland",
        "state": "California",
        "stateCode": "MD",
        "countryGeonamesId": 6252001,
        "lat": 37.80437,
        "lng": -122.2708,
      }
    ]
  },
  {
    "id": "https://ror.org/01cwqze88",
    "provenance": "ROR",
    "provenanceSyncDate": "2024-07-30T15:12:45Z",
    "name": "National Institutes of Health",
    "displayName": "National Institutes of Health (nih.gov)",
    "active": true,
    "funder": true,
    "fundref": "http://dx.doi.org/10.13039/100000002",
    "types": ["Government"],
    "acronyms": ["NIH"],
    "aliases": [],
    "countryCode": "US",
    "countryName": "United States",
    "domain": "nih.gov",
    "wikipediaURL": "http://en.wikipedia.org/wiki/National_Institutes_of_Health",
    "links": ["http://www.nih.gov/"],
    "searchNames": [
      "National Institutes of Health",
      "nih.gov",
    ],
    "relationships": [
      {
        "id": "https://ror.org/033jnv181",
        "type": "Parent",
        "name": "United States Department of Health and Human Services",
      }
    ],
    "addresses": [
      {
        "city": "Bethesda",
        "state": "Maryland",
        "stateCode": "MD",
        "countryGeonamesId": 6252001,
        "lat": 38.98067,
        "lng": -77.10026,
      }
    ]
  },
  {
    "id": "https://dmptool.org/orgs/12345",
    "provenance": "DMPTool",
    "provenanceSyncDate": "2021-03-07T12:13:41Z",
    "name": "Example University",
    "displayName": "Example University (example.edu)",
    "active": true,
    "funder": false,
    "fundref": null,
    "types": ["Education"],
    "acronyms": ["EU"],
    "aliases": ["Example"],
    "countryCode": "US",
    "countryName": "United States",
    "domain": "example.edu",
    "wikipediaURL": null,
    "links": ["http://www.example.edu/library/"],
    "searchNames": [
      "Example University",
      "example.edu",
    ],
  },
]

export const searchData = [
  {
    "id": "https://ror.org/01nrxwf90",
    "fetchId": "ror.org/01nrxwf90",
    "name": "University of Edinburgh",
    "displayName": "University of Edinburgh (ed.ac.uk)",
    "funder": true,
    "fundref": "http://dx.doi.org/10.13039/501100000848",
    "aliases": [],
    "countryCode": "gb",
    "countryName": "United Kingdom",
    "links": ["ed.ac.uk", "http://www.ed.ac.uk/home"],
    "locales": [],
  },
  {
    "id": "https://ror.org/01tm6cn81",
    "fetchId": "ror.org/01tm6cn81",
    "name": "University of Gothenburg",
    "displayName": "University of Gothenburg (gu.se)",
    "funder": false,
    "fundref": "",
    "aliases": [],
    "countryCode": "se",
    "countryName": "Sweden",
    "links": ["gu.se", "http://www.gu.se/english"],
    "locales": [
      {
        "label": "Göteborgin yliopisto (gu.se)",
        "iso639": "fi",
      },
      {
        "label": "Göteborgs universitet (gu.se)",
        "iso639": "sv",
      }
    ],
  },
  {
    "id": "https://ror.org/01cwqze88",
    "fetchId": "ror.org/01cwqze88",
    "name": "National Institutes of Health",
    "displayName": "National Institutes of Health (nih.gov)",
    "funder": true,
    "fundref": "http://dx.doi.org/10.13039/100000002",
    "aliases": ["NIH"],
    "countryCode": "us",
    "countryName": "United States",
    "links": ["http://www.nih.gov/"],
    "locales": [],
  },
  {
    "id": "https://ror.org/00dmfq477",
    "fetchId": "ror.org/00dmfq477",
    "name": "University of California Office of the President",
    "displayName": "University of California Office of the President (ucop.edu)",
    "funder": true,
    "fundref": "http://dx.doi.org/10.13039/100014576",
    "aliases": ["UCOP"],
    "countryCode": "us",
    "countryName": "United States",
    "links": ["https://www.ucop.edu"],
    "locales": [],
  },
  {
    "id": "https://dmptool.org/orgs/12345",
    "fetchId": "dmptool.org/orgs/12345",
    "name": "Example University",
    "displayName": "Example University (example.edu)",
    "funder": false,
    "fundref": "",
    "aliases": ["EU"],
    "countryCode": "us",
    "countryName": "United States",
    "links": ["http://www.example.edu/library/"],
    "locales": [],
  },
]

export const mock = {
  // Return a random item from the data array
  Affiliation: () => new AffiliationModel(data[Math.floor(Math.random() * data.length)]),

  Affiliations: () => searchData.map((rec) => new AffiliationSearchModel(rec)),
}
