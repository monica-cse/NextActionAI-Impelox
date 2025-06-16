import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth Endpoints (e2e)', () => {
  let app: INestApplication;
  const testEmail = 'test@example.com';
  const testPassword = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/auth/register (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: testEmail, password: testPassword })
      .expect(201);

    expect(response.body).toHaveProperty('message');
  });

  it('/auth/login (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testEmail, password: testPassword })
      .expect(200);

    expect(response.body).toHaveProperty('access_token');
  });

  it('/auth/forgot-password (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email: testEmail })
      .expect(200);

    expect(response.body).toHaveProperty('message');
  });

  it('/auth/reset-password (POST)', async () => {
    const fakeOtp = '123456';

    const response = await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({
        email: testEmail,
        otp: fakeOtp,
        newPassword: 'NewPassword123!',
      })
      .expect(200);

    expect(response.body).toHaveProperty('message');
  });
});
