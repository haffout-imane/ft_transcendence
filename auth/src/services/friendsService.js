export async function addFriend(prisma, userId, friendId) {
  const existing = await prisma.friendship.findFirst({
    where: {
      userId,
      friendId
    }
  });

  

  if (!existing) {
    await prisma.$transaction([
      prisma.friendship.create({
        data: { userId, friendId }
      }),
      prisma.friendship.create({
        data: { userId: friendId, friendId: userId }
      })
    ]);
  }
}
export async function removeFriend(prisma, userId, friendId) {
  await prisma.friendship.deleteMany({
    where: {
      OR: [
        { userId, friendId },
        { userId: friendId, friendId: userId }
      ]
    }
  });  
}
export async function blockFriend(prisma, blockerId, blockedId) {
  if (blockerId === blockedId) throw new Error("Can't block yourself");
  const existing = await prisma.block.findFirst({
    where: { blockerId, blockedId },
  });
  if (!existing) {
    await prisma.$transaction([
      prisma.block.create({
        data: { blockerId, blockedId },
      }),
      prisma.friendship.deleteMany({
        where: {
          OR: [
            { userId: blockerId, friendId: blockedId },
            { userId: blockedId, friendId: blockerId },
          ],
        },
      }),
    ]);
  }
}
export async function unBlockdFriend(prisma, blockerId, blockedId) {
  await prisma.block.deleteMany({
    where: {
      blockerId,
      blockedId,
    },
  });
}
export async function findAllFriend(prisma, userId) {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { userId },
        { friendId: userId }
      ]
    },
    include: {
      user: true,
      friend: true,
    }
  });
  const friends = friendships.map(f => (f.userId === userId ? f.friend : f.user));
  const unique = {};
  for (const friend of friends) {
    unique[friend.id] = friend;
  }
  const uniqueFriends = Object.values(unique);
  const results = [];
  for (const friend of uniqueFriends) {
    const chat = await prisma.chat.findFirst({
      where: {
        AND: [
          { users: { some: { id: userId } } },
          { users: { some: { id: friend.id } } }
        ]
      },
      include: {
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1
        }
      }
    });
    results.push({
      username: friend.username,
      profilepicture: friend.profilepicture,
      isOnline: friend.isOnline,
      lastMessage: chat?.messages[0]?.content || null,
      lastMessageSentAt: chat?.messages[0]?.sentAt || null
    });
  }
  return results;
}
export async function findAllUsersBlockedMe(prisma, userId) {
  const blocks = await prisma.block.findMany({
    where: { blockedId: userId },
    include: { blocker: true },
  });
  return blocks.map(b => ({
    username: b.blocker.username,
    profilepicture: b.blocker.profilepicture,
    slogan: b.blocker.slogan,
  }));
}

export async function findAllUsersIBlocked(prisma, userId) {
  const blocks = await prisma.block.findMany({
    where: { blockerId: userId },
    include: { blocked: true },
  });
  return blocks.map(b => ({
    username: b.blocked.username,
    profilepicture: b.blocked.profilepicture,
    slogan: b.blocked.slogan,
  }));
}

export async function createChat(prisma, userId, friendId) {
	await prisma.chat.create({
	  data: {
		name: "Group Chat",
		users: {
		  connect: [
			{ id: userId },
			{ id: friendId }
		  ]
		}
	  },
	  include: {
		users: true
	  }
	});
}

export async function deleteChatBetween(prisma, userId, friendId) {
  const chat = await prisma.chat.findFirst({
    where: {
      users: {
        some: { id: userId }
      },
      AND: {
        users: {
          some: { id: friendId }
        }
      }
    }
  });
  if (!chat) return;
  await prisma.chat.delete({
    where: { id: chat.id }
  });
}