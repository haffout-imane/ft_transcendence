import { OAuth2Client } from 'google-auth-library';

export default function createGoogleAuthService(fastify) {
  const client = new OAuth2Client(fastify.config.GOOGLE_CLIENT_ID);

  async function verifyGoogleToken(idToken) {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: fastify.config.GOOGLE_CLIENT_ID,
    });
      const payload = ticket.getPayload();
      return payload;
  }

  return {
    verifyGoogleToken,
  };
}