import { Module } from '@nestjs/common';
import { LeadService } from './lead.service';
import { LeadController } from './lead.controller';
import { Dynamo } from 'src/data/dynamo';

@Module({
  providers: [LeadService, Dynamo],
  controllers: [LeadController],
})
export class LeadModule {}
