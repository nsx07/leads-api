import { BadRequestException } from '@nestjs/common';

export class Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: Date;
  updated_at: Date;

  static Validate(dto: any) {
    if (!dto.name || !dto.email || !dto.phone) {
      throw new BadRequestException(
        'Missing required fields. Required fields are: name, email, phone, message',
      );
    }
  }

  static cleanAndValidatePhone(phone: string) {
    let phoneClean = phone.replace(/\D/g, '');

    let i = 0;
    while (phoneClean[i] === '0') {
      i++;
    }

    phoneClean = phoneClean.slice(i);
    
    if (phoneClean.length === 11) {
      return `55${phoneClean}`;
    } else {
      throw new BadRequestException('Invalid phone');
    }
  }
}
