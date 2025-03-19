import {
  planToDMPCommonStandard,
  convertFiveCharToThreeChar,
  convertThreeCharToFiveChar,
  determineIdentifierType } from '../commonStandardService';
import { Plan, PlanStatus, PlanVisibility } from '../../models/Plan';
import {
  DMPYesNoUnknown,
  DMPPrivacy,
  DMPStatus,
  DMPIdentifierType
} from '../../datasources/dmphubAPI';
import { MyContext } from '../../context';
import { buildContext, mockToken } from '../../__mocks__/context';
import { logger } from '../../__mocks__/logger';
import { RelatedWork } from '../../models/RelatedWork';
import { ContributorRole } from '../../models/ContributorRole';
import { User } from '../../models/User';
import { Project } from '../../models/Project';
import { VersionedTemplate } from '../../models/VersionedTemplate';

let context: MyContext;
let plan: Plan;
let project: Project;
let template: VersionedTemplate;

// Mock query results
const mockFunderResult = [
  {
    name: 'Funder name',
    uri: 'http://funder.example.com',
    status: 'GRANTED',
    funderProjectNumber: 'PROJ-1234567890',
    funderOpportunityNumber: 'OPP-0987654321',
    grantId: 'GRANT-555555555',
  }
];

const mockContributorResult = [
  {
    isPrimaryContact: true,
    givenName: 'John',
    surName: 'Doe',
    email: 'john.doe@example.com',
    uri: 'http://org.example.com',
    name: 'Test institution',
    orcid: '0000-0000-0000-000X',
    roles: '["http://example.com/role/1","http://example.com/role/2"]',
  },
  {
    isPrimaryContact: false,
    givenName: 'Jane',
    surName: 'Smith',
    uri: 'http://org.example.com',
    name: 'Test institution',
    roles: '["http://example.com/role/3"]',
  },
];

const mockPlanOwnerResult = [
  {
    isPrimaryContact: true,
    givenName: 'Plan',
    surName: 'Owner',
    email: 'plan.owner@example.com',
    uri: 'http://org.example.com',
    name: 'Test institution',
    orcid: '0000-0000-0000-0001'
  }
];

const mockNarrativeResult = [
  {
    templateId: 1,
    templateTitle: 'Template title',
    templateVersion: '1.0',
    sectionId: 1,
    sectionTitle: 'Section A',
    sectionDescription: 'Section A description',
    sectionOrder: 1,
    questionId: 1,
    questionText: 'Question 1',
    questionOrder: 1,
    questionTypeId: 1,
    questionTypeName: 'Text',
    answerId: 1,
    answerText: 'Answer 1',
  },
  {
    templateId: 1,
    templateTitle: 'Template title',
    templateVersion: '1.0',
    sectionId: 1,
    sectionTitle: 'Section A',
    sectionDescription: 'Section A description',
    sectionOrder: 1,
    questionId: 2,
    questionText: 'Question 2',
    questionOrder: 2,
    questionTypeId: 2,
    questionTypeName: 'Multiple choice',
    answerId: 2,
    answerText: 'Answer 2',
  },
  {
    templateId: 1,
    templateTitle: 'Template title',
    templateVersion: '1.0',
    sectionId: 2,
    sectionTitle: 'Section B',
    sectionDescription: 'Section B description',
    sectionOrder: 2,
    questionId: 3,
    questionText: 'Question 3',
    questionOrder: 1,
    questionTypeId: 1,
    questionTypeName: 'Text',
    answerId: 3,
    answerText: 'Answer 3',
  }
];

const mockRelatedWorkResult = [
  new RelatedWork({
    id: 1,
    projectId: 1,
    workType: 'DATASET',
    relationDescriptor: 'IS_CITED_BY',
    identifier: 'https://doi.org/10.99999/abcd',
    citation: 'Citation 1',
  }),
  new RelatedWork({
    id: 2,
    projectId: 1,
    workType: 'JOURNAL_ARTICLE',
    relationDescriptor: 'REFERENCES',
    identifier: 'https://doi.org/10.99999/zyxw',
    citation: 'Citation 2',
  })
];

