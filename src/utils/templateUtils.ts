import { MyContext } from "../context";
import { Template } from "../models/Template";
import { formatLogMessage } from "../logger";

// Template needs to be updated to isDirty=true if changes were made to its sections or questions
export const markTemplateAsDirty = async (reference: string, context: MyContext, templateId: number): Promise<void> => {
  try {
    const template = await Template.findById(reference, context, templateId);
    if (template) {
      template.isDirty = true;
      await template.update(context);
    }
  } catch (err) {
    formatLogMessage(context).error(err, `Failure in ${reference} - markTemplateAsDirty`);
    throw err;
  }
};