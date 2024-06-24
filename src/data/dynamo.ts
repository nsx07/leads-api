import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class Dynamo {
  context: any;

  constructor() {
    this.context = this.getContext();
  }

  private getContext() {
    // if (process.env.IS_OFFLINE === 'true') {
    //   return new AWS.DynamoDB.DocumentClient({
    //     region: 'localhost',
    //     endpoint: process.env.DYNAMODB_ENDPOINT,
    //   });
    // } else {
    return new AWS.DynamoDB.DocumentClient();
    // }
  }
}
