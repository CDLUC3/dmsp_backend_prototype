
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const sendEmail = async (to: string, subject: string, message: string, cc = '', bcc = ''): Promise<boolean> => {
  // TODO: Set this up once we get email infrastructure configured in AWS
  //       Reply to address should be an env variable
  //       The System name (also an env variable) should be appended to the subject
  //       Consider defining an auto-signature
  return true;
};
