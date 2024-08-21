import { send } from "../emailService";

describe('send', () => {
  it('sends an email', async () => {
    const sent = await send();
    expect(sent).toBe(false);
  });
});
