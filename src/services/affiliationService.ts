import { MyContext } from "../context";
import { formatLogMessage } from "../logger";
import { Affiliation } from "../models/Affiliation";

export const processOtherAffiliationName = async (
  context: MyContext,
  name: string
): Promise<Affiliation> => {
  // First look to see if the affiliation name already exists
  const existing = await Affiliation.findByName('processOtherAffiliation', context, name);

  if (existing) {
    return existing;
  } else {
    if (context.token.id) {
      // The current user is already signed in so just create the affiliation
      const newAffiliation = new Affiliation({ name });
      return await newAffiliation.create(context);

    } else {
      // The current user is in the process of registering their account so no User.id is available yet!
      const reference = 'AffiliationService.processOtherAffiliationName';
      const sql = 'INSERT INTO affiliations (name) VALUES (?)';
      const result = await Affiliation.query(context, sql, [name], reference);

      if (!Array.isArray(result) || !result[0].insertId) {
        return null;
      }
      formatLogMessage(context.logger)?.debug(`${reference} created new affiliation: ${name}`);

      // Fetch the new record
      return await Affiliation.findById(reference, context, result[0].insertId);
    }
  }
}
