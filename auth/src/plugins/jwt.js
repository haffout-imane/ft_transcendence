import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'

async function jwtPlugin(fastify, options) {
  fastify.register(fastifyJwt, {
    secret: fastify.config.JWT_SECRET,
    cookie: {
      cookieName: 'token',
      signed: false,
    }
  })

  fastify.decorate("authenticate", async function(request, reply) {
    try {
      const token = request.cookies.token;
      if (!token) {
        return reply.send({ authenticated : false, message: "Authorization token missing" });
      }
      request.headers.authorization = `Bearer ${token}`;
      await request.jwtVerify();
    } catch (err) {
		    reply.send({authenticated : false, message: "Authorization token is invalid: The token signature is invalid."});
    }
  })
}

export default fp(jwtPlugin);
