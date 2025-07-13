import * as userController from "../controllers/userController.js";

export default async  function userRoutes(fastify, options) {
    //Get /api
    fastify.get('/setting/data',{preValidation: [fastify.authenticate]}, userController.settingData);
    fastify.get('/auth/check-token',{preValidation: [fastify.authenticate]}, userController.checkToken);
    fastify.get('/checktwofa',{preValidation: [fastify.authenticate]}, userController.checktwofa);
    fastify.get('/paddle-ball',{preValidation: [fastify.authenticate]}, userController.paddleBall);
    fastify.get('/profile-picture', {preValidation: [fastify.authenticate]} , userController.profilePicture);
    //POST /api
    fastify.post('/register', userController.registerUser);
    fastify.post('/login', userController.loginUser);
    fastify.post('/logout', {preValidation: [fastify.authenticate]}, userController.logoutUser);
    fastify.post('/verifytwofa',{preValidation: [fastify.authenticate]}, userController.verifytwofa);
    //PUT/api
    fastify.put('/setting/save',{preValidation: [fastify.authenticate]}, userController.settingSave);
    fastify.put('/setting/twofa',{preValidation: [fastify.authenticate]}, userController.settingTwofa);
    fastify.put('/setting/theme',{preValidation: [fastify.authenticate]}, userController.settingTheme);
}