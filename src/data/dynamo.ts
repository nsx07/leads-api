import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

declare const process: any;

@Injectable()
export class Dynamo {
  context: any;

  constructor() {
    this.context = this.getContext();
  }

  private getContext() {
    if (process.env.IS_OFFLINE) {
      const { region, accessKeyId, secretAccessKey } = process.env;
      return new AWS.DynamoDB.DocumentClient({
        region: region,
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      });
    }
    return new AWS.DynamoDB.DocumentClient();
  }
}
