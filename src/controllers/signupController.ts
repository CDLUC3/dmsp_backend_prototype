import { Request, Response } from 'express';
import { logger, formatLogMessage } from '../logger';
import { User } from '../models/User';
import { generateAuthTokens, setTokenCookie } from '../services/tokenService';
import { Cache } from '../datasources/cache';
import { generalConfig } from '../config/generalConfig';
import { buildContext } from '../context';
import { processOtherAffiliationName } from '../services/affiliationService';

export const signupController = async (req: Request, res: Response) => {
  const cache = Cache.getInstance();
  const context = buildContext(logger, cache);

  const props = req.body;

  // Either use the affiliationId provided or create one
  if (!props?.affiliationId && props?.otherAffiliationName) {
    const affiliation = await processOtherAffiliationName(context, props.otherAffiliationName);
    props.affiliationId = affiliation.uri;
  }

  let user: User = new User({
    email: props?.email,
    password: props?.password,
    affiliationId: props?.affiliationId,
    givenName: props?.givenName,
    surName: props?.surName,
    acceptedTerms: props?.acceptedTerms,
  });

  try {
    user = await user.register(context) || null;

    if (user) {
      if (user.errors?.length >= 1) {
        res.status(400).json({ success: false, message: user.errors?.join(' | ') });
      } else {
        // Generate the tokens
        const { accessToken, refreshToken } = await generateAuthTokens(cache, user);

        if (accessToken && refreshToken) {
          // Set the tokens as HTTP only cookies
          setTokenCookie(res, 'dmspt', accessToken, generalConfig.jwtTTL);
          setTokenCookie(res, 'dmspr', refreshToken, generalConfig.jwtRefreshTTL);

          res.status(201).json({ success: true, message: 'ok' });
        } else {
          res.status(500).json({ success: false, message: 'Unable to create the account at this time.' });
        }
      }
    } else {
      res.status(500).json({ success: false, message: 'Unable to register the account.' });
    }
  } catch (err) {
    formatLogMessage(logger, { msg: `Signup error. userId: ${user.id}, error: ${err?.message}` });
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
