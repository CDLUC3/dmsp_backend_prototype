import casual from 'casual';
import { DMSP_BASE_URL, validateDmspId } from '../resolvers/scalars/dmspId';
import { validateOrcid } from '../resolvers/scalars/orcid';
import { ROR_DOMAIN, validateRor } from '../resolvers/scalars/ror';

export class BaseMock {
  // Mock resolvers for our custom Scalars
  public mockOrcid() {
    return validateOrcid(casual.card_number().toString().match(/[0-9]{4}/g).join('-'));
  }
  public mockRor() {
    return validateRor(`${ROR_DOMAIN}${casual.rgb_hex.replace('#', '')}`);
  }
  public mockDmspId() {
    return validateDmspId(`${DMSP_BASE_URL}${casual.rgb_hex.replace('#', '').toUpperCase()}`);
  }

  // Generate a random date
  public getMockDate(): String {
    return casual.date('YYYY-MM-DD HH:mm:ss.123Z');
  }

  // Simulated Success response from a Mutation
  public getMutationSuccess(code: Number, message: String) {
    return {
      code: code as number || casual.integer(200, 201),
      success: true as boolean,
      message: message as string || casual.sentence
    }
  }

  // Simulated Error response from a Mutation
  public getMutationError(code: Number, message: String) {
    return {
      code: code as number || casual.integer(400, 500),
      success: false as boolean,
      message: message as string || casual.sentence
    }
  }
}