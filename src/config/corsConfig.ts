import * as dotenv from 'dotenv';
dotenv.config();

const corsConfig = () => {

  const isProduction = process.env.NODE_ENV === 'production';

  //TBD: Need to update later to handle different origins for stage and production
  const corsOptions = {
    origin: isProduction ? 'TBD' : 'http://localhost:3000', //frontend
    credentials: true,               // Enable credentials (cookies, authorization headers)
    methods: ['GET', 'POST'],        // Allowed methods if needed
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'], // Allowed headers
  };

  return corsOptions;
}

export default corsConfig;