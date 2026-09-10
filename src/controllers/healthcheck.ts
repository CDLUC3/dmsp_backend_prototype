import { ApolloServer, BaseContext } from '@apollo/server';
import { Response } from 'express';
import { Logger } from 'pino';

// Healthcheck endpoint for our load balancer.
// Be sure to call this BEFORE defining CORS settings since our AWS load
// balancer does not allow us to define headers!
export function healthcheck(apolloServer: ApolloServer<BaseContext>, response: Response, logger: Logger) {
  apolloServer.executeOperation({ query: '{ __typename }' })
    .then((data) => {
      if (data.body.kind === 'single') {
        if (data.body.singleResult.errors) {
          const msgs = data.body.singleResult.errors.map((err) => err.message);
          logger.error(`ERROR: Healthcheck - ${msgs.join(', ')}`);
          response.status(400).send(JSON.stringify(data.body.singleResult.errors));
        } else {
          response.status(200).send(JSON.stringify(data.body.singleResult.data));
        }
      }
    })
    .catch((error: unknown) => {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error(`ERROR: Healthcheck - ${msg}`);
      response.status(400).send(JSON.stringify(error));
    });
}