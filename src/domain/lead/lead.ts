import { BadRequestException } from '@nestjs/common';

export class Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: Date;
  updated_at: Date;

  static Validate(dto: any) {
    if (!dto.name || !dto.email || !dto.phone || !dto.message) {
      throw new BadRequestException(
        'Missing required fields. Required fields are: name, email, phone, message',
      );
    }
  }
}
