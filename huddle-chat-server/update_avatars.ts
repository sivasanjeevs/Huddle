require('dotenv').config();
const prisma = require('./lib/prisma');

async function main() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    if (user.avatar && (user.avatar.includes('ui-avatars.com') || user.avatar.includes('dicebear.com'))) {
      await prisma.user.update({
        where: { id: user.id },
        data: { avatar: null }
      });
      console.log(`Reset avatar for ${user.email}`);
    }
  }
  console.log("Done");
}

main().catch(console.error).finally(() => prisma.$disconnect());
