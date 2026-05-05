import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationGateway } from 'src/common/gateways/notification.gateway';
import { Priority, TaskStatus } from 'src/generated/prisma/enums';

describe('TasksService', () => {
  let tasksService: TasksService;

  const mockTaskRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockPrismaService = {
    project: {
      findUnique: jest.fn(),
    },
  };

  const mockNotificationGateway = {
    sendNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useValue: mockTaskRepository },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationGateway, useValue: mockNotificationGateway },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('(+) task creation successfully', async () => {
      const dto = {
        title: 'New Meeting',
        projectId: 'p-1',
        assigneeId: 'u-1',
        priority: Priority.HIGH,
      };
      const user = { sub: 'u-admin', role: 'ADMIN' };
      const fakeTask = { id: 't-1', ...dto, status: TaskStatus.TODO };

      mockPrismaService.project.findUnique.mockResolvedValue({
        id: 'p-1',
        ownerId: 'u-admin',
      });
      mockTaskRepository.create.mockResolvedValue(fakeTask);

      const result = await tasksService.create(dto, user);

      expect(mockTaskRepository.create).toHaveBeenCalled();
      expect(result).toEqual(fakeTask);
    });
  });

  describe('findOne()', () => {
    it('(-) should throw NotFoundException if task does not exist', async () => {
      const invalidId = 'invalid-t-id';
      const user = { sub: 'u-1', role: 'MEMBER' };

      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(tasksService.findOne(invalidId, user)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
