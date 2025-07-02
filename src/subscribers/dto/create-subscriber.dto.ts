import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateSubscriberDto {
  @IsNotEmpty({ message: 'email không được để trống' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'name không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'skill không được để trống' })
  @IsArray({ message: 'skill là array' })
  @IsString({ each: true, message: 'skill định dạng là string' })
  skills: string[];
}
