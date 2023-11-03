import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const { page, rel, limit } = request.query;

    return {
      page: page ? parseInt(page as string) : undefined,
      rel: rel === 'asc' || rel === 'dec' ? rel : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    };
  },
);
