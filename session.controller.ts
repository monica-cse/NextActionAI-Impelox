import { Controller, Post, Body } from '@nestjs/common';
import { SessionService } from './session.service';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  // Expect payload with externalSessionId, templateId, userId in body
  @Post('generate')
  async generateSession(
    @Body()
    body: {
      externalSessionId: string;
      templateId: string;
      userId: string;
    },
  ) {
    const { externalSessionId, templateId, userId } = body;

    // Validate input presence (you can extend validation with DTOs later)
    if (!externalSessionId || !templateId || !userId) {
      return { error: 'externalSessionId, templateId and userId are required' };
    }

    // Use the service to get or create the session
    const session = await this.sessionService.getOrCreateSession(
      externalSessionId,
      templateId,
      userId,
    );

    return { sessionId: session._id.toString() };
  }
}
