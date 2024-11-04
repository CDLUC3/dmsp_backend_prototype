import casual from "casual";
import { sendEmail } from "../emailService";

describe('send', () => {
  it('sends an email', async () => {
    const sent = await sendEmail(casual.email, casual.sentence, casual.sentences(5));
    expect(sent).toBe(true);
  });
});
