import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskRepository } from './task.repository';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationGateway } from 'src/common/gateways/notification.gateway';

@Injectable()
export class TasksService {
  constructor(
    private repository: TaskRepository,
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway
  ){}

  async create(dto: CreateTaskDto, user: { sub: string, role: string }) {
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) throw new NotFoundException('Project not found');
    
    if (user.role !== 'ADMIN' && project.ownerId !== user.sub) {
      throw new NotFoundException('Access denied to this project');
    }

    const data: Prisma.TaskUncheckedCreateInput = {
      ...dto,
      scheduledStart: dto.scheduledStart ? new Date(dto.scheduledStart) : undefined,
      scheduledEnd: dto.scheduledEnd ? new Date(dto.scheduledEnd) : undefined,
    };
    return this.repository.create(data);
  }

  async findAllByProject(projectId: string) {
    return this.repository.findByProject(projectId);
  }

  async findOne(id: string, user: { sub: string, role: string }) {
    const task = await this.repository.findById(id);
    if (!task) throw new NotFoundException('Task not found');
    
    if (user.role !== 'ADMIN' && task.project.ownerId !== user.sub) {
      throw new NotFoundException('Task not found or access denied');
    }
    
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, user: { sub: string, role: string }) {
    const currentTask = await this.findOne(id, user); 

    const data = {
      ...dto,
      scheduledStart: dto.scheduledStart ? new Date(dto.scheduledStart) : undefined,
      scheduledEnd: dto.scheduledEnd ? new Date(dto.scheduledEnd) : undefined,
    };

    const updatedTask = await this.repository.update(id, data);

    if (dto.assigneeId && dto.assigneeId !== currentTask.assigneeId) {
      this.notificationGateway.sendNotification(dto.assigneeId, 'task_assigned', {
        taskId: id,
        title: updatedTask.title,
        message: `You have been assigned to task: ${updatedTask.title}`
      });
    }

    return updatedTask;
  }

  async remove(id: string, user: { sub: string, role: string }) {
    await this.findOne(id, user); 
    return this.repository.delete(id);
  }
}
