import cors from 'cors';

export function coresMiddleware() {
  return cors<cors.CorsRequest>();
}
