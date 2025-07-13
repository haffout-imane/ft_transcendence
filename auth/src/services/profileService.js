export async function totalMatchesPlayed(prisma, userId) {
	const matchCount = await prisma.match.count({
		where: {
		  OR: [
			{ player1Id: userId },
			{ player2Id: userId },
		  ],
		},
	});
	return matchCount;
}
export async function totalMatchesWinner(prisma, userId) {
	const winnerCount = await prisma.match.count({
		where: {winnerId: userId},
	});
	return winnerCount;
}

export async function getUserGoalsStats(prisma, userId) {
	const matches = await prisma.match.findMany({
	  where: {
		OR: [
		  { player1Id: userId },
		  { player2Id: userId },
		],
	  },
	  select: {
		player1Id: true,
		player2Id: true,
		player1Score: true,
		player2Score: true,
	  },
	});
  
	let goalsScored = 0;
	let goalsReceived = 0;
  
	for (const match of matches) {
	  if (match.player1Id === userId) {
		goalsScored += match.player1Score;
		goalsReceived += match.player2Score;
	  } else if (match.player2Id === userId) {
		goalsScored += match.player2Score;
		goalsReceived += match.player1Score;
	  }
	}
  
	return {
	  goalsScored,
	  goalsReceived,
	};
  }
  export async function getLast6MatchesWithOpponent(prisma, userId) {
	const matches = await prisma.match.findMany({
	  where: {
		OR: [
		  { player1Id: userId },
		  { player2Id: userId },
		],
	  },
	  orderBy: { createdAt: 'desc' },
	  take: 6,
	  include: {
		player1: {
		  select: {
			username: true,
			profilepicture: true,
			slogan: true,
		  },
		},
		player2: {
		  select: {
			username: true,
			profilepicture: true,
			slogan: true,
		  },
		},
	  },
	});
  
	return matches.map(match => {
	  const isPlayer1 = match.player1Id === userId;
  
	  const userScore = isPlayer1 ? match.player1Score : match.player2Score;
	  const opponentScore = isPlayer1 ? match.player2Score : match.player1Score;
	  const opponent = isPlayer1 ? match.player2 : match.player1;
  
	  return {
		opponentUsername: opponent.username,
		opponentSlogan: opponent.slogan,
		opponentProfilepicture: opponent.profilepicture,
		userScore: userScore,
		opponentScore: opponentScore,
	  };
	});
  }
  
  export async function getMessagesBetweenUsers(prisma, userId1, userId2) {
	const chat = await prisma.chat.findFirst({
		where: {
		  AND: [
			{ users: { some: { id: userId1 } } },
			{ users: { some: { id: userId2 } } }
		  ]
		}
	  });
	  if (!chat) {
		return null;
	  }
	  const messagesRaw = await prisma.message.findMany({
		where: { chatId: chat.id },
		orderBy: { sentAt: "asc" },
		select: {
		  content: true,
		  senderId: true,
		  sentAt: true,
		}
	  });
	  const senderIds = [...new Set(messagesRaw.map(m => m.senderId))];
	  const users = await prisma.user.findMany({
		where: { id: { in: senderIds } },
		select: { id: true, username: true }
	  });
	  const userMap = Object.fromEntries(users.map(u => [u.id, u.username]));
	  const messages = messagesRaw.map(m => ({
		text: m.content,
		from: userMap[m.senderId],
		timestamp: m.sentAt
	  }));
	  return messages;
}

export async function getNotificationsForUser(prisma, receiverId) {
	const notifications = await prisma.notification.findMany({
		where: { receiverId },
		include: { sender: { select: { username: true } } },
		orderBy: { createdAt: 'desc' }
	  });
	return notifications.map(n => ({
	  type: n.message,
	  from: n.sender.username
	}));
  }
  export async function deleteNotif(prisma, senderId, receiverId) {
	const deleted = await prisma.notification.deleteMany({
		where: { senderId, receiverId }
	  });
	  return deleted;
  }