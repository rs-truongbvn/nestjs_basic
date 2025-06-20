import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
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
export class CreateJobDto {
  @IsNotEmpty({ message: 'Tên không được trống!' })
  name: string;

  @IsArray({ message: 'Skills phải là 1 mảng' })
  @ArrayNotEmpty({ message: 'Skills không được để trống!' })
  @IsString({ each: true, message: 'Mỗi skill phải là chuỗi' })
  skills: string[];

  @IsNotEmpty({ message: 'Lương không được trống!' })
  salary: number;

  @IsNotEmpty({ message: 'Số lượng tuyển không được trống!' })
  quantity: number;

  @IsNotEmpty({ message: 'Level không được trống!' })
  level: string;

  @IsNotEmpty({ message: 'Mô tả job không được trống!' })
  description: string;

  @IsDate({ message: 'Định dạng ngày bắt đầu không đúng' })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được trống!' })
  @Type(() => Date)
  startDate: Date;

  @IsDate({ message: 'Định dạng ngày kết thúc không đúng' })
  @IsNotEmpty({ message: 'Ngày kết thúc không được trống!' })
  @Type(() => Date)
  endDate: Date;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;
}
