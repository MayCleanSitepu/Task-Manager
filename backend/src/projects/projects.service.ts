import { Injectable, NotFoundException, Search } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsRepository } from './projects.repository';

@Injectable()
export class ProjectsService {
  constructor(private repository: ProjectsRepository) {}

  async create(createProjectDto: CreateProjectDto, userId: string) {
    return this.repository.create({
      ...createProjectDto,
      ownerId: userId,
    });
  }

  async findAll(
    user: { sub: string; role: string },
    search?: string,
    skip?: number,
    take?: number,
  ) {
    const userId = user.role === 'ADMIN' ? undefined : user.sub;
    return this.repository.findAll(search, skip, take, userId);
  }

  async findOne(id: string, user: { sub: string; role: string }) {
    const project = await this.repository.findById(id);
    if (!project) throw new NotFoundException('Project not found');

    if (user.role !== 'ADMIN' && project.ownerId !== user.sub) {
      throw new NotFoundException('Project not found or access denied');
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    user: { sub: string; role: string },
  ) {
    await this.findOne(id, user);
    return this.repository.update(id, updateProjectDto);
  }

  async remove(id: string, user: { sub: string; role: string }) {
    await this.findOne(id, user);
    return this.repository.delete(id);
  }
}
