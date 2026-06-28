import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

interface ApiEnvelope<T> {
  success: true;
  data: T;
  meta: {
    request_id: string;
  };
}

function requestIdFromContext(context: ExecutionContext): string {
  const request = context
    .switchToHttp()
    .getRequest<{ headers: Record<string, string | string[] | undefined> }>();
  const header = request.headers['x-request-id'];
  return Array.isArray(header) ? header[0] : (header ?? 'local-request');
}

function isAlreadyEnveloped(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    ('data' in value || 'error' in value)
  );
}

@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor<
  T,
  T | ApiEnvelope<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<T | ApiEnvelope<T>> {
    return next.handle().pipe(
      map((data) => {
        if (isAlreadyEnveloped(data)) {
          return data;
        }

        return {
          success: true,
          data,
          meta: {
            request_id: requestIdFromContext(context),
          },
        };
      }),
    );
  }
}