// Mock the call to fetch the default role
jest.spyOn(ContributorRole, 'defaultRole').mockResolvedValue(
  new ContributorRole({ id: 1, uri: 'http://example.com/roles/tester', label: 'Tester' })
);

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(logger, mockToken());

  template = new VersionedTemplate({
    id: 1,
    name: 'Template name',
    description: 'Template description',
    version: '1.0',
  });

  project = new Project({
    id: 1,
    title: 'Project title',
    abstractText: 'Project description',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
  });

  plan = new Plan({
    id: 1,
    projectId: project.id,
    versionedTemplateId: template.id,
    created: '2023-01-01',
    createdById: 1,
    modified: '2023-01-02',
    registered: '2023-01-03',
    status: PlanStatus.PUBLISHED,
    languageId: 'eng',
    featured: true,
    visibility: PlanVisibility.PUBLIC,
    dmpId: '10.1234/dmp',
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('commonStandardService', () => {
  describe('determineIdentifierType', () => {
    it('should return ORCID for ORCID URIs', () => {
      expect(determineIdentifierType('http://orcid.org/0000-0000-0000-0000')).toBe(DMPIdentifierType.ORCID);
      expect(determineIdentifierType('https://orcid.org/0000-0000-0000-0000')).toBe(DMPIdentifierType.ORCID);
      expect(determineIdentifierType('https://sandbox.orcid.org/0000-0000-0000-0000')).toBe(DMPIdentifierType.ORCID);
      expect(determineIdentifierType('0000-0000-0000-0000')).toBe(DMPIdentifierType.ORCID);
    });

    it('should return DOI for DOI URIs', () => {
      expect(determineIdentifierType('https://doi.org/10.1234/abcd')).toBe(DMPIdentifierType.DOI);
      expect(determineIdentifierType('doi.org/10.1234/abcd')).toBe(DMPIdentifierType.DOI);
      expect(determineIdentifierType('10.1234/abcd')).toBe(DMPIdentifierType.DOI);
      expect(determineIdentifierType('doi:10.12345/abcd')).toBe(DMPIdentifierType.DOI);
      expect(determineIdentifierType('10.12345/abcd')).toBe(DMPIdentifierType.DOI);
      expect(determineIdentifierType('10.12345/abcdeijrghie/jr.hgjig')).toBe(DMPIdentifierType.DOI);
    });

    it('should return ROR for ROR URIs', () => {
      expect(determineIdentifierType('http://ror.org/abcd12345')).toBe(DMPIdentifierType.ROR);
      expect(determineIdentifierType('https://ror.org/abcd12345')).toBe(DMPIdentifierType.ROR);
    });

    it('should return URL for other HTTP URIs', () => {
      expect(determineIdentifierType('http://example.com')).toBe(DMPIdentifierType.URL);
      expect(determineIdentifierType('https://example.com')).toBe(DMPIdentifierType.URL);
      expect(determineIdentifierType('https://example.com?2u4ihg=&942ht=984')).toBe(DMPIdentifierType.URL);
    });

    it('should return OTHER for non-HTTP URIs', () => {
      expect(determineIdentifierType('non-http-uri')).toBe(DMPIdentifierType.OTHER);
    });
  });

  describe('convertFiveCharToThreeChar', () => {
    it('should convert pt-BR to ptb', () => {
      expect(convertFiveCharToThreeChar('pt-BR')).toBe('ptb');
    });

    it('should return eng for unknown language codes', () => {
      expect(convertFiveCharToThreeChar('unknown')).toBe('eng');
    });
  });

  describe('convertThreeCharToFiveChar', () => {
    it('should convert ptb to pt-BR', () => {
      expect(convertThreeCharToFiveChar('ptb')).toBe('pt-BR');
    });

    it('should return defaultLanguageId for unknown language codes', () => {
      expect(convertThreeCharToFiveChar('unknown')).toBe('en-US');
    });
  });

  it('planToDMPCommonStandard - handles plan without DMP ID', async () => {
    plan = new Plan({
      id: 1,
      projectId: 1,
      created: '2023-01-01',
      createdById: 1,
      modified: '2023-01-02',
      status: PlanStatus.DRAFT,
      languageId: 'eng',
      featured: false,
      visibility: PlanVisibility.PRIVATE,
    });

    // Return the Template and Project information 1st
    jest.spyOn(Project, 'findById').mockResolvedValueOnce(project);
    jest.spyOn(VersionedTemplate, 'findById').mockResolvedValueOnce(template);
    // Return the Contributor information 3rd
    jest.spyOn(Plan, 'query').mockResolvedValueOnce([]);
    // Return the Plan owner information
    jest.spyOn(User, 'query').mockResolvedValueOnce(mockPlanOwnerResult);
    // Return the Funder information 2nd
    jest.spyOn(Plan, 'query').mockResolvedValueOnce([]);
    // Return the Narrative information
    jest.spyOn(Plan, 'query').mockResolvedValueOnce([]);
    // Return the Related Identifiers information
    jest.spyOn(RelatedWork, 'findByProjectId').mockResolvedValueOnce([]);

    const result = await planToDMPCommonStandard(context, 'reference', plan);

    expect(result.dmp_id).toEqual({ identifier: 'https://localhost:3000/project/1/new', type: 'url' });
  });

  it('planToDMPCommonStandard - handles plan with no primary contact', async () => {
    plan = new Plan({
      id: 1,
      projectId: 1,
      created: '2023-01-01',
      createdById: 1,
      modified: '2023-01-02',
      status: PlanStatus.DRAFT,
      languageId: 'eng',
      featured: false,
      visibility: PlanVisibility.PRIVATE,
    });

    // Return the Template and Project information 1st
    jest.spyOn(Project, 'findById').mockResolvedValueOnce(project);
    jest.spyOn(VersionedTemplate, 'findById').mockResolvedValueOnce(template);
    // Return the Contributor information 3rd
    jest.spyOn(Plan, 'query').mockResolvedValueOnce([]);
    // Return the Plan owner information
    jest.spyOn(User, 'query').mockResolvedValueOnce(mockPlanOwnerResult);
    // Return the Funder information 2nd
    jest.spyOn(Plan, 'query').mockResolvedValueOnce([]);
    // Return the Narrative information
    jest.spyOn(Plan, 'query').mockResolvedValueOnce([]);
    // Return the Related Identifiers information
    jest.spyOn(RelatedWork, 'findByProjectId').mockResolvedValueOnce([]);

    const result = await planToDMPCommonStandard(context, 'reference', plan);

    expect(result.contact).toEqual({
      name: 'Plan Owner',
      mbox: 'plan.owner@example.com',
      dmproadmap_affiliation: {
        name: 'Test institution',
        affiliation_id: {
          identifier: 'http://org.example.com',
          type: 'url',
        },
      },
      contact_id: {
        identifier: '0000-0000-0000-0001',
        type: 'orcid',
      },
    });
  });


  it('planToDMPCommonStandard - minimal DMP', async () => {
    // Return the Template and Project information 1st
    jest.spyOn(Project, 'findById').mockResolvedValueOnce(new Project({
      id: 1,
      title: 'Project title'
    }));
    jest.spyOn(VersionedTemplate, 'findById').mockResolvedValueOnce(template);
    // Return the Contributor information 3rd
    jest.spyOn(Plan, 'query').mockResolvedValueOnce([]);
    // Return the Plan owner information
    jest.spyOn(User, 'query').mockResolvedValueOnce(mockPlanOwnerResult);
    // Return the Funder information 2nd
    jest.spyOn(Plan, 'query').mockResolvedValueOnce([]);
    // Return the Narrative information
    jest.spyOn(Plan, 'query').mockResolvedValueOnce([]);
    // Return the Related Identifiers information
    jest.spyOn(RelatedWork, 'findByProjectId').mockResolvedValueOnce([]);

    const result = await planToDMPCommonStandard(context, 'reference', plan);

    expect(result).toEqual({
      contact: {
        name: 'Plan Owner',
        mbox: 'plan.owner@example.com',
        dmproadmap_affiliation: {
          name: 'Test institution',
          affiliation_id: {
            identifier: 'http://org.example.com',
            type: 'url',
          },
        },
        contact_id: {
          identifier: '0000-0000-0000-0001',
          type: 'orcid',
        },
      },
      created: "2023-01-01T00:00:00Z",
      dataset: [
        {
          dataset_id: {
            identifier: "10.1234/dmp/dataset",
            type: "other",
          },
          personal_data: "unknown",
          sensitive_data: "unknown",
          title: "Project Dataset",
          type: "dataset",
        },
      ],
      dmp_id: {
        identifier: '10.1234/dmp',
        type: 'doi'
      },
      dmphub_provenance_id: "testing",
      dmproadmap_featured: '1',
      dmproadmap_privacy: "public",
      dmproadmap_status: "published",
      ethical_issues_exist: "unknown",
      language: "eng",
      modified: "2023-01-02T00:00:00Z",
      project: [
        {
          title: "Project title",
        },
      ],
      registered: "2023-01-03T00:00:00Z",
      title: "DMP for: Template name"
    });
  });


  it('planToDMPCommonStandard - complete DMP', async () => {
    // Return the Template and Project information 1st
    jest.spyOn(Project, 'findById').mockResolvedValueOnce(project);
    jest.spyOn(VersionedTemplate, 'findById').mockResolvedValueOnce(template);
    // Return the Contributor information 3rd
    jest.spyOn(Plan, 'query').mockResolvedValueOnce(mockContributorResult);
    // Return the Funder information 2nd
    jest.spyOn(Plan, 'query').mockResolvedValueOnce(mockFunderResult);
    // Return the Narrative information
    jest.spyOn(Plan, 'query').mockResolvedValueOnce(mockNarrativeResult);
    // Return the Related Identifiers information
    jest.spyOn(RelatedWork, 'findByProjectId').mockResolvedValueOnce(mockRelatedWorkResult);

    const result = await planToDMPCommonStandard(context, 'reference', plan);

    expect(result).toEqual({
      dmphub_provenance_id: 'testing',
      created: '2023-01-01T00:00:00Z',
      modified: '2023-01-02T00:00:00Z',
      registered: '2023-01-03T00:00:00Z',
      title: 'DMP for: Template name',
      language: 'eng',
      ethical_issues_exist: DMPYesNoUnknown.UNKNOWN,
      dmproadmap_featured: '1',
      dmproadmap_privacy: DMPPrivacy.PUBLIC,
      dmproadmap_status: DMPStatus.PUBLISHED,
      dmp_id: {
        identifier: '10.1234/dmp',
        type: 'doi',
      },
      contact: {
        name: 'John Doe',
        mbox: 'john.doe@example.com',
        dmproadmap_affiliation: {
          name: 'Test institution',
          affiliation_id: {
            identifier: 'http://org.example.com',
            type: 'url',
          },
        },
        contact_id: {
          identifier: '0000-0000-0000-000X',
          type: 'orcid',
        },
      },
      contributor: [
        {
          name: 'John Doe',
          mbox: 'john.doe@example.com',
          dmproadmap_affiliation: {
            name: 'Test institution',
            affiliation_id: {
              identifier: 'http://org.example.com',
              type: 'url',
            },
          },
          role: ['http://example.com/role/1', 'http://example.com/role/2'],
          contributor_id: {
            identifier: '0000-0000-0000-000X',
            type: 'orcid',
          },
        },
        {
          name: 'Jane Smith',
          dmproadmap_affiliation: {
            name: 'Test institution',
            affiliation_id: {
              identifier: 'http://org.example.com',
              type: 'url',
            },
          },
          role: ['http://example.com/role/3'],
        },
      ],
      dataset: [
        {
          dataset_id: {
            identifier: '10.1234/dmp/dataset',
            type: 'other',
          },
          personal_data: 'unknown',
          sensitive_data: 'unknown',
          title: 'Project Dataset',
          type: 'dataset',
      }],
      project: [
        {
          title: 'Project title',
          description: 'Project description',
          start: '2023-01-01T00:00:00Z',
          end: '2023-12-31T00:00:00Z',
          funding: [
            {
              name: 'Funder name',
              funder_id: {
                identifier: 'http://funder.example.com',
                type: 'url',
              },
              funding_status: 'granted',
              dmproadmap_project_number: 'PROJ-1234567890',
              dmproadmap_opportunity_number: 'OPP-0987654321',
              grant_id: {
                identifier: 'GRANT-555555555',
                type: 'other',
              }
            },
          ],
        },
      ],
      dmproadmap_narrative: {
        template_id: 1,
        template_title: 'Template title',
        template_version: '1.0',
        sections: [
          {
            section_id: 1,
            section_title: 'Section A',
            section_description: 'Section A description',
            section_order: 1,
            questions: [
              {
                question_id: 1,
                question_text: 'Question 1',
                question_order: 1,
                question_type: { id: 1, name: 'Text' },
                answer_id: 1,
                answer_text: 'Answer 1',
              },
              {
                question_id: 2,
                question_text: 'Question 2',
                question_order: 2,
                question_type: { id: 2, name: 'Multiple choice' },
                answer_id: 2,
                answer_text: 'Answer 2',
              },
            ],
          },
          {
            section_id: 2,
            section_title: 'Section B',
            section_description: 'Section B description',
            section_order: 2,
            questions: [
              {
                question_id: 3,
                question_text: 'Question 3',
                question_order: 1,
                question_type: { id: 1, name: 'Text' },
                answer_id: 3,
                answer_text: 'Answer 3',
              },
            ],
          },
        ],
      },
      dmproadmap_related_identifiers: [
        {
          citation: 'Citation 1',
          descriptor: 'is_cited_by',
          identifier: 'https://doi.org/10.99999/abcd',
          type: 'doi',
          work_type: 'dataset',
        },
        {
          citation: "Citation 2",
          descriptor: 'references',
          identifier: 'https://doi.org/10.99999/zyxw',
          type: 'doi',
          work_type: 'journal_article',
        },
      ],
    });
  });
});
