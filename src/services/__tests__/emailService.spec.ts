const mockSendEmail = jest.fn().mockResolvedValue(true);

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendEmail,
  })),
}));

jest.mock('../../config/awsConfig');

import casual from "casual";
import { buildContext, mockToken } from '../../__mocks__/context';
import { logger } from "../../logger";
import {
  emailMessages,
  emailSubjects,
  sendEmailConfirmationNotification,
  sendProjectCollaborationEmail,
  sendTemplateCollaborationEmail
} from "../emailService";
import { generalConfig } from "../../config/generalConfig";
import { emailConfig } from "../../config/emailConfig";
import { User } from "../../models/User";

let context;

const subjectPrefix = `${generalConfig.applicationName}`;

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(logger, mockToken());
});

afterEach(() => {
  jest.clearAllMocks();
})

describe('sendEmail', () => {
  it('sends the confirmation email', async () => {
    jest.spyOn(logger, 'info');
    const email = casual.email;
    const sent = await sendEmailConfirmationNotification(context, email);

    const expectedSubject = `${subjectPrefix} - ${emailSubjects.emailConfirmation}`

    expect(sent).toBe(true);
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      "bcc": "",
      "cc": "",
      "from": `"${generalConfig.applicationName}" <${emailConfig.doNotReplyAddress}>`,
      "html": emailMessages.emailConfirmation,
      "replyTo": emailConfig.helpDeskAddress,
      "sender": emailConfig.doNotReplyAddress,
      "subject": expectedSubject,
      "to": email,
    });
  });

  it('sends the template collaboration email', async () => {
    jest.spyOn(logger, 'info');
    const email = casual.email;
    const templateName = casual.sentence;
    const inviterName = `${casual.first_name} ${casual.last_name}`;
    const sent = await sendTemplateCollaborationEmail(context, templateName, inviterName, email);

    const expectedSubject = `${subjectPrefix} - ${emailSubjects.templateCollaboration}`
    const expectedMessage = emailMessages.templateCollaboration;

    expect(sent).toBe(true);
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      "bcc": "",
      "cc": "",
      "from": `"${generalConfig.applicationName}" <${emailConfig.doNotReplyAddress}>`,
      "html": expectedMessage.replace('%{templateTitle}', templateName).replace('%{inviterName}', inviterName),
      "replyTo": emailConfig.helpDeskAddress,
      "sender": emailConfig.doNotReplyAddress,
      "subject": expectedSubject,
      "to": email,
    });
  });

  it('sends the template collaboration email to the user\'s primary email', async () => {
    jest.spyOn(logger, 'info');
    const user = new User({
      id: casual.integer(1, 99),
      email: casual.email,
      givenName: casual.first_name,
      surName: casual.last_name,
    });
    const email = casual.email;
    const templateName = casual.sentence;
    const inviterName = `${casual.first_name} ${casual.last_name}`;

    (User.findById as jest.Mock) = jest.fn().mockResolvedValueOnce(user);
    const sent = await sendTemplateCollaborationEmail(context, templateName, inviterName, email, user.id);

    const expectedSubject = `${subjectPrefix} - ${emailSubjects.templateCollaboration}`
    const expectedMessage = emailMessages.templateCollaboration;

    expect(sent).toBe(true);
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      "bcc": "",
      "cc": "",
      "from": `"${generalConfig.applicationName}" <${emailConfig.doNotReplyAddress}>`,
      "html": expectedMessage.replace('%{templateTitle}', templateName).replace('%{inviterName}', inviterName),
      "replyTo": emailConfig.helpDeskAddress,
      "sender": emailConfig.doNotReplyAddress,
      "subject": expectedSubject,
      "to": user.email,
    });
  });

  it('sends the project collaboration email', async () => {
    jest.spyOn(logger, 'info');
    const email = casual.email;
    const projectName = casual.sentence;
    const inviterName = `${casual.first_name} ${casual.last_name}`;
    const sent = await sendProjectCollaborationEmail(context, projectName, inviterName, email);

    const expectedSubject = `${subjectPrefix} - ${emailSubjects.projectCollaboration}`
    const expectedMessage = emailMessages.projectCollaboration;

    expect(sent).toBe(true);
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      "bcc": "",
      "cc": "",
      "from": `"${generalConfig.applicationName}" <${emailConfig.doNotReplyAddress}>`,
      "html": expectedMessage.replace('%{projectTitle}', projectName).replace('%{inviterName}', inviterName),
      "replyTo": emailConfig.helpDeskAddress,
      "sender": emailConfig.doNotReplyAddress,
      "subject": expectedSubject,
      "to": email,
    });
  });

  it('sends the project collaboration email to the user\'s primary email', async () => {
    jest.spyOn(logger, 'info');
    const user = new User({
      id: casual.integer(1, 99),
      email: casual.email,
      givenName: casual.first_name,
      surName: casual.last_name,
    });
    const email = casual.email;
    const projectName = casual.sentence;
    const inviterName = `${casual.first_name} ${casual.last_name}`;

    (User.findById as jest.Mock) = jest.fn().mockResolvedValueOnce(user);
    const sent = await sendProjectCollaborationEmail(context, projectName, inviterName, email, user.id);

    const expectedSubject = `${subjectPrefix} - ${emailSubjects.projectCollaboration}`
    const expectedMessage = emailMessages.projectCollaboration;

    expect(sent).toBe(true);
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      "bcc": "",
      "cc": "",
      "from": `"${generalConfig.applicationName}" <${emailConfig.doNotReplyAddress}>`,
      "html": expectedMessage.replace('%{projectTitle}', projectName).replace('%{inviterName}', inviterName),
      "replyTo": emailConfig.helpDeskAddress,
      "sender": emailConfig.doNotReplyAddress,
      "subject": expectedSubject,
      "to": user.email,
    });
  });
});
