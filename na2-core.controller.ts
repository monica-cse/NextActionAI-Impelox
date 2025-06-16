import {
  Controller,
  Post,
  Body,
  Logger,
  UseGuards,
  Req
} from '@nestjs/common';
import { Request } from 'express';

import { Na2CoreService } from './na2-core.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { CurrentUserToken } from '../common/decorators/current-user-token.decorator';

@Controller('na2-core')
export class Na2CoreController {
  private readonly logger = new Logger(Na2CoreController.name);

  constructor(
    private readonly na2CoreService: Na2CoreService,
  ) { }

  @Post('decision-engine')
  @UseGuards(JwtAuthGuard)
  async processNextAction(
    @Body()
    body: {
      input_data: {
        query: string;
        template_id: string;
        user: string;
      };
      session_id: string;
      user_id: string;
    },
    @Req() req: Request,
    @CurrentUserToken() userJwtToken: string,
  ) {
    return this.na2CoreService.processDecisionEngine(body, userJwtToken);
  }
}