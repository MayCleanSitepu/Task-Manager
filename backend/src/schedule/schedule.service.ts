import { Injectable } from '@nestjs/common';
import { TaskRepository } from 'src/tasks/task.repository';

@Injectable()
export class ScheduleService {
  constructor(private taskRepository: TaskRepository) {}

  async getSchedule(
    user: { sub: string; role: string },
    start: Date,
    end: Date,
  ) {
    const userId = user.role === 'ADMIN' ? undefined : user.sub;
    return this.taskRepository.findByDateRange(userId, start, end);
  }

  async getConflict(userId: string) {
    const tasks = await this.taskRepository.findAllByAssignee(userId);
    const conflicts = [];

    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        const taskA = tasks[i];
        const taskB = tasks[j];

        if (
          taskA.scheduledStart &&
          taskA.scheduledEnd &&
          taskB.scheduledStart &&
          taskB.scheduledEnd
        ) {
          if (
            taskA.scheduledStart < taskB.scheduledEnd &&
            taskA.scheduledEnd > taskB.scheduledStart
          ) {
            conflicts.push({
              task1: taskA,
              task2: taskB,
              message: `conflict schedule between "${taskA.title}" and "${taskB.title}"`,
            });
          }
        }
      }
    }

    return conflicts;
  }
}
