import * as friendsService from '../services/friendsService.js';
import {getUserByUsername, findAllUsers} from '../services/userService.js';
import {deleteNotif} from '../services/profileService.js';

// add friend
export async function ft_addfriend(request, reply)
{
  const userId = request.user.id;
  const friendUser = await getUserByUsername(request.server.prisma, request.body.username);
  if (!friendUser) return reply.send({success: false, message: 'Username not found'});
  await friendsService.addFriend(request.server.prisma, userId, friendUser.id);
  await friendsService.createChat(request.server.prisma, userId, friendUser.id);
  await deleteNotif(request.server.prisma, friendUser.id, userId);
  return reply.send({success: true});
}
//remove friend
export async function ft_removeFriend(request, reply)
{
  const userId = request.user.id;
  const friendUser = await getUserByUsername(request.server.prisma, request.body.username);
  if (!friendUser) return reply.send({success: false, message: 'Username not found'});
  await friendsService.removeFriend(request.server.prisma, userId, friendUser.id);
  await friendsService.deleteChatBetween(request.server.prisma, userId, friendUser.id);
  return reply.send({success: true});
}
//block friend
export async function ft_block(request, reply)
{
  const userId = request.user.id;
  const friendUser = await getUserByUsername(request.server.prisma, request.body.username);
  if (!friendUser) return reply.send({success: false, message: 'Username not found'});
  await friendsService.blockFriend(request.server.prisma, userId, friendUser.id);
  await friendsService.deleteChatBetween(request.server.prisma, userId, friendUser.id);
  return reply.send({success: true});
}
//unblock friend
export async function ft_unblock(request, reply)
{
  const userId = request.user.id;
  const friendUser = await getUserByUsername(request.server.prisma, request.body.username);
  if (!friendUser) return reply.send({success: false, message: 'Username not found'});
  await friendsService.unBlockdFriend(request.server.prisma, userId, friendUser.id);
  return reply.send({success: true});
}
//all friends
export async function ft_friends(request, reply)
{
  const userId = request.user.id;
  const friends = await friendsService.findAllFriend(request.server.prisma, userId);
  return reply.send(friends);
}
//all users
export async function ft_suers(request, reply)
{
  const userId = request.user.id;
  const users = await findAllUsers(request.server.prisma, userId);
  const blockedByUsers = await friendsService.findAllUsersBlockedMe(request.server.prisma, userId);
  const blockedUsernames = blockedByUsers.map(user => user.username);
  const friends = await friendsService.findAllFriend(request.server.prisma, userId);
  const friendUsernames = friends.map(friend => friend.username);
  const blocked = await friendsService.findAllUsersIBlocked(request.server.prisma, userId);
  const blockUsernames = blocked.map(block => block.username);
  const allowedUsers = users
    .filter(user => !blockedUsernames.includes(user.username))
    .map(user => ({
      username: user.username,
      profilepicture: user.profilepicture,
      slogan: user.slogan,
      friends: friendUsernames.includes(user.username),
      blocked : blockUsernames.includes(user.username)
    }));
  return reply.send(allowedUsers);
}