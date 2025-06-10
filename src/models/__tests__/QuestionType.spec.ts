import casual from "casual";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from "../../__mocks__/context";
import { QuestionType } from "../QuestionType";
import { Question } from "../Question";

jest.mock('../../context.ts');

describe('QuestionType', () => {
  let questionType;

  const questionTypeData = {
    name: casual.sentence,
    usageDescription: casual.sentences(5),
  }
  beforeEach(() => {
    questionType = new QuestionType(questionTypeData);
  });

  it('should initialize options as expected', () => {
    expect(questionType.name).toEqual(questionTypeData.name);
    expect(questionType.usageDescription).toEqual(questionTypeData.usageDescription);
    expect(questionType.isDefault).toEqual(false);
  });
});

describe('default', () => {
  const originalQuery = QuestionType.query;

  let localQuery;
  let context;
  let questionType;

  beforeEach(() => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (QuestionType.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    questionType = new QuestionType({
      id: casual.integer(1, 9),
      createdById: casual.integer(1, 999),
      name: casual.sentence,
      usageDescription: casual.sentences(5),
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
    QuestionType.query = originalQuery;
  });

  it('should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([questionType]);
    const result = await QuestionType.findAll('QuestionType ref', context);
    const expectedSql = 'SELECT * FROM questionTypes';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [], 'QuestionType ref')
    expect(result).toEqual([questionType]);
  });

  it('should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const result = await QuestionType.findAll('QuestionType ref', context);
    expect(result).toEqual([]);
  });
});

