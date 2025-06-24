import { IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateResumeDto {
  @IsNotEmpty({ message: 'Url không được trống!' })
  url: string;

  @IsMongoId({ message: 'Id công ty phải là mongo id' })
  @IsNotEmpty({ message: 'Id công ty không được trống!' })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsMongoId({ message: 'Id job phải là mongo id' })
  @IsNotEmpty({ message: 'Id job không được trống!' })
  jobId: mongoose.Schema.Types.ObjectId;
}
