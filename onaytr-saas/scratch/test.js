const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findFirst().then(console.log).finally(() => p.$disconnect());
