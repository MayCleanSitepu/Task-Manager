import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';
import { TaskRepository } from '../tasks/task.repository';

describe('ScheduleService', () => {
  let scheduleService: ScheduleService;

  const mockTaskRepository = {
    findByDateRange: jest.fn(),
    findAllByAssignee: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        { provide: TaskRepository, useValue: mockTaskRepository },
      ],
    }).compile();

    scheduleService = module.get<ScheduleService>(ScheduleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSchedule()', () => {
    it('(+) should return schedule for the user', async () => {
      const userId = 'u-1';
      const startDate = '2026-05-01';
      const endDate = '2026-05-31';
      const fakeTasks = [
        { id: 't-1', title: 'Task 1' },
        { id: 't-2', title: 'Task 2' },
      ];

      mockTaskRepository.findByDateRange.mockResolvedValue(fakeTasks);
      const result = await scheduleService.getSchedule(
        { sub: userId, role: 'MEMBER' },
        new Date(startDate),
        new Date(endDate),
      );

      expect(mockTaskRepository.findByDateRange).toHaveBeenCalledWith(
        userId,
        new Date(startDate),
        new Date(endDate),
      );
      expect(result).toEqual(fakeTasks);
    });
  });

  describe('getConflict()', () => {
    it('(+)no conflict', async () => {
      const userId = 'u-1';
      const fakeTasks = [
        {
          id: 't-1',
          title: 'Morning Task',
          scheduledStart: new Date('2026-05-10T08:00:00Z'),
          scheduledEnd: new Date('2026-05-10T10:00:00Z'),
        },
        {
          id: 't-2',
          title: 'Afternoon Task',
          scheduledStart: new Date('2026-05-10T13:00:00Z'),
          scheduledEnd: new Date('2026-05-10T15:00:00Z'),
        },
      ];

      mockTaskRepository.findAllByAssignee.mockResolvedValue(fakeTasks);
      const result = await scheduleService.getConflict(userId);

      expect(result).toEqual([]);
    });

    it('(-)conflict', async () => {
      const userId = 'u-1';
      const fakeTasks = [
        {
          id: 't-1',
          title: 'Task 1',
          scheduledStart: new Date('2026-05-10T10:00:00Z'),
          scheduledEnd: new Date('2026-05-10T12:00:00Z'),
        },
        {
          id: 't-2',
          title: 'Task 2',
          scheduledStart: new Date('2026-05-10T11:00:00Z'),
          scheduledEnd: new Date('2026-05-10T13:00:00Z'),
        },
      ];

      mockTaskRepository.findAllByAssignee.mockResolvedValue(fakeTasks);
      const result = await scheduleService.getConflict(userId);

      expect(result.length).toBe(1);
      expect(result[0].message).toContain(
        'conflict schedule between "Task 1" and "Task 2"',
      );
    });
  });
});
