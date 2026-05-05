import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
  let tasksService: TasksService;

  const mockTaskRepository = {
    create: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useValue: mockTaskRepository },
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
        priority: 'HIGH' as any,
      };
      const fakeTask = { id: 't-1', ...dto, status: 'TODO' };

      mockTaskRepository.create.mockResolvedValue(fakeTask);
      const result = await tasksService.create(dto);

      expect(mockTaskRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(fakeTask);
    });
  });

  describe('findOne()', () => {
    it('(-) should throw NotFoundException if task does not exist', async () => {
      const invalidId = 'invalid-t-id';

      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(tasksService.findOne(invalidId)).rejects.toThrow(NotFoundException);
      await expect(tasksService.findOne(invalidId)).rejects.toThrow('Task not found');
    });
  });
});
