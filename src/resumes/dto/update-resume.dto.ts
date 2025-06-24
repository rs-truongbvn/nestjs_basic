import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateResumeDto } from './create-resume.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateResumeDto extends OmitType(CreateResumeDto, [
  'url',
  'jobId',
  'companyId',
] as const) {
  @IsNotEmpty({ message: 'Status không được trống!' })
  status: string;
}
