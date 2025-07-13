import Fastify from "fastify";
import prismaPlugin from "./plugins/prisma.js";
import envPlugin from './plugins/env.js';
import jwtPlugin from './plugins/jwt.js';
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js"; 
 import createGoogleAuthService from './services/googleAuthService.js'; 
 import fastifyCookie from '@fastify/cookie';
import cors from '@fastify/cors'; 
import friendsRoutes from "./routes/friendsRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";


const fastify = Fastify({ logger: true, bodyLimit: 5242880 });

await fastify.register(cors, {
  origin: [
    'http://localhost:3000', // Replace with your frontend URL
    'https://localhost', // Replace with your frontend URL
    'https://localhost:3001', // Replace with your frontend URL
    'https://localhost:3002', // Replace with your frontend URL
    'https://localhost:3003', // Replace with your frontend URL
  ],
  credentials: true,            // If you send cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});


const start = async () => {
  try {
     
      await fastify.register(fastifyCookie);
      await fastify.register(envPlugin);
      await fastify.register(jwtPlugin) ;
      await fastify.register(prismaPlugin);
      fastify.decorate('googleAuthService', createGoogleAuthService(fastify));
      await fastify.register(userRoutes, { prefix: '/api' });
      await fastify.register(authRoutes, { prefix: '/auth' });
      await fastify.register(friendsRoutes, { prefix: '/api' });
      await fastify.register(profileRoutes, { prefix: '/api' });

      await fastify.listen({ port: fastify.config.PORT, host: '0.0.0.0' });
      console.log(`Server listening on port ${fastify.config.PORT }`);
  } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
};
start();
