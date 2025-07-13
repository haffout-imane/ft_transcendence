import * as profileController from "../controllers/profileController.js";


export default async  function profileRoutes(fastify, options) {
	//Get /api
	 fastify.get('/profile-page',{preValidation: [fastify.authenticate]}, profileController.profile_page);
	 fastify.get('/games-history',{preValidation: [fastify.authenticate]}, profileController.games_history);
	 fastify.get('/messages',{preValidation: [fastify.authenticate]}, profileController.getMessages);
	 fastify.get('/notifications',{preValidation: [fastify.authenticate]}, profileController.getNotifications);
	// Post /api
	 fastify.post('/delete',{preValidation: [fastify.authenticate]}, profileController.deleteNotifications);
	}