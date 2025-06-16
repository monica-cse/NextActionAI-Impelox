import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users/users.controller';
import { OtpModule } from './otp/otp.module';
import { Na2CoreModule } from './na2-core/na2-core.module';
import { SessionModule } from './sessions/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    MongooseModule.forRoot(
      (() => {
        const { DB_URI, NODE_ENV } = process.env;

        if (!DB_URI) {
          if (NODE_ENV === 'production') {
            throw new Error('DB_URI is required in production environment');
          }
          return 'mongodb://localhost:27017/TestDB';
        }

        return DB_URI;
      })(),
    ),
    UsersModule,
    AuthModule,
    OtpModule,
    Na2CoreModule,
    SessionModule,
  ],
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule {}
