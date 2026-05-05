const { PrismaClient } = require('./src/generated/prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tasks = await prisma.task.findMany({
    select: {
      id: true,
      title: true,
      assigneeId: true,
      scheduledStart: true,
      scheduledEnd: true,
    }
  });
  console.log('Total Tasks:', tasks.length);
  console.log('Tasks Data:', JSON.stringify(tasks, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
