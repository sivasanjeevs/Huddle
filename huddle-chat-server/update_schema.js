const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (!schema.includes('followers User[] @relation("UserFollows")')) {
  schema = schema.replace(
    'photos           LobbyPhoto[]\n}', 
    'photos           LobbyPhoto[]\n  followers        User[]   @relation("UserFollows")\n  following        User[]   @relation("UserFollows")\n}'
  );
  fs.writeFileSync('prisma/schema.prisma', schema);
  console.log('Schema updated');
} else {
  console.log('Schema already updated');
}
