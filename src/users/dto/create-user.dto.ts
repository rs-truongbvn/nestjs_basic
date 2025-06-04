import { IsEmail, IsNotEmpty } from 'class-validator';

// data transfer object
export class CreateUserDto {
  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  @IsNotEmpty({ message: 'Email không được trống!' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được trống!' })
  password: string;
  name: string;
  phone: string;
  age: number;
  address: string;
}
