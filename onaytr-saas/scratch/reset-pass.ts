import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);
  const user = await prisma.user.update({
    where: { email: 'akartolga0@gmail.com' },
    data: { passwordHash }
  });
  console.log("Password reset successfully for:", user.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
