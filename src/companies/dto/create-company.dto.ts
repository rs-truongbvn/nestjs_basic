import { IsNotEmpty } from 'class-validator';

// data transfer object
export class CreateCompanyDto {
  @IsNotEmpty({ message: 'Name không được trống!' })
  name: string;

  @IsNotEmpty({ message: 'Address không được trống!' })
  address: string;

  @IsNotEmpty({ message: 'Description không được trống!' })
  description: string;
}
