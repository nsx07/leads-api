import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LeadService } from './lead.service';
import { Lead } from 'src/domain/lead/lead';

@Controller('lead')
export class LeadController {
  constructor(private service: LeadService) {}

  @Post()
  async createLead(@Body() dto: any) {
    Lead.Validate(dto);
    return this.service.createLead(dto);
  }

  @Post('setupManyChat')
  async setupManyChat(@Body() lead: Lead) {
    return this.service.setupManyChat(lead);
  }

  @Get(':id')
  async getLeadById(@Param('id') id: string) {
    return this.service.getLeadById(id);
  }

  @Get()
  async getLeads() {
    return this.service.getLeads();
  }
}
