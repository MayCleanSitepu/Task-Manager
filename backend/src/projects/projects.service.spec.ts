import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { ProjectsRepository } from './projects.repository';
import { NotFoundException } from '@nestjs/common';

describe('ProjectsService', () => {
  let projectsService: ProjectsService;

  const mockProjectsRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: ProjectsRepository, useValue: mockProjectsRepository },
      ],
    }).compile();

    projectsService = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('(+) project creation', async () => {
      const createProjectDto = { name: 'project log', description: 'Web app' };
      const userId = 'u-1';
      const fakeResult = {
        id: 'p-1',
        ...createProjectDto,
        ownerId: userId,
        status: 'ACTIVE',
      };

      mockProjectsRepository.create.mockResolvedValue(fakeResult);

      const result = await projectsService.create(createProjectDto, userId);

      expect(mockProjectsRepository.create).toHaveBeenCalled();
      expect(result).toEqual(fakeResult);
    });
  });

  describe('findOne()', () => {
    it('(-) should throw NotFoundException if project not found', async () => {
      const invalidId = 'invalid-p-id';
      const user = { sub: 'u-1', role: 'MEMBER' };

      mockProjectsRepository.findById.mockResolvedValue(null);

      await expect(projectsService.findOne(invalidId, user)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
