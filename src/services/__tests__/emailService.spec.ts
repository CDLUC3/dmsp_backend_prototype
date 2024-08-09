import casual from "casual";
import { send } from "../emailService";

describe('send', () => {
  it('sends an email', async () => {
    const sent = send([casual.email], [], [], 'Testing emailService.send', 'Did it work!?');
    expect(sent).toBe(false);
  });
});
