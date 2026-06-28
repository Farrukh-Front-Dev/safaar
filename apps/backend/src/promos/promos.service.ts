import { Injectable } from '@nestjs/common';

@Injectable()
export class PromosService {
  validate(body: Record<string, unknown>) {
    const code = String(body.code ?? '').toUpperCase();
    const valid = code === 'UZBRON10';
    return {
      code,
      valid,
      discount_type: valid ? 'percent' : null,
      discount_value: valid ? 10 : 0,
    };
  }
}
