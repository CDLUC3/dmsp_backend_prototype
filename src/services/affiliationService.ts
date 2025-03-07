import { MyContext } from "../context";
import { Affiliation } from "../models/Affiliation";

export const processOtherAffiliationName = async (
  context: MyContext,
  name: string,
  userId?: number,
): Promise<Affiliation> => {
  // First look to see if the affiliation name already exists
  const existing = await Affiliation.findByName('processOtherAffiliation', context, name);
  if (existing) {
    return existing;
  } else {
    // Create the affiliation
    const newAffiliation = new Affiliation({ name });

    // If there is no UserId in the token context but a userId was provided, then we are registering a new user
    if (!context?.token?.id && userId) {
      newAffiliation.createdById = userId;
      newAffiliation.modifiedById = userId;
    }
    const result = await newAffiliation.create(context);
    // Reinit the Affiliation to ensure it has access to functions like hasErrors()
    return new Affiliation(result);
  }
}
