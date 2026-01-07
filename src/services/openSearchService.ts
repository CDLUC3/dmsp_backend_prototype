import { MyContext } from '../context';
import { OpenSearchWork, WorkType } from '../types';
import { Client, ClientOptions } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { generalConfig } from '../config/generalConfig';

export interface OpenSearchConfig {
  host: string;
  port: number;
  useSSL: boolean;
  verifyCerts: boolean;
  authType: 'aws' | 'basic' | null;
  username?: string;
  password?: string;
  awsRegion: string;
  awsService: 'es' | 'aoss';
}

interface OpenSearchWorkRecord {
  doi: string;
  title?: string;
  abstract_text?: string;
  work_type: string;
  publication_date?: string;
  updated_date?: string;
  publication_venue?: string;
  institutions: { name?: string; ror?: string }[];
  authors: {
    orcid?: string;
    first_initial?: string;
    given_name?: string;
    middle_initials?: string;
    middle_names?: string;
    surname?: string;
    full?: string;
  }[];
  funders: { name?: string; ror?: string }[];
  awards: { award_id?: string }[];
  source: { name: string; url?: string };
}

function convertWorkToCamelCase (work: OpenSearchWorkRecord): OpenSearchWork {
  return {
    doi: work.doi,
    title: work.title,
    abstractText: work.abstract_text,
    workType: work.work_type as WorkType,
    publicationDate: work.publication_date,
    updatedDate: work.updated_date,
    publicationVenue: work.publication_venue,
    institutions: work.institutions?.map((inst) => ({
      name: inst.name,
      ror: inst.ror,
    })) || [],
    authors: work.authors?.map((auth) => ({
      orcid: auth.orcid,
      firstInitial: auth.first_initial,
      givenName: auth.given_name,
      middleInitials: auth.middle_initials,
      middleNames: auth.middle_names,
      surname: auth.surname,
      full: auth.full,
    })) || [],
    funders: work.funders?.map((funder) => ({
      name: funder.name,
      ror: funder.ror,
    })) || [],
    awards: work.awards?.map((award) => ({
      awardId: award.award_id,
    })) || [],
    source: {
      name: work.source.name,
      url: work.source.url,
    },
  };
}

function createOpenSearchClient(config: OpenSearchConfig): Client {
  const protocol = config.useSSL ? 'https:' : 'http:';
  const url = new URL(`${protocol}//${config.host}:${config.port}`);

  const clientOptions: ClientOptions = {
    node: url.toString(),
    ssl: {
      rejectUnauthorized: config.verifyCerts,
    },
    compression: 'gzip',
  };

  if (config.authType === 'aws') {
    Object.assign(
      clientOptions,
      AwsSigv4Signer({
        region: config.awsRegion,
        service: config.awsService,
        getCredentials: fromNodeProviderChain(),
      }),
    );
  } else if (config.authType === 'basic') {
    clientOptions.auth = {
      username: config.username || '',
      password: config.password || '',
    };
  }

  return new Client(clientOptions);
}

export const findWorkByIdentifier = async (context: MyContext, doi: string): Promise<OpenSearchWork[]> => {
  const client = createOpenSearchClient(generalConfig.opensearch as OpenSearchConfig);
  try {
    const res = await client.search({
      index: 'works-index',
      body: {
        query: {
          ids: {
            values: [doi],
          },
        },
      },
    });

    // Could be cleaner to use the 'camelcase-keys' package, however, it is only
    // provided as an esm module
    //
    // import camelcaseKeys from 'camelcase-keys';
    // return camelcaseKeys(hit._source, {
    //  deep: true,
    // }) as OpenSearchWork;

    return res.body.hits.hits.map((hit) => {
      return convertWorkToCamelCase(hit._source as OpenSearchWorkRecord);
    });
  } catch (err) {
    console.error(err);
  }
};
