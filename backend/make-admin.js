const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin() {
  const email = 'raffiramadhan1510@gmail.com'; // Ganti jika perlu
  const updated = await prisma.user.update({
    where: { email },
    data: { role: 'admin' },
    select: { id: true, email: true, role: true, name: true }
  });
  console.log('✅ Role updated:', JSON.stringify(updated, null, 2));
  await prisma.$disconnect();
}

makeAdmin();
