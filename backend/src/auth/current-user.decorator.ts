import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: unknown, c: ExecutionContext): Record<string, unknown> | undefined => {
    const req = c
      .switchToHttp()
      .getRequest<Request & { user?: Record<string, unknown> }>();
    return req.user;
  },
);
