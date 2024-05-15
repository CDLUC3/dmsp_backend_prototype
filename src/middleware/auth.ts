

// TODO: We likely want to switch this up to validate the token and return the User in the JWT
export function extractToken(request) {
  return request.headers?.authentication || '';
}
