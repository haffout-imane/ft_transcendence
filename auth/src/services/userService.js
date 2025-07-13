export async function createUser(prisma, data) {
  return await prisma.user.create({ 
    data,
   });
}

export async function updateUser(prisma, id, newData) {
  return await prisma.user.update({
    where: { id },
    data: newData,
  });
}

export async function isUserExists(prisma, userData) {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: userData.username },
        { email: userData.email }
      ]
    }
  });
  return existingUser !== null;
}

export async function getUserByEmail(prisma, email) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function getUserById(prisma, id) {
  return await prisma.user.findUnique({
    where: { id },
  });
}
//new
export async function findOrCreateUser(prisma, userData) {
  let user = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: userData.email,
        profilepicture: userData.picture,
        username: '',
        remote: true,
        isOnline: true,
      },
    });
  }
  console.table(userData);
  const cleanName = userData.given_name.replace(/\s+/g, '').toLowerCase();
  // add 4 characters from user id
  const newUsername = `${cleanName}${user.id.toString().slice(-4)}`;
  user = await prisma.user.update({
    where: { id: user.id },
    data: { username: newUsername },
  });

  return user;
}

export async function getUserByUsername(prisma, username) {
  return await prisma.user.findUnique({
    where: { username },
  });
}
export async function findAllUsers(prisma, userId) {
  const allUsersExceptMe = await prisma.user.findMany({
    where: {
      id: {
        not: userId,
      },
    },
    select: {
      username: true,
      profilepicture: true,
      slogan: true,
    },
  });
  return allUsersExceptMe;
}