import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { Role } from '@prisma/client';

type User = {
  sub: string;
  role: Role;
};

@Controller('schedule')
@UseGuards(AuthGuard, RolesGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async getSchedule(
    @CurrentUser() user: User,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.scheduleService.getSchedule(
      user,
      new Date(start),
      new Date(end),
    );
  }

  @Get('conflicts')
  async getConflicts(@CurrentUser() user: User) {
    return this.scheduleService.getConflict(user.sub);
  }
}
