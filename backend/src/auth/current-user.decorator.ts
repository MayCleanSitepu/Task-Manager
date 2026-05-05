import { createParamDecorator, ExecutionContext } from "@nestjs/common"

export const CurrentUser = createParamDecorator(
    (data:unknown, c: ExecutionContext) => {
        const req = c.switchToHttp().getRequest();
        return req.user
    }
)