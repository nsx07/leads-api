import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Dynamo } from 'src/data/dynamo';
import { v4 as uuid } from 'uuid';

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

    const { email, phone } = lead;

    const validEmail = await this.checkField('email', email);

    if (validEmail) {
      throw new BadRequestException('Email already exists');
    }

    const validPhone = await this.checkField('phone', phone);

    if (validPhone) {
      throw new BadRequestException('Phone already exists');
    }

    try {
      await this.dynamo.context
        .put({
          TableName: process.env.LeadS_TABLE_NAME,
          Item: lead,
        })
        .promise();
      return lead;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getLeadById(id: string): Promise<any> {
    try {
      const result = await this.dynamo.context
        .get({
          TableName: process.env.LeadS_TABLE_NAME,
          Key: { id },
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
          TableName: process.env.LeadS_TABLE_NAME,
        })
        .promise();
      return result.Items;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async checkField(field, value) {
    const params = {
      TableName: process.env.LeadS_TABLE_NAME,
      IndexName: `${field}_index`,
      KeyConditionExpression: `#${field} = :${field}`,
      ExpressionAttributeNames: {
        ['#' + field]: field,
      },
      ExpressionAttributeValues: {
        [':' + field]: value,
      },
    };

    try {
      const data = await this.dynamo.context.query(params).promise();
      return data.Items;
    } catch (err) {
      console.error('Error querying DynamoDB:', err);
      throw err;
    }
  }
}
