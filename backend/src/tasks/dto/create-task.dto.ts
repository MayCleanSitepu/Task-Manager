import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Priority, TaskStatus } from 'src/generated/prisma/enums';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;
    @IsString()
    @IsOptional()
    description?: string;
    @IsEnum(Priority)
    @IsOptional()
    priority?: Priority;
    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;
    @IsUUID()
    @IsNotEmpty()
    projectId: string;
    @IsUUID()
    @IsOptional()
    assigneeId?: string;

    @IsDateString()
    @IsOptional()
    scheduledStart?: string;

    @IsDateString()
    @IsOptional()
    scheduledEnd?: string;
}
