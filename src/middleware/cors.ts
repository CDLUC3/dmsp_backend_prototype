import cors from 'cors';

export function handleCors() {
  return cors<cors.CorsRequest>();
}
