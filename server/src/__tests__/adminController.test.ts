import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Admin Controller', () => {
  let authToken: string;

  beforeAll(async () => {
    // Create a test user and get auth token
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123',
      });

    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        email: 'admin@test.com',
      },
    });
    await prisma.$disconnect();
  });

  describe('GET /api/admin/system-stats', () => {
    it('should return system statistics', async () => {
      const response = await request(app)
        .get('/api/admin/system-stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data).toHaveProperty('activeUsers');
      expect(response.body.data).toHaveProperty('totalProjects');
      expect(response.body.data).toHaveProperty('totalApplications');
      expect(response.body.data).toHaveProperty('systemUptime');
      expect(response.body.data).toHaveProperty('databaseSize');
      expect(response.body.data).toHaveProperty('averageResponseTime');
      expect(response.body.data).toHaveProperty('errorRate');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/admin/system-stats');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/admin/users', () => {
    it('should return list of users', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const user = response.body.data[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('firstName');
        expect(user).toHaveProperty('lastName');
        expect(user).toHaveProperty('createdAt');
        expect(user).toHaveProperty('lastLogin');
        expect(user).toHaveProperty('isActive');
        expect(user).toHaveProperty('projectCount');
        expect(user).toHaveProperty('applicationCount');
      }
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/admin/users');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/admin/system-logs', () => {
    it('should return system logs', async () => {
      const response = await request(app)
        .get('/api/admin/system-logs')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const log = response.body.data[0];
        expect(log).toHaveProperty('id');
        expect(log).toHaveProperty('level');
        expect(log).toHaveProperty('message');
        expect(log).toHaveProperty('timestamp');
        expect(['info', 'warning', 'error']).toContain(log.level);
      }
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/admin/system-logs');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/admin/performance-metrics', () => {
    it('should return performance metrics', async () => {
      const response = await request(app)
        .get('/api/admin/performance-metrics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const metric = response.body.data[0];
        expect(metric).toHaveProperty('timestamp');
        expect(metric).toHaveProperty('responseTime');
        expect(metric).toHaveProperty('requestsPerMinute');
        expect(metric).toHaveProperty('errorCount');
        expect(typeof metric.responseTime).toBe('number');
        expect(typeof metric.requestsPerMinute).toBe('number');
        expect(typeof metric.errorCount).toBe('number');
      }
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/admin/performance-metrics');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/admin/users/:id', () => {
    it('should update user information', async () => {
      // First get a user to update
      const usersResponse = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${authToken}`);

      if (usersResponse.body.data.length > 0) {
        const userId = usersResponse.body.data[0].id;
        
        const updateData = {
          firstName: 'Updated',
          lastName: 'Name',
          email: 'updated@test.com',
        };

        const response = await request(app)
          .put(`/api/admin/users/${userId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/admin/users/test-id')
        .send({ firstName: 'Test' });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/admin/users/:id/activate', () => {
    it('should activate a user', async () => {
      // First get a user to activate
      const usersResponse = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${authToken}`);

      if (usersResponse.body.data.length > 0) {
        const userId = usersResponse.body.data[0].id;
        
        const response = await request(app)
          .put(`/api/admin/users/${userId}/activate`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('activated');
      }
    });
  });

  describe('PUT /api/admin/users/:id/deactivate', () => {
    it('should deactivate a user', async () => {
      // First get a user to deactivate
      const usersResponse = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${authToken}`);

      if (usersResponse.body.data.length > 0) {
        const userId = usersResponse.body.data[0].id;
        
        const response = await request(app)
          .put(`/api/admin/users/${userId}/deactivate`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('deactivated');
      }
    });
  });
}); 