import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    this.validateToken(req.headers.authorization);
    next();
  }

  private validateToken(token?: string) {
    const [bearer, value] = token?.split(' ');

    if (bearer !== 'Bearer') {
      throw new BadRequestException('Invalid token');
    }

    const valueDecoded = Buffer.from(value, 'base64').toString('utf-8');

    if (!valueDecoded || !valueDecoded.includes('number42')) {
      throw new BadRequestException('Invalid token');
    }

    const maxTime = new Date().getTime() - 1000 * 60 * 60 * 3;
    const dateMilis = +valueDecoded.split('-number42')[0];

    if (dateMilis < maxTime) {
      throw new BadRequestException('Invalid token');
    }
  }
}
