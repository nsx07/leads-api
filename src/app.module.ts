import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LeadModule } from './lead/lead.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { LeadController } from './lead/lead.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [LeadModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(LeadController);
  }
}
