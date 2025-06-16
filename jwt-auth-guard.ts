import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    this.logger.debug('JwtAuthGuard activated');
    return super.canActivate(context);
  }

  override handleRequest<User = any>(
    err: Error | null,
    user: User,
    info: { message?: string } | JsonWebTokenError | null,
    context: ExecutionContext,
    status?: any,
  ): User {
    if (err) {
      this.logger.error(`JWT error: ${err.message}`);
      throw err;
    }

    if (!user) {
      const message = (info && 'message' in info && info.message) || 'Unauthorized';
      this.logger.warn(`JWT validation failed: ${message}`);
      throw new UnauthorizedException(message);
    }

    this.logger.debug('JWT authentication successful');
    return user;
  }
}
