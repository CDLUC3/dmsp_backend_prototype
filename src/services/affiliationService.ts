import { MyContext } from "../context";
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
    // Create the affiliation
    const newAffiliation = new Affiliation({ name });
    return await newAffiliation.create(context);
  }
}
