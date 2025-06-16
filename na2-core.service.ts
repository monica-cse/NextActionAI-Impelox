import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { HttpClientService } from '../common/http-client/http-client.service';
import { SessionService } from '../sessions/session.service';
import { ConfigService } from '@nestjs/config';

import * as qs from 'qs';

@Injectable()
export class Na2CoreService {
  private readonly logger = new Logger(Na2CoreService.name);

  constructor(
    private readonly http: HttpClientService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,

  ) { }

  async processDecisionEngine(
    body: {
      input_data: {
        query: string;
        template_id: string;
        user: string;
      };
      session_id: string;
      user_id: string;
    },
    userJwtToken: string,
  ): Promise<any> {
    const { input_data, session_id, user_id } = body;
    const { template_id, query } = input_data;

    this.logger.log(
      `📡 Processing decision-engine request | Session: ${session_id}, User: ${user_id}`,
    );

    if (!userJwtToken) {
      throw new UnauthorizedException('User JWT token is missing');
    }

    try {
      // Get or create session
      const session = await this.sessionService.getOrCreateSession(
        session_id,
        template_id,
        user_id,
      );

      // Add user query to session history
      await this.sessionService.addToSessionHistory(session._id, {
        role: 'user',
        content: query,
      });

      // Process the next action with the decision engine
      const result = await this.processNextAction(
        input_data,
        session._id.toString(),
        user_id,
        userJwtToken,
      );

      // Add agent response to session history
      await this.sessionService.addToSessionHistory(session._id, {
        role: 'agent',
        content: result.message || 'Response from decision engine',
        metadata: result,
      });

      return {
        success: true,
        session_id: session._id,
        ...result,
      };
    } catch (error) {
      this.logger.error('Decision engine processing failed', error);

      return {
        success: false,
        message: error.message || 'Decision engine processing failed',
        error: {
          status: error?.status || 500,
          message: error.message || 'Internal server error',
        },
      };
    }
  }

  private async processNextAction(
    inputData: any,
    sessionId: string,
    userId: string,
    userJwtToken?: string, // optional now
  ): Promise<any> {
    if (!userJwtToken) {
      this.logger.warn('No userJwtToken provided, generating internally...');
    }

    const formData = qs.stringify({
      input_data: JSON.stringify(inputData),
      session_id: sessionId,
      user: userId,
    });

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${userJwtToken}`,
    };

    const url = this.configService.get<string>('DECISION_ENGINE_URL');
    if (!url) {
      this.logger.error('DECISION_ENGINE_URL is not defined in configuration');
      throw new Error('DECISION_ENGINE_URL is not defined in configuration');
    }

    this.logger.log('Calling decision engine with user JWT token');

    try {
      const response = await this.http.post(url, formData, { headers });
      this.logger.log('Next action processed successfully');
      return response;
    } catch (error) {
      this.logger.error(
        'Failed to process next action',
        error.stack || error.message,
      );
      throw error;
    }
  }
}