import { IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty({ message: 'Name không được trống!' })
  name: string;

  @IsNotEmpty({ message: 'apiPath không được trống!' })
  apiPath: string;

  @IsNotEmpty({ message: 'Method không được trống!' })
  method: string;

  @IsNotEmpty({ message: 'Module không được trống!' })
  module: string;
}
