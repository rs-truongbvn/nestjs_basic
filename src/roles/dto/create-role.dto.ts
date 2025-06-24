import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'Name không được trống!' })
  name: string;

  @IsNotEmpty({ message: 'description không được trống!' })
  description: string;

  @IsNotEmpty({ message: 'isActive không được trống!' })
  @IsBoolean({ message: 'isActive có giá trị boolean!' })
  isActive: boolean;

  @IsNotEmpty({ message: 'Permissions không được trống!' })
  @IsMongoId({ each: true, message: 'each permissions là mongo object id!' })
  @IsArray({ message: 'Permissions có định dạng là array!' })
  permissions: mongoose.Schema.Types.ObjectId[];
}
