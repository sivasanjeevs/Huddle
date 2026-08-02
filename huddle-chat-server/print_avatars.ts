require('dotenv').config();
const prisma = require('./lib/prisma');
async function main() {
  const users = await prisma.user.findMany({ select: { name: true, avatar: true } });
  console.log(users);
}
main().finally(() => prisma.$disconnect());
