import { Resolvers } from "../types";
import { MyContext } from "../context";
import { QuestionType } from "../models/QuestionType";
import { InternalServerError } from "../utils/graphQLErrors";
import { formatLogMessage } from "../logger";

export const resolvers: Resolvers = {
  Query: {
    // return all of the question types
    questionTypes: async (_, __, context: MyContext): Promise<QuestionType[]> => {
      const reference = 'questionTypes resolver';
      try {
        return await QuestionType.findAll(reference, context);
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },
};
