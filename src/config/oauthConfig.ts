
// FUTURE AUTH OPTIONS for Google, ORCID, etc.
// TODO: Update this to add our credentials for external OAuth

// export const SomeExternalSystemConfig = {
//   clientID: process.env.CLIENT_ID as string,
//   clientSecret: process.env.CLIENT_SECRET as string,
//   redirectUri: process.env.REDIRECT_URI as string,
// }

export default {
  authorizationCodeLifetime: 600, // 10 minutes
  accessTokenLifetime: 3600, // 1 hour
  refreshTokenLifetime: 604800, // 7 days
};
