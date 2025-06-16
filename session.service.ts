import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SessionDocument } from '../database/schemas/session.schema';
import { UserDocument } from '../database/schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @InjectModel('Session')
    private readonly sessionModel: Model<SessionDocument>,
    @InjectModel('User')
    private readonly userModel: Model<UserDocument>,
  ) { }

  /**
   * Get or create a session based on external session_id (string).
   * If session ID is missing or invalid, generates a new UUID.
   */
  async getOrCreateSession(
    externalSessionId: string,
    templateId: string,
    userId: string,
  ): Promise<SessionDocument> {
    let session: SessionDocument | null;

    // Validate templateId and userId as Mongo ObjectIds
    if (!Types.ObjectId.isValid(templateId)) {
      this.logger.error(`Invalid templateId: ${templateId}`);
      throw new BadRequestException('Invalid templateId');
    }

    if (!Types.ObjectId.isValid(userId)) {
      this.logger.error(` Invalid userId: ${userId}`);
      throw new BadRequestException('Invalid userId');
    }

    // Try to find existing session by _id (string)
    try {
      session = await this.sessionModel.findById(externalSessionId);
    } catch (e) {
      this.logger.warn(` Failed to find session by ID: ${externalSessionId}`);
      session = null;
    }

    console.log(session);

    // If session not found, create a new one
    if (!session) {
      const workspaceId = await this.getWorkspaceIdForUser(userId);

      // Use externalSessionId if present and reasonably long; else generate UUID
      const newSessionId: string =
        externalSessionId && externalSessionId.length > 10
          ? externalSessionId
          : uuidv4();

      const newSessionData: Partial<SessionDocument> = {
        _id: newSessionId,
        template_id: new Types.ObjectId(templateId),
        workspace_id:
          workspaceId && Types.ObjectId.isValid(workspaceId)
            ? new Types.ObjectId(workspaceId)
            : undefined,
        status: 'active',
        history: [],
        // created_at and updated_at handled by Mongoose timestamps in schema
      };

      session = await this.sessionModel.create(newSessionData);
      this.logger.log(`Created new session with ID: ${session._id}`);
    } else {
      this.logger.log(` Found existing session with ID: ${session._id}`);
    }

    return session;
  }

  /**
   * Append a message entry to the session's history array.
   */
  async addToSessionHistory(
    sessionId: string,
    entry: {
      role: 'user' | 'agent' | 'system';
      content: string;
      metadata?: Record<string, any>;
    },
  ) {
    if (!sessionId || sessionId.length < 10) {
      this.logger.warn(` Invalid sessionId for history append: ${sessionId}`);
      throw new BadRequestException('Invalid sessionId');
    }

    await this.sessionModel.updateOne(
      { _id: sessionId },
      {
        $push: {
          history: {
            _id: new Types.ObjectId(),
            timestamp: new Date(),
            ...entry,
          },
        },
        $set: { updated_at: new Date() },
      },
    );

    this.logger.log(` Appended message to session ${sessionId}`);
  }

  /**
   * Retrieve the first workspace ID that the user has access to.
   */
  async getWorkspaceIdForUser(userId: string): Promise<string | null> {
    if (!Types.ObjectId.isValid(userId)) {
      this.logger.warn(` Invalid userId: ${userId}`);
      return null;
    }

    const user = await this.userModel.findById(userId);
    if (
      user &&
      Array.isArray(user.workspace_access) &&
      user.workspace_access[0]?.workspace_id
    ) {
      return user.workspace_access[0].workspace_id.toString();
    }

    this.logger.warn(` No workspace found for user: ${userId}`);
    return null;
  }
}
