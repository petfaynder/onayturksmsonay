import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const p = new PrismaClient();

try {
  const user = await p.user.findUnique({ where: { email: 'akartolga0@gmail.com' } });
  if (!user) {
    console.log('❌ Kullanıcı bulunamadı');
  } else {
    console.log('✅ Kullanıcı bulundu:');
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
    console.log('  isBanned:', user.isBanned);
    console.log('  passwordHash var mı:', !!user.passwordHash);
    console.log('  passwordHash uzunluğu:', user.passwordHash?.length);
    
    // Test şifreler
    const testPasswords = ['123456', 'admin123', 'password', 'Ta170104894*'];
    for (const pw of testPasswords) {
      const valid = await bcrypt.compare(pw, user.passwordHash);
      console.log(`  "${pw}" eşleşiyor mu:`, valid);
    }
  }
} catch (e) {
  console.error('❌ Hata:', e.message);
} finally {
  await p.$disconnect();
}
