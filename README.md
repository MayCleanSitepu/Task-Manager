# Project Management & Task Scheduler

A full-stack Task Management application built with **NestJS**, **Next.js**, and **PostgreSQL**. This system features real-time notifications, schedule conflict detection, and Role-Based Access Control (RBAC).

## Quick Start (Docker)

If you have Docker installed, you can get everything running with one command:

```bash
docker-compose up -d
```

The app will be available at:
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:3001`
- **Swagger Docs**: `http://localhost:3001/api`

## Local Setup

### 1. Backend
```bash
cd backend
npm install
# Copy env and setup DB
cp .env.example .env
# Run migrations and seed data
npx prisma migrate dev
npx ts-node prisma/seed.ts
# Start server
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Seed Data (For Testing)


| User Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@pm.com` | `password123` |
| **Member 1** | `alex@pm.com` | `password123` |
| **Member 2** | `jordan@pm.com` | `password123` |

**Test Cases included in Seed:**
- **RBAC**: Admin can see all projects; Members only see their own.
- **Conflicts**: Alex (Member 1) has two overlapping tasks scheduled for tomorrow.
- **Notifications**: Assigning a task will trigger a real-time WebSocket alert.

## Tech Choices and Reasons

- **NestJS (Backend)**: Modular architecture, strong TypeScript support, and built-in support for guards (RBAC) and WebSockets.
- **Next.js (Frontend)**: Utilized for solid routing, server-side capabilities, and fast development cycle.
- **Prisma (ORM)**: Provides a type-safe database client and easy-to-manage migrations.
- **Base UI (Radix/Tailwind)**: Easy & Quick
- **Zustand**: A lightweight state management library for handling authentication and global state.
- **Socket.io**: Enables real-time task assignment notifications.

## Future Improvements

Given more time, I would implement:
- **Advanced File Attachments**: Allow users to upload documents to tasks using S3.
- **Comprehensive E2E Testing**: Add Cypress or Playwright tests for critical user flows.
- **Activity Log**: A detailed audit trail for every change made to a project or task.
- **Email Notifications**: Fallback for users who are offline during a task assignment.

## Time Spent

| Phase | Time |
| :--- | :--- |
| Project Initialization & DB Schema | ~1 hour |
| Backend API & RBAC Implementation | ~3 hours |
| Frontend Dashboard & Component UI | ~5 hours |
| Scheduling Logic & Conflict Detection | ~2 hours |
| WebSocket & Polish (Swagger, CI) | ~1 hour |
| **Total** | **~12 hours** |

---
*Developed as part of a technical assessment.*
