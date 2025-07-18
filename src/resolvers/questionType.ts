import { Resolvers } from "../types";
import { MyContext } from "../context";
import { QuestionType } from "../models/QuestionType";
import { InternalServerError } from "../utils/graphQLErrors";
import { prepareObjectForLogs } from "../logger";
import { QuestionTypeInterface } from "../types/template";

export const resolvers: Resolvers = {
  Query: {
    // return all of the question types
    questionTypes: async (_, __, context: MyContext): Promise<QuestionTypeInterface[]> => {
      const reference = 'questionTypes resolver';
      try {
        const types = await QuestionType.findAll(reference, context);
        return types.map((typ) => { return { ...typ, json: JSON.stringify(typ.json) }; });
      } catch (err) {
        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },
};
