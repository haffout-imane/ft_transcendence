import { findOrCreateUser } from '../services/userService.js';

export async function googleLoginHandler(request, reply) {
  const { idToken } = request.body;
  try {
    console.log("Received Google ID Token:", idToken);
    const payload = await request.server.googleAuthService.verifyGoogleToken(idToken);
    
    const user = await findOrCreateUser(request.server.prisma, payload);
    const jwtToken = request.server.jwt.sign({id: user.id, username: user.username});
    return reply.setCookie('token', jwtToken, {
      httpOnly: true,     
      secure: true,         
      sameSite: 'strict',   
      path: '/',           
      maxAge: 60 * 60 * 24,     
    })
    .send({success: true, message: 'Google login successful'}); 
  } catch (error) {
    return reply.send({success: false, message: 'Invalid Google token' });
  }
}