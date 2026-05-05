import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Eterna API (e2e)', () => {
  let app: INestApplication<App>;
  let jwtToken = '';
  const testUser = {
    name: 'E2E Tester',
    email: `e2e_${Date.now()}@example.com`,
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    it('(-)password (401)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' })
        .expect(401);
    });

    it('(+)register (201)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);
        
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(testUser.email);
    });

    it('(+)login (201)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(201);
        
      expect(response.body).toHaveProperty('access_token');
      jwtToken = response.body.access_token;
    });

    it('(-)email (400)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Quavo', email: 'loremipsuim', password: '67' })
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('email must be an email'),
          expect.stringContaining('Password at least contain 6 characters')
        ])
      );
    });
  });

  describe('Routes & Logic', () => {
    let projectId = '';
    let testUserId = '';

 
    beforeAll(async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: testUser.email, password: testUser.password });
        testUserId = response.body.user.id;
    });

    it('(-) API token (401)', async () => {
      await request(app.getHttpServer())
        .get('/projects')
        .expect(401);
    });

    it('(+) project w/token (201)', async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ name: 'E2E Project', description: 'this is test' })
        .expect(201);
        
      expect(response.body).toHaveProperty('id');
      projectId = response.body.id;
    });

    it('(+) Conflict Detection', async () => {
      const now = Date.now();
      
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'Meeting 1',
          projectId: projectId,
          assigneeId: testUserId,
          scheduledStart: new Date(now + 1000000).toISOString(),
          scheduledEnd: new Date(now + 2000000).toISOString(),
          priority: 'HIGH'
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'Meeting 2 crash',
          projectId: projectId,
          assigneeId: testUserId,
          scheduledStart: new Date(now + 1500000).toISOString(),
          scheduledEnd: new Date(now + 2500000).toISOString(),
          priority: 'HIGH'
        })
        .expect(201);


      const conflictRes = await request(app.getHttpServer())
        .get('/schedule/conflicts')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(Array.isArray(conflictRes.body)).toBe(true);
      expect(conflictRes.body.length).toBeGreaterThan(0);
      expect(conflictRes.body[0].message).toContain('conflict schedule between "Meeting Penting 1" and "Meeting Penting 2"');
    });
  });
});
