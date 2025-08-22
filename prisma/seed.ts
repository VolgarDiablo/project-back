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

// async function seedPlans() {
//   const titles = [
//     'Starter Plan',
//     'Basic Growth',
//     'Premium Yield',
//     'Crypto Booster',
//     'Stable Income',
//     'Aggressive Return',
//   ];

//   const descriptions = [
//     'Great for beginners.',
//     'Steady returns every day.',
//     'High yield for serious investors.',
//     'Crypto-focused aggressive plan.',
//     'Low risk, stable income.',
//     'Maximize your ROI aggressively.',
//   ];

//   for (let i = 0; i < 6; i++) {
//     const plan = await prisma.plan.upsert({
//       where: { id: i + 1 }, // upsert требует уникальный `where`, используем id
//       update: {},
//       create: {
//         title: titles[i],
//         description: descriptions[i],
//         percent_daily: Number((Math.random() * 4 + 1).toFixed(2)), // от 1% до 5%
//         term_days: Math.floor(Math.random() * 90 + 30), // от 30 до 120 дней
//         min_deposit: Math.floor(Math.random() * 900 + 100), // от $100 до $1000
//         roi: Number((Math.random() * 400 + 100).toFixed(2)), // от 100% до 500%
//       },
//     });

//     console.log('Seeded plan:', plan);
//   }
// }

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// seedPlans()
//   .then(() => {
//     console.log('✅ Done seeding plans.');
//     prisma.$disconnect();
//   })
//   .catch((e) => {
//     console.error('❌ Error:', e);
//     prisma.$disconnect();
//     process.exit(1);
//   });
