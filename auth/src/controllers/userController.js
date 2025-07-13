import * as userService from '../services/userService.js';
import Ajv from "ajv";
import addFormats from "ajv-formats";
import Bcrypt from "bcrypt";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

const ajv = new Ajv();
addFormats(ajv);

const Schema = {
  type: "object",
  required: ["username", "email", "password"],
  properties: {
    username: {
      type: "string",
      minLength: 3,
      maxLength: 20,
      //pattern: "^[a-zA-Z0-9_]+$" // lettres, chiffres et underscore uniquement
    },
    email: {
      type: "string",
      format: "email"
    },
    password: {
      type: "string",
      minLength: 8,
      maxLength: 30,
      pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"
      // au moins une minuscule, une majuscule et un chiffre
    }
  },
  additionalProperties: false
};
const validateUser = ajv.compile(Schema);
//register User
export async function registerUser(request, reply) {
  const userData = request.body;
  const isvalid = validateUser(userData);
  if (!isvalid) {
    return reply.send({
      error: "Validation failed",
      details: validateUser.errors
    });
  }
  const isExists = await userService.isUserExists(request.server.prisma, userData);
  if (isExists) {
    return reply.send({success: false, message: "Email or username already in use" });
  }
  const HashPassword = await Bcrypt.hash(userData.password, 10);
  userData.password = HashPassword;
  await userService.createUser(request.server.prisma, userData);
  return reply.code(201).send({success: true, message: 'Register successful'});
}
//login User
export async function loginUser(request, reply) {
  const { email, password } = request.body;
  const user = await userService.getUserByEmail(request.server.prisma, email);
  if (!user) {
    return reply.send({success: false, message: 'Invalid email or password' });
  }

  const isMatch = await Bcrypt.compare(password, user.password);

  if (!isMatch) {
    return reply.send({success: false, message: 'Invalid email or password' });
  }
  const token = request.server.jwt.sign({id: user.id, username: user.username});
  await userService.updateUser(request.server.prisma, user.id, {isOnline:true});
  return reply.setCookie('token', token, {
    httpOnly: true,       // ⚠️ Empêche l'accès via JavaScript côté client
    secure: true,         // ⚠️ Nécessite HTTPS     mettre true en production avec HTTPS
    sameSite: 'strict',   // Empêche les requêtes cross-site
    path: '/',            // Disponible pour toute l'app
    maxAge: 60 * 60 * 24,      // 1 heure
  })
  .send({success: true, message: 'Login successful' }); 
 // return reply.send({ message: 'Login successful', token: token});
}
//logout User
export async function logoutUser(request, reply) {
  const userId = request.user.id;
  await userService.updateUser(request.server.prisma, userId, {isOnline:false});
  return reply
  .clearCookie('token', {
    httpOnly: true,
    secure: true,           //true si HTTPS
    sameSite: 'strict',
    path: '/'
  })
   .send({ success: true, message: 'Logout successfully' });
}
//setting Save
export async function settingSave(request, reply)
{
      const userData = request.body;
      const userId = request.user.id;
      const user = await userService.getUserById(request.server.prisma, userId);
      if (!user) return reply.send({success: false, message: 'User not found'});
      if (userData.username)
      {
        const isExists = await userService.isUserExists(request.server.prisma, userData);
        if (isExists)
          return reply.send({success: false, message: 'Username or email already in use'}); // ??email
      }
      
      if (user.password && userData.currentPassword) 
      {
        const isMatch = await Bcrypt.compare(userData.currentPassword, user.password); 
        if (!isMatch)
        return reply.send({success: false, message: 'Current Password Invalid'});
    }
    if(userData.currentPassword){
      const data = {"username":userData.username, "email":user.email, "password":userData.newPassword};
      const isvalid = validateUser(data);
      if (!isvalid) {
        return reply.send({
          success: false,
          error: "Validation failed",
          details: validateUser.errors, 
        });
      }
      const HashPassword = await Bcrypt.hash(userData.newPassword, 10);
      userData.password = HashPassword;
    }
    const {currentPassword, newPassword, ...newData} = userData;
    if (!userData.username)
      newData.username = user.username;
    await userService.updateUser(request.server.prisma, userId, newData);
    return reply.send({success: true,message: 'Update successful'});
}
// settingTheme
export async function settingTheme(request, reply)
{
  const userData = request.body;
  const userId = request.user.id;
  const user = await userService.getUserById(request.server.prisma, userId);
  if (!user) return reply.send({success: false, message: 'User not found'});
  await userService.updateUser(request.server.prisma, userId, userData);
  return reply.code(201).send({success: true,message: 'Update successful'});
}
//checktwofa
export async function checktwofa(request, reply)
{
  const userId = request.user.id;
  const user = await userService.getUserById(request.server.prisma, userId);
  if (!user) return reply.send({success: false, message: 'User not found'});
  if (user.twofa) return reply.send({success: true});
  else return reply.send({success: false});
}
//settingTwofa
export async function settingTwofa(request, reply)
{
  const userData = request.body;
  const userId = request.user.id;
  const user = await userService.getUserById(request.server.prisma, userId);
  if (!user) return reply.send({success: false, message: 'User not found', qrcode: null});

  await userService.updateUser(request.server.prisma, userId, userData);
  if (userData.twofa)
  {
    let secret;
    if (!user.twofaSecret)
    {

      secret = speakeasy.generateSecret({
        name: "ft_transcendence"
      });
    }
    else
    {
      secret = user.twofaSecret;
    }
      try {
            const data_url = await qrcode.toDataURL(secret.otpauth_url);
            await userService.updateUser(request.server.prisma, userId, {
              twofaSecret: secret.base32
            });
            return reply.send({ success: true, qrcode: data_url });
          } catch (err) {
            console.error('Error generating QR code:', err);
            return reply.send({ success: false, message:'QR Code generation failed', qrcode: null});
          }
  }else 
  {
    await userService.updateUser(request.server.prisma, userId, {
      twofaSecret: null
    });
    return reply.send({success: true, message:'Update successful', qrcode: null});
  }
}
//verifytwofa
export async function verifytwofa(request, reply)
{
  const userId = request.user.id;
  const { token } = request.body;

  if (!token) {
    return reply.send({ success: false, message: 'Token is required' });
  }
  const user = await userService.getUserById(request.server.prisma, userId);
  if (!user || !user.twofaSecret) {
    return reply.send({ success: false, message: '2FA not set up for this user' });
  }
  const verified = speakeasy.totp.verify({
    secret: user.twofaSecret,
    encoding: 'base32',
    token
  });
  if (verified) {
    return reply.send({ success: true, message: 'Token is valid' });
  } else {
    return reply.send({ success: false, message: 'Invalid token' });
  }
}
//get settingData
export async function settingData(request, reply)
{
  const userId = request.user.id;
  const user = await userService.getUserById(request.server.prisma, userId);
  if (!user) return reply.send({success: false, message: 'User not found'});
  const {email, password, id, createdAT, updatedAT, ...Data} = user;
  return reply.send(Data);
}

export async function checkToken(request, reply)
{
  return reply.send({authenticated : true});
  // return reply.send(
  //   `this is a message from the server you are not authenticated, please login to access the API`
  //   );
}

export async function paddleBall(request, reply)
{
  const userId = request.user.id;
  const user = await userService.getUserById(request.server.prisma, userId);
  if (!user) return reply.send({success: false, message: 'User not found'});
  return reply.send({
    matchball: user.matchball,
    paddlecolor: user.paddlecolor
  })
}
export async function profilePicture(request, reply)
{
  const user = await userService.getUserByUsername(request.server.prisma, request.query.username);
  if (!user) return reply.send({success: false, message: 'User not found'});
  return reply.send({
    profilepicture: user.profilepicture
  })
}
