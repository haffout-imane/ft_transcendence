import Fastify from 'fastify'
import path from 'path'
import { fileURLToPath } from 'url'
import fastifyStatic from '@fastify/static'
import fastifyCompress from '@fastify/compress'

// Re-create __dirname in ES module context
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const fastify = Fastify({ logger: true })

fastify.register(fastifyCompress)
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../dist'),
  prefix: '/',
})

fastify.setNotFoundHandler((request, reply) => {
  return reply.type('text/html').sendFile('index.html')
})

const start = async () => {
  try {
    await fastify.listen({ port: 3003, host: '0.0.0.0' })
    console.log('Server running at https://localhost:3000')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
