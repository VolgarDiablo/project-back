import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Создаем админа
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Admin User',
      password: adminPassword,
      role: Role.ADMIN,
      email_verified: true, // <= фикс
      level1_per: 10,
      level2_per: 5,
    },
  });

  // Создаем тестового юзера
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      name: 'Test User',
      password: userPassword,
      role: Role.USER,
      email_verified: true, // <= фикс
      level1_per: 10,
      level2_per: 5,
    },
  });

  // Создаем записи в user_referral для каждого пользователя
  await prisma.userReferral.upsert({
    where: { user_id: admin.id },
    update: {},
    create: { user_id: admin.id },
  });

  await prisma.userReferral.upsert({
    where: { user_id: user.id },
    update: {},
    create: { user_id: user.id },
  });

  console.log('Seeded users:', admin, user); // не JSON.stringify
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
