import fp from 'fastify-plugin'
import fastifyEnv from '@fastify/env'

async function envPlugin(fastify) {
  const schema = {
    type: 'object',
    required: ['PORT', 'DATABASE_URL', 'JWT_SECRET'],
    properties: {
      PORT: { type: 'integer', default: '3000' },
      DATABASE_URL: { type: 'string' },
      JWT_SECRET: { type: 'string' }
    }
  }

  const envOptions = {
    confKey: 'config', // accessible via fastify.config
    schema,
    dotenv: true       // lit automatiquement le fichier .env
  }

  // Enregistre correctement fastifyEnv comme plugin
  await fastify.register(fastifyEnv, envOptions)
}

export default fp(envPlugin);
