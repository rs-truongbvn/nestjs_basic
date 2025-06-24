import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { genSaltSync, hashSync } from 'bcryptjs';
import { Response } from 'express';
import ms from 'ms';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { USER_ROLE } from 'src/databases/sample';
import { RolesService } from 'src/roles/roles.service';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private roleService: RolesService,
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user) {
      const isValid = this.usersService.isValidPassword(pass, user.password);
      if (isValid === true) {
        const userRole = user.role as unknown as { _id: string; name: string };
        const temp = await this.roleService.findOne(userRole._id);
        const objUser = {
          ...user.toObject(),
          permissions: temp?.permissions ?? [],
        };
        return objUser;
      }
    }

    return null;
  }

  async login(user: IUser, response: Response) {
    const { _id, name, email, role, permissions } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      role,
    };
    const refresh_token = this.createRefreshToken(payload);

    //update user with refresh token
    await this.usersService.updateRefreshToken(refresh_token, _id);

    // set cookies
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        name,
        email,
        role,
        permissions,
      },
    };
  }

  async logout(user: IUser, response: Response) {
    await this.usersService.updateRefreshToken('', user._id);
    // clear cookie
    response.clearCookie('refresh_token');
    return 'ok';
  }

  async register(registerUserDto: RegisterUserDto) {
    const email = registerUserDto.email;
    const isExist = await this.userModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(
        `Email ${email} đã tồn tại trên hệ thống! Vui lòng sử dụng email khác`,
      );
    }
    let hashpass = this.getHashPassword(registerUserDto.password);

    const userRole = await this.roleModel.findOne({ name: USER_ROLE });
    let user = await this.userModel.create({
      ...registerUserDto,
      password: hashpass,
      role: userRole?._id,
    });
    return {
      _id: user._id,
      createdAt: user.createdAt,
    };
  }

  createRefreshToken = (payload) => {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000,
    });
    return refresh_token;
  };

  processNewToken = async (refreshToken: string, response: Response) => {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
      let user = await this.usersService.findUserByToken(refreshToken);

      if (user) {
        const { _id, name, email, role } = user;
        const payload = {
          sub: 'token refresh',
          iss: 'from server',
          _id,
          name,
          email,
          role,
        };
        const refresh_token = this.createRefreshToken(payload);

        //update user with refresh token
        await this.usersService.updateRefreshToken(
          refresh_token,
          _id.toString(),
        );

        // fetch user role
        const userRole = user.role as unknown as { _id: string; name: string };
        const temp = await this.roleService.findOne(userRole._id);

        // clear cookie
        response.clearCookie('refresh_token');
        // set cookies
        response.cookie('refresh_token', refresh_token, {
          httpOnly: true,
          maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
        });

        return {
          access_token: this.jwtService.sign(payload),
          user: {
            _id,
            name,
            email,
            role,
            permissions: temp?.permissions ?? [],
          },
        };
      } else {
        throw new BadRequestException(
          'Refresh Token không hợp lệ. Vui lòng login',
        );
      }
    } catch (error) {
      throw new BadRequestException(
        'Refresh Token không hợp lệ. Vui lòng login',
      );
    }
  };
}
