import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

// data transfer object
class Company {
  @IsNotEmpty({ message: 'Id công ty không được trống!' })
  _id: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'Tên công ty không được trống!' })
  name: string;
}
export class CreateUserDto {
  @IsNotEmpty({ message: 'Tên không được trống!' })
  name: string;

  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  @IsNotEmpty({ message: 'Email không được trống!' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được trống!' })
  password: string;

  @IsNotEmpty({ message: 'Tuổi không được trống!' })
  age: number;

  @IsNotEmpty({ message: 'Giới tính không được trống!' })
  gender: string;

  @IsNotEmpty({ message: 'Địa chỉ không được trống!' })
  address: string;

  @IsNotEmpty({ message: 'Role không được trống!' })
  role: string;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;
}

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Tên không được trống!' })
  name: string;

  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  @IsNotEmpty({ message: 'Email không được trống!' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được trống!' })
  password: string;

  @IsNotEmpty({ message: 'Tuổi không được trống!' })
  age: number;

  @IsNotEmpty({ message: 'Giới tính không được trống!' })
  gender: string;

  @IsNotEmpty({ message: 'Địa chỉ không được trống!' })
  address: string;
}
