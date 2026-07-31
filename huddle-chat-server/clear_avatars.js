require('dotenv').config();
const prisma = require('./lib/prisma');
async function main() {
  await prisma.user.updateMany({
    data: { avatar: null }
  });
  console.log("All avatars cleared");
}
main().finally(() => prisma.$disconnect());
