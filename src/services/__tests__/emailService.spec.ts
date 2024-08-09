import { send } from "../emailService";

describe('send', () => {
  it('sends an email', async () => {
    const sent = send();
    expect(sent).toBe(false);
  });
});
