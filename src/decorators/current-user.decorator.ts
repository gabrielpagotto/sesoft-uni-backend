import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        return request.user; // Dependendo de como você armazenou o usuário na requisição após a autenticação
    },
);
