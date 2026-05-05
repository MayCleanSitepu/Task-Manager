import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { TaskRepository } from 'src/tasks/task.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ScheduleController],
  providers: [ScheduleService, TaskRepository],
})
export class ScheduleModule {}
