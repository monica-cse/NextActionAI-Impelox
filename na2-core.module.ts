// src/na2-core/na2-core.module.ts

import { Module } from '@nestjs/common';
import { Na2CoreController } from './na2-core.controller';
import { Na2CoreService } from './na2-core.service';
import { HttpClientModule } from '../common/http-client/http-client.module';
import { SessionModule } from '../sessions/session.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [HttpClientModule, SessionModule, AuthModule],
  controllers: [Na2CoreController],
  providers: [Na2CoreService],
})
export class Na2CoreModule {}
