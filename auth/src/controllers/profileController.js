import * as profileService from '../services/profileService.js';
import {getUserByUsername} from '../services/userService.js';

export async function profile_page(request, reply)
{
	 const userId = request.user.id;
	 const totalMatches = await profileService.totalMatchesPlayed(request.server.prisma, userId);
	 const totalWinner = await profileService.totalMatchesWinner(request.server.prisma, userId);
	 const totalLosses = totalMatches - totalWinner;
	 const stats = await profileService.getUserGoalsStats(request.server.prisma, userId);
	 return reply.send({
		totalMatchesPlayed: totalMatches,
		numWins: totalWinner,
		numLosses: totalLosses,
		Scored: stats.goalsScored,
		conceeded: stats.goalsReceived
	});
}

export async function games_history(request, reply)
{
	const userId = request.user.id;
	const history = await profileService.getLast6MatchesWithOpponent(request.server.prisma, userId);
	return reply.send({game: history});
}

export async function getMessages(request, reply)
{
    const userId1 = request.user.id;
    const user2 = await getUserByUsername(request.server.prisma, request.query.username);
    if (!user2) return reply.send({message: 'Username not found'});
    const msgs = await profileService.getMessagesBetweenUsers(request.server.prisma, userId1, user2.id);
    if (!msgs) {
        return reply.send({ messages: [] });
    }
    return reply.send({messages: msgs});
}

export async function getNotifications(request, reply)
{
	const user = await getUserByUsername(request.server.prisma, request.query.username);
	if (!user) return reply.send({message: 'Username not found'});
	const notif = await profileService.getNotificationsForUser(request.server.prisma, user.id);
	return reply.send({notifications: notif});
}

export async function deleteNotifications(request, reply)
{
	const receiverId = request.user.id;
	const user = await getUserByUsername(request.server.prisma, request.body.username);
	if (!user) return reply.send({message: 'Username not found'});
	await profileService.deleteNotif(request.server.prisma, user.id, receiverId);
	return reply.send({success: true});
}