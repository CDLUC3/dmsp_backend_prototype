import { InitializePlanVersionOutput, Resolvers } from "../types";
import { MyContext } from "../context";
import { ForbiddenError, NotFoundError, InternalServerError } from "../utils/graphQLErrors";
import { isSuperAdmin } from "../services/authService";
import { prepareObjectForLogs } from "../logger";
import { isNullOrUndefined, valueIsEmpty } from "../utils/helpers";
import { addVersion, findVersionByTimestamp, hasLatestVersion, latestVersion } from "../models/PlanVersion";
import { Plan } from "../models/Plan";


export const resolvers: Resolvers = {
  Query: {
    superInspectPlanVersion: async (_, { planId, modified }, context: MyContext): Promise<string> => {
      const reference = 'inspectPlanVersion';
      if (!isSuperAdmin(context.token)) {
        throw ForbiddenError();
      }

      try {
        const plan = await Plan.findById(reference, context, planId);
        if (plan) {
          if (isNullOrUndefined(modified)) {
            const version = await latestVersion(context, plan, reference);
            if (!isNullOrUndefined(version)) {
              return JSON.stringify(version);
            }
          } else {
            const version = await findVersionByTimestamp(context, plan, modified);
            if (!isNullOrUndefined(version)) {
              return JSON.stringify(version);
            }
          }
        }
        throw NotFoundError();
      } catch (err) {
        context.logger.error(prepareObjectForLogs(err), `${reference} error fetching plan version from DynamoDB`);
        throw InternalServerError();
      }
    }
  },

  Mutation: {
    superInitializePlanVersions: async (_, __, context: MyContext): Promise<InitializePlanVersionOutput> => {
      const reference = 'initializePlanVersion';
      if (!isSuperAdmin(context.token)) {
        throw ForbiddenError();
      }

      try {
        // Use a very lighweight query to fetch all plan ids
        const sql = 'SELECT id, dmpId FROM plans ORDER BY id';
        const results = await Plan.query(context, sql, [], reference);
        const plans = Array.isArray(results) ? results.map((entry) => new Plan(entry)) : [];
        let count = 0;
        const planIds: number[] = [];

        await Promise.all(plans.map(async (plan) => {
          // If it doesn't have a DMP ID for some reason (legacy data), generate one
          if (valueIsEmpty(plan.dmpId)) plan.dmpId = await plan.generateDMPId(context);

          const version = await hasLatestVersion(context, plan);
          if (!version) {
            // Fetch the entire plan so we can create a version for it
            const fullPlan = await Plan.findById(reference, context, plan.id);
            await addVersion(context, fullPlan, reference);
            count++;
            planIds.push(plan.id);
          }
        })).catch((err) => {
          context.logger.error(prepareObjectForLogs(err), `${reference} error processing PlanVersion records`);
          throw InternalServerError();
        });

        return { count, planIds };
      } catch (err) {
        context.logger.error(prepareObjectForLogs(err), `${reference} error initializing PlanVersion records`);
        throw InternalServerError();
      }
    }
  }
}
