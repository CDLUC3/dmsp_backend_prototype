import { Resolvers } from "../types";
import { MyContext } from "../context";
import { QuestionType } from "../models/QuestionType";

export const resolvers: Resolvers = {
  Query: {
    questionTypes: async (_, __, context: MyContext): Promise<QuestionType[]> => {
      return await QuestionType.findAll('sections resolver', context);
    },
  },
};
