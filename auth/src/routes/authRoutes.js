import { googleLoginHandler } from '../controllers/authController.js';

export default async function authRoutes(fastify, options) {
  
  fastify.post('/google', googleLoginHandler);
}