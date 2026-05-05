import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaskRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.TaskUncheckedCreateInput) {
    return this.prisma.task.create({
      data,
      include: { project: true, assignee: true },
    });
  }

  async update(id: string, data: Prisma.TaskUncheckedUpdateInput) {
    return this.prisma.task.update({
      where: { id },
      data,
      include: { assignee: true },
    });
  }

  async findByProject(projectId: string) {
    return this.prisma.task.findMany({
      where: { projectId },
      include: { assignee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: { project: true, assignee: true },
    });
  }

  async findByDateRange(userId: string | undefined, start: Date, end: Date) {
    return this.prisma.task.findMany({
      where: {
        AND: [
          {
            scheduledStart: { lte: end },
            scheduledEnd: { gte: start },
          },
          userId
            ? {
                OR: [{ project: { ownerId: userId } }, { assigneeId: userId }],
              }
            : {},
        ],
      },
      include: { project: true, assignee: true },
    });
  }

  async findAllByAssignee(userId: string) {
    return this.prisma.task.findMany({
      where: {
        assigneeId: userId,
        NOT: { scheduledStart: null, scheduledEnd: null },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.task.delete({
      where: { id },
    });
  }
}
