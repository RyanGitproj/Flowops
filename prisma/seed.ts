import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@flowops.dev' },
    update: {},
    create: {
      email: 'admin@flowops.dev',
      password: hashedPassword,
      name: 'Admin FlowOps',
    },
  });

  console.log(`✅ User created: ${user.email}`);
  console.log('🎉 Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
