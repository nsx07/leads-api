import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getEcho(): string {
    return 'Echo!';
  }
}
