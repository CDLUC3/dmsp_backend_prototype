// TODO: Store the automated email in a table so we can eventually have a UI page for
//       SuperAdmins to update them.
//       Load the appropriate message and send it out

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { MyContext } from "../context";
import { User } from "../models/User";
import { awsConfig } from "../config/awsConfig";
import { emailConfig } from "../config/emailConfig";
import { formatLogMessage, logger } from "../logger";

// Instantiate the SES Client
const initSesClient = (): SESClient => {
  // crypto.subtle
  return new SESClient({
    region: awsConfig.region,
    endpoint: awsConfig.sesEndpoint,
    // tls: true,
    credentials:{
      accessKeyId: awsConfig.sesAccessKey,
      secretAccessKey: awsConfig.sesAccessSecret,
    },
    logger: logger,
  });
}

// Send an email via AWS Simple Email Service (SES)
const sendEmailViaSES = async (
  emailType: string,
  toAddresses: string[],
  ccAddresses: string[] = [],
  bccAddresses: string[] = [],
  subject: string,
  message: string,
  asHTML = true,
): Promise<boolean> => {
  try {
    const client = initSesClient();

    const msgObj = { Data: message, Charset: "UTF-8" };
    const body = asHTML ? { Html: msgObj } : { Text: msgObj };

    const options = {
      // the address sending the email
      Source: emailConfig.doNotReplyAddress,
      // the address that any spam complaints or mailserver bounces goes to
      ReturnPath: awsConfig.sesBounceAddress,
      // the address that is used when the reipient tries to reply
      ReplyToAddresses: [emailConfig.doNotReplyAddress],

      Destination: {
        ToAddresses: toAddresses,
        CcAddresses: ccAddresses,
        BccAddresses: bccAddresses,
      },

      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: body,
      },

      Tags: [
        {
          Name: "emailType",
          Value: emailType,
        },
      ],
    }
    formatLogMessage(logger).debug(options, 'emailService.sendEmail preparing email');

    const command = new SendEmailCommand(options);

console.log('SES CLIENT:');
console.log(client);
console.log('SES COMMAND:');
console.log(command);

    const response = await client.send(command);

console.log('RESPONSE:')
console.log(response);

    if (response && response.MessageId) {
      const msg = `emailService sent email of type ${emailType} to ${toAddresses.join(', ')}`;
      formatLogMessage(logger).debug(response, `${msg}, SES messageId: ${response.MessageId}`);
      return true;
    }
  } catch(err) {
    formatLogMessage(logger).error(err, 'emailService failure');
    throw(new Error(`Unable to send email: ${err.message}`));
  }
  return false;
}

// Function to either send or log an email notification based on the environment
const sendEmail = async (
  emailType: string,
  toAddresses: string[],
  ccAddresses: string[] = [],
  bccAddresses: string[] = [],
  subject: string,
  message: string,
  asHTML = true,
): Promise<boolean> => {
  const prefix = process.env.APP_ENV === 'prd' ? 'DMP Tool' : `DMP Tool (${process.env.APP_ENV})`;
  const subjectLine = `${prefix} - ${subject}`;

  if (['development', 'test'].includes(process.env.NODE_ENV)) {
    // When running in development mode, we do not have access to AWS SES and we probably don't want to
    // actually send emails to people by accident so so just log the message
    formatLogMessage(logger).info(
      { toAddresses, ccAddresses, bccAddresses, subjectLine, message, asHTML },
      `Logging email notification of type '${emailType}' because we are in ${process.env.NODE_ENV} mode`
    );
    return true;
  } else {
    // Otherwise go ahead and send the email
    return await sendEmailViaSES(emailType, toAddresses, ccAddresses, bccAddresses, subjectLine, message, asHTML);
  }
}

// Send out a test email notifications (should be accessible by super admins only!)
export const sendTestEmailNotification = async (): Promise<boolean> => {
  return await sendEmail('Test', [emailConfig.helpDeskAddress], [], [], emailSubjects.test, emailMessages.test);
}

// Send out an email asking the user to confirm the email address
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const sendEmailConfirmationNotification = async (email: string): Promise<boolean> => {
  return await sendEmail('Confirmation', [email], [], [], emailSubjects.confirmation, emailMessages.confirmation);
}

// Send out the collaboration email. Note that the emails should be different
// based on whether or not the userId is present.
// If no userId is present we are inviting them to create an account.
export const sendTemplateCollaborationEmail = async (
  context: MyContext,
  templateId: number,
  email: string,
  userId?: number
): Promise<boolean> => {
  if (userId) {
    const user = await User.findById('sendTemplateCollaborationEmail', context, userId);
    // Bail out if the user has asked us not to send these notifications
    if (!user.notify_on_template_shared) {
      return false;
    }
  }
  return true;
}

export const emailSubjects = {
  confirmation: 'Please confirm your email address',
  test: 'Email test',
}

export const emailMessages = {
  confirmation: `<p>This is a placeholder until we get the confirmation tokens setup.</p>`,
  test: `
<p>This is a test email from the Apollo server backend.</p>
<p>If you received it, it indicates that the system is able to successfully send out email notifications.</p>
`,
}
