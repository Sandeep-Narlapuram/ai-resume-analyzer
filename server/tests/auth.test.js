import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';

process.env.JWT_ACCESS_SECRET = 'test_access_secret_at_least_32_characters';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_characters';

const { createApp } = await import('../src/app.js');
const { User } = await import('../src/models/User.js');

let mongod;
let app;

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  app = createApp();
});

after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

test('POST /api/v1/auth/register creates a user and returns an access token', async () => {
  const res = await request(app).post('/api/v1/auth/register').send({
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'StrongPass123',
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.user.email, 'priya@example.com');
  assert.ok(res.body.data.accessToken);
  assert.ok(res.headers['set-cookie']?.some((c) => c.startsWith('refreshToken=')));
});

test('POST /api/v1/auth/register rejects a duplicate email', async () => {
  await request(app).post('/api/v1/auth/register').send({
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'StrongPass123',
  });

  const res = await request(app).post('/api/v1/auth/register').send({
    name: 'Another Name',
    email: 'priya@example.com',
    password: 'StrongPass123',
  });

  assert.equal(res.status, 409);
  assert.equal(res.body.error.code, 'EMAIL_ALREADY_REGISTERED');
});

test('POST /api/v1/auth/login rejects an invalid password', async () => {
  await request(app).post('/api/v1/auth/register').send({
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'StrongPass123',
  });

  const res = await request(app).post('/api/v1/auth/login').send({
    email: 'priya@example.com',
    password: 'WrongPassword1',
  });

  assert.equal(res.status, 401);
  assert.equal(res.body.error.code, 'INVALID_CREDENTIALS');
});

test('GET /api/v1/auth/me requires authentication', async () => {
  const res = await request(app).get('/api/v1/auth/me');
  assert.equal(res.status, 401);
});
