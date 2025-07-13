import fp from'fastify-plugin';
import { PrismaClient } from '@prisma/client';

async function prismaPlugin(fastify, options) {
  const prisma = new PrismaClient();

  // Connecter Prisma quand le serveur démarre
  await prisma.$connect();

  // Ajouter Prisma à chaque requête via request.prisma
  fastify.decorate('prisma', prisma);

  // Se déconnecter proprement quand Fastify ferme
  // attacher Prisma à l'instance Fastify
  fastify.addHook('onClose', async (fastifyInstance, done) => {
    await prisma.$disconnect();
    done();
  });
}

export default  fp(prismaPlugin);