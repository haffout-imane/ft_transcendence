import * as friendsController from "../controllers/friendsController.js";


export default async  function friendsRoutes(fastify, options) {
	//Get /api
	 fastify.get('/users',{preValidation: [fastify.authenticate]}, friendsController.ft_suers);
	 fastify.get('/friends',{preValidation: [fastify.authenticate]}, friendsController.ft_friends);
	
	//POST /api
	fastify.post('/accept_friend',{preValidation: [fastify.authenticate]}, friendsController.ft_addfriend);
	fastify.post('/removeFriend',{preValidation: [fastify.authenticate]}, friendsController.ft_removeFriend);
	fastify.post('/block',{preValidation: [fastify.authenticate]}, friendsController.ft_block);
	//PUT /api
	fastify.put('/unblock',{preValidation: [fastify.authenticate]}, friendsController.ft_unblock);
}