import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Dynamo } from 'src/data/dynamo';
import { Lead } from 'src/domain/lead/lead';
import { v4 as uuid } from 'uuid';

declare var process: any;

@Injectable()
export class LeadService {
  constructor(private dynamo: Dynamo) {}

  async createLead(dto: any): Promise<any> {
    const lead = {
      id: uuid(),
      ...dto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };


    const validPhone = await this.getLeadById(Lead.cleanAndValidatePhone(lead.phone));

    if (validPhone) {
      throw new BadRequestException('Phone already exists');
    }

    try {
      await this.dynamo.context
        .put({
          TableName: "lead",
          Item: lead,
        })
        .promise();

      await this.setupManyChat(lead);
      return lead;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getLeadById(id: string): Promise<any> {
    try {
      const result = await this.dynamo.context
        .get({
          TableName: "lead",
          Key: { phone: id},
        })
        .promise();
      return result.Item;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getLeads(): Promise<any> {
    try {
      const result = await this.dynamo.context
        .scan({
          TableName: "lead",
        })
        .promise();
      return result.Items;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async setupManyChat(lead: Lead) {
    const body = {
      "first_name": lead.name.split(' ')[0],
      "last_name": lead.name.split(' ')[1],
      "phone": Lead.cleanAndValidatePhone(lead.phone),
      "whatsapp_phone": Lead.cleanAndValidatePhone(lead.phone),
      "email": lead.email,
      "gender": "string",
      "has_opt_in_sms": true,
      "has_opt_in_email": true,
      "consent_phrase": "string"
    }
    
    const response = await fetch(process.env.MANY_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MANY_CHAT_TOKEN}`
      },
      body: JSON.stringify(body)
    }).then(res => res.json());

    if (response.status == "error") {

      if (response?.details?.messages?.whatsapp_phone?.message?.includes("WhatsApp subscriber with this phone number already exists")) {
        return response;
      }

      throw new BadRequestException(response.error);
    }

    return response;
  }
}