describe('default JSON is valid', () => {
  it('for textArea', async () => {
    const textArea = {
      "meta": {
        "asRichText": true,
        "schemaVersion": "1.0"
      },
      "type": "textArea",
      "attributes": {
        "cols": 20,
        "rows": 4,
        "maxLength": null,
        "minLength": 0
      }
    };

    const question = new Question({ json: JSON.stringify(textArea) });
    await question.isValid();
    expect(question.errors['json']).toBeFalsy();
  });

  it('for text', async () => {
    const text = {
      "meta": {
        "schemaVersion": "1.0"
      },
      "type": "text",
      "attributes": {
        "pattern": null,
        "maxLength": null,
        "minLength": 0
      }
    };

    const question = new Question({ json: JSON.stringify(text) });
    await question.isValid();
    expect(question.errors['json']).toBeFalsy();
  });

  it('for radioButtons', async () => {
    const radioButtons = {
      "meta": {
        "schemaVersion": "1.0"
      },
      "type": "radioButtons",
      "options": [
        {
          "type": "option",
          "attributes": {
            "label": "Option 1",
            "value": "1",
            "selected": false
          }
        }
      ]
    };
    const question = new Question({ json: JSON.stringify(radioButtons) });
    await question.isValid();
    expect(question.errors['json']).toBeFalsy();
  });

  it('for checkBoxes', async () => {
    const checkBoxes = {
      "meta": {
        "schemaVersion": "1.0"
      },
      "type": "checkBoxes",
      "options": [
        {
          "type": "option",
          "attributes": {
            "label": "Option 1",
            "value": "1",
            "checked": false
          }
        }
      ]
    };
    const question = new Question({ json: JSON.stringify(checkBoxes) });
    await question.isValid();
    expect(question.errors['json']).toBeFalsy();
  });

  it('for select', async () => {
    const select = {
      "meta": {
        "schemaVersion": "1.0"
      },
      "type": "selectBox",
      "options": [
        {
          "type": "option",
          "attributes": {
            "label": "Option 1",
            "value": "1",
            "selected": false
          }
        }
      ]
    };
    const question = new Question({ json: JSON.stringify(select) });
    await question.isValid();
    expect(question.errors['json']).toBeFalsy();
  });

  it('for multiSelect', async () => {
    const multiSelect = {
      "meta": {
        "schemaVersion": "1.0"
      },
      "type": "selectBox",
      "options": [
        {
          "type": "option",
          "attributes": {
            "label": "Option 1",
            "value": "1",
            "selected": false
          }
        }
      ],
      "attributes": {
        "multiple": true
      }
    };
    const question = new Question({ json: JSON.stringify(multiSelect) });
    await question.isValid();
    expect(question.errors['json']).toBeFalsy();
  });

  it('for number', async () => {
    const number = {
      "meta": {
        "schemaVersion": "1.0"
      },
      "type": "number",
      "attributes": {
        "max": null,
        "min": 0,
        "step": 1
      }
    };
    const question = new Question({ json: JSON.stringify(number) });
    await question.isValid();
    expect(question.errors['json']).toBeFalsy();
  });

  it('for numberRange', async () => {
    const numberRange = {
      "meta": {
        "schemaVersion": "1.0"
      },
      "type": "numberRange",
      "columns": {
        "start": {
          "meta": {
            "schemaVersion": "1.0"
          },
          "type": "number",
          "attributes": {
            "max": null,
            "min": 0,
            "step": 1,
            "label": "From"
          }
        },
        "end": {
          "meta": {
            "schemaVersion": "1.0"
          },
          "type": "number",
          "attributes": {
            "max": null,
            "min": 0,
            "step": 1,
            "label": "To"
          }
        }
      }
    };
    const question = new Question({ json: JSON.stringify(numberRange) });
    await question.isValid();
    expect(question.errors['json']).toBeFalsy();
  });

  it('for currency', async () => {
    const currency = {
      "meta": {
        "schemaVersion": "1.0"
      },
      "type": "currency",
      "attributes": {
        "max": null,
        "min": 0,
        "step": 1,
        "denomination": "USD"
      }
    };
    const question = new Question({ json: JSON.stringify(currency) });
    await question.isValid();
    expect(question.errors['json']).toBeFalsy();
  });

  it('for email', async () => {
    const email = {
      "meta": {
        "schemaVersion": "1.0"
      },
      "type": "email",
      "attributes": {
        "pattern": null,
        "multiple": false,
        "maxLength": null,
        "minLength": 0
      }
    };
    const question = new Question({ json: JSON.stringify(email) });
    await question.isValid();
    expect(question.errors['json']).toBeFalsy();
  });

  it('for url', async () => {
    const url = {
      "meta": {
        "schemaVersion": "1.0"
      },
      "type": "url",
      "attributes": {
        "pattern": null,
        "maxLength": null,
        "minLength": 0
      }
    };
    const question = new Question({ json: JSON.stringify(url) });
    await question.isValid();
    expect(question.errors['json']).toBeFalsy();
  });

  it('for boolean', async () => {
    const boolean = {
      "meta": {
        "schemaVersion": "1.0"
      },
      "type": "boolean",
      "attributes": {
        "checked": false
      }
    };
    const question = new Question({ json: JSON.stringify(boolean) });
    await question.isValid();
    expect(question.errors['json']).toBeFalsy();
  });

  it('for date', async () => {
    const date = {
      "meta": {
        "schemaVersion": "1.0"
      },
      "type": "date",
      "attributes": {
        "max": null,
        "min": null,
        "step": 1
      }
    };
    const question = new Question({ json: JSON.stringify(date) });
    await question.isValid();
    expect(question.errors['json']).toBeFalsy();
  });

  it('for dateRange', async () => {
    const dateRange = {
      "meta": {
          "schemaVersion": "1.0"
      },
      "type": "dateRange",
      "columns": {
        "start":{
          "meta": {
            "schemaVersion": "1.0"
          },
          "type": "date",
          "attributes": {
            "max": null,
            "min": null,
            "step": 1,
            "label": "From"
          }
        },
        "end": {
          "meta": {
            "schemaVersion": "1.0"
          },
          "type": "date",
          "attributes": {
            "max": null,
            "min": null,
            "step": 1,
            "label": "To"
          }
        }
      }
    };
    const question = new Question({ json: JSON.stringify(dateRange) });
    await question.isValid();
    expect(question.errors['json']).toBeFalsy();
  });

  it('for table', async () => {
    const table = {
      "meta": {
        "schemaVersion": "1.0"
      },
      "type": "table",
      "columns": [
        {
          "content": {
            "meta": {
              "schemaVersion": "1.0"
            },
            "type": "text",
            "attributes": {
              "maxLength": 100,
              "minLength": 1
            }
          },
          "heading": "Column A"
        },
        {
          "content": {
            "meta": {
              "schemaVersion": "1.0"
            },
            "type": "text",
            "attributes": {
              "maxLength": 100,
              "minLength": 1
            }
          },
          "heading": "Column B"
        }
      ],
      "attributes": {
        "maxRows": null,
        "minRows": null,
        "canAddRows": true,
        "initialRows": 1,
        "canRemoveRows": true
      }
    };
    const question = new Question({ json: JSON.stringify(table) });
    await question.isValid();
    expect(question.errors['json']).toBeFalsy();
  });

  it('for affiliationSearch', async () => {
    const affiliationSearch = {
      "meta": {
        "schemaVersion": "1.0"
      },
      "type": "typeaheadSearch",
      "graphQL": {
        "query": "query Affiliations($name: String!){affiliations(name: $name) { totalCount nextCursor items {id displayName uri}}}",
        "queryId": "useAffiliationsQuery",
        "variables": [
          {
            "name": "term",
            "type": "string",
            "label": "Search for your institution",
            "minLength": 3,
            "labelTranslationKey": "SignupPage.institutionHelp"
          }
        ],
        "answerField": "uri",
        "displayFields": [
          {
            "label": "Institution",
            "propertyName": "displayName",
            "labelTranslationKey": "SignupPage.institution"
          }
        ],
        "responseField": "affiliations.items"
      }
    };
    const question = new Question({ json: JSON.stringify(affiliationSearch) });
    await question.isValid();
    expect(question.errors['json']).toBeFalsy();
  });
});
