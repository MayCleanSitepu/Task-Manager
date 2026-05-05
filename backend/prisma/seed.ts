import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Cleaning Database ---');
  // Order matters for deletion
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log('--- Seeding Roles & Users ---');
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. ADMIN
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@pm.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // 2. MEMBER 1 (Active)
  const member1 = await prisma.user.create({
    data: {
      name: 'Alex Member',
      email: 'alex@pm.com',
      password: hashedPassword,
      role: 'MEMBER',
    },
  });

  // 3. MEMBER 2 (For Conflicts)
  const member2 = await prisma.user.create({
    data: {
      name: 'Jordan Member',
      email: 'jordan@pm.com',
      password: hashedPassword,
      role: 'MEMBER',
    },
  });

  console.log('--- Seeding Projects ---');
  // Admin Project
  const adminProject = await prisma.project.create({
    data: {
      name: 'Corporate Infrastructure',
      description: 'Global IT setup for the company',
      status: 'ACTIVE',
      ownerId: admin.id,
    },
  });

  // Member 1 Project
  const memberProject = await prisma.project.create({
    data: {
      name: 'Mobile App Redesign',
      description: 'Redesigning the iOS and Android applications',
      status: 'ACTIVE',
      ownerId: member1.id,
    },
  });

  // Archived Project (to test soft delete/filter)
  await prisma.project.create({
    data: {
      name: 'Old Legacy Project',
      description: 'Old project that was archived',
      status: 'ARCHIVED',
      ownerId: member1.id,
    },
  });

  console.log('--- Seeding Tasks ---');
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Normal Tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'API Documentation',
        description: 'Write Swagger docs',
        priority: 'HIGH',
        status: 'DONE',
        projectId: adminProject.id,
        assigneeId: admin.id,
        scheduledStart: new Date(today.setHours(9, 0, 0, 0)),
        scheduledEnd: new Date(today.setHours(11, 0, 0, 0)),
      },
      {
        title: 'UI Component Library',
        description: 'Build shared UI components',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        projectId: memberProject.id,
        assigneeId: member1.id,
        scheduledStart: new Date(today.setHours(13, 0, 0, 0)),
        scheduledEnd: new Date(today.setHours(15, 0, 0, 0)),
      }
    ]
  });

  console.log('--- Seeding Conflict Case ---');
  // Conflict for Alex (Member 1)
  // Task A: 2pm - 4pm
  // Task B: 3pm - 5pm (Overlaps A)
  await prisma.task.create({
    data: {
      title: 'Database Optimization',
      description: 'Performance tuning',
      priority: 'URGENT',
      status: 'TODO',
      projectId: memberProject.id,
      assigneeId: member1.id,
      scheduledStart: new Date(tomorrow.setHours(14, 0, 0, 0)),
      scheduledEnd: new Date(tomorrow.setHours(16, 0, 0, 0)),
    }
  });

  await prisma.task.create({
    data: {
      title: 'Security Audit',
      description: 'Check for vulnerabilities',
      priority: 'HIGH',
      status: 'TODO',
      projectId: memberProject.id,
      assigneeId: member1.id,
      scheduledStart: new Date(tomorrow.setHours(15, 0, 0, 0)), // Conflict!
      scheduledEnd: new Date(tomorrow.setHours(17, 0, 0, 0)),
    }
  });

  console.log('--- Database Seeded Successfully! ---');
  console.log('Admin: admin@pm.com / password123');
  console.log('Member 1: alex@pm.com / password123');
  console.log('Member 2: jordan@pm.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
