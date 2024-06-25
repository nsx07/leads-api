import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Dynamo } from 'src/data/dynamo';
import { Lead } from 'src/domain/lead/lead';
import { v4 as uuid } from 'uuid';

declare const process: any;

@Injectable()
export class LeadService {
  constructor(private dynamo: Dynamo) {}

  async createLead(dto: any): Promise<any> {
    const lead = {
      id: uuid(),
      ...dto,
      phone: Lead.cleanAndValidatePhone(dto.phone),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const validPhone = await this.getLeadById(lead.phone);

    if (validPhone) {
      throw new BadRequestException('Phone already exists');
    }

    try {
      await this.dynamo.context
        .put({
          TableName: 'lead',
          Item: lead,
        })
        .promise();

      return { lead, ...(await this.setupManyChat(lead)) };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getLeadById(id: string): Promise<any> {
    try {
      const result = await this.dynamo.context
        .get({
          TableName: 'lead',
          Key: { phone: id },
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
          TableName: 'lead',
        })
        .promise();
      return result.Items;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async setupManyChat(lead: Lead) {
    const body = {
      first_name: lead.name.split(' ')[0],
      last_name: lead.name.split(' ').slice(1).join(' '),
      phone: lead.phone,
      whatsapp_phone: lead.phone,
      email: lead.email,
      gender: 'string',
      has_opt_in_sms: true,
      has_opt_in_email: true,
      consent_phrase: 'string',
    };

    const response = await fetch(
      process.env.MANY_CHAT_URL + 'createSubscriber',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MANY_CHAT_TOKEN}`,
        },
        body: JSON.stringify(body),
      },
    )
      .then((res) => res.json())
      .catch((err) => err);

    if (
      (response.status == 'error' || response instanceof Error) &&
      !response?.details?.messages?.whatsapp_phone?.message?.includes(
        'WhatsApp subscriber with this phone number already exists',
      )
    ) {
      throw new BadRequestException(response);
    }

    const responseTag = await this.authorizeLead(response.data.id);

    return { response, responseTag };
  }

  private async authorizeLead(subscriber_id: string) {
    return await fetch(`${process.env.MANY_CHAT_URL}addTag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MANY_CHAT_TOKEN}`,
      },
      body: JSON.stringify({
        tag_id: '45440271',
        subscriber_id: subscriber_id,
      }),
    })
      .then((res) => res.json())
      .catch((err) => err);
  }
}
