
import { logger } from "../../__mocks__/logger";
import { emailConfig } from "../../config/emailConfig";
import { sendTestEmailNotification } from "../emailService";

beforeEach(() => {
  jest.resetAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
})

describe('sendEmail', () => {
  it('sends the test email', async () => {
    jest.spyOn(logger, 'info');
    const sent = await sendTestEmailNotification();

    const expectedSubject = "DMPTool (test) - Email test"
    const expectedMessage = `
<p>This is a test email from the Apollo server backend.</p>
<p>If you received it, it indicates that the system is able to successfully send out email notifications.</p>
`;

    expect(sent).toBe(true);
    expect(logger.info).toHaveBeenCalledWith(
      {
        "asHTML": true,
        "bccAddresses": [],
        "ccAddresses": [],
        "message": expectedMessage,
        "subjectLine": expectedSubject,
        "toAddresses": [emailConfig.helpDeskAddress],
      },
      "Logging email notification of type 'Test' because we are in test mode"
    );
  });
});
