// TODO: Store the automated email in a table so we can eventually have a UI page for
//       SuperAdmins to update them.
//       Load the appropriate message and send it out

import { buildContext, MyContext } from "../context";
import { logger } from "../logger";
import { User } from "../models/User";

// TODO: Set this up once we get email infrastructure configured in AWS
//       Reply to address should be an env variable
//       The System name (also an env variable) should be appended to the subject
//       Consider defining an auto-signature

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const sendEmail = async (to: string, subject: string, message: string, cc = '', bcc = ''): Promise<boolean> => {
  return true;
};

// Send out an email asking the user to confirm the email address
export const sendEmailConfirmationNotification = async (email: string): Promise<Boolean> => {
  return true;
}

// Send out the collaboration email. Note that the emails should be different
// based on whether or not the userId is present.
// If no userId is present we are inviting them to create an account.
export const sendTemplateCollaborationEmail = async (
  context: MyContext,
  templateId: number,
  email: string,
  userId?: number
): Promise<Boolean> => {
  if (userId) {
    const user = await User.findById('sendTemplateCollaborationEmail', context, userId);
    // Bail out if the user has asked us not to send these notifications
    if (!user.notify_on_template_shared) {
      return false;
    }
  }
  return true;
}