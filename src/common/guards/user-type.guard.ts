import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_TYPE_KEY } from '../decorators/user-type.decorator';

@Injectable()
export class UserTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Please log in first.');
    }

    const requiredUserTypes = this.reflector.get<string[]>(USER_TYPE_KEY, context.getHandler());

    if (!requiredUserTypes.includes(user.type)) {
      throw new ForbiddenException(`User type '${user.type}' is not authorized for this resource. ` + `Required types: ${requiredUserTypes.join(', ')}`);
    }
    return true;
  }
}
