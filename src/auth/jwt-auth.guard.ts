import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/decorator/customize';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    // You can throw an exception based on either "info" or "err" arguments
    const request: Request = context.switchToHttp().getRequest();

    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          'Token không hợp lệ or không truyền Bearer Token vào trong Header Request!',
        )
      );
    }

    //check permissions
    const targetMethod = request.method;
    const targetEndPoint = request.route?.path;

    const permissions = user?.permissions ?? [];
    const isExist = permissions.find(
      (permission) =>
        targetMethod === permission.method &&
        targetEndPoint === permission.apiPath,
    );
    if (!isExist) {
      throw new ForbiddenException('Bạn không có quyền truy cập endpoint này!');
    }

    return user;
  }
}
