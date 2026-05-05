import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
export class CreateProjectDto {
  @IsString()
  @IsNotEmpty({ message: 'Project name are required' })
  @MinLength(3, { message: 'Project name at least 3 characters' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Description are required' })
  description: string;

}