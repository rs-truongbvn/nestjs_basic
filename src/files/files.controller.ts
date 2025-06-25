import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  ParseFilePipeBuilder,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { extname } from 'path';
const allowedExtensions = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.pdf',
  '.txt',
  '.doc',
  '.docx',
];
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ResponseMessage('Uploaded file')
  @Post('upload')
  @UseInterceptors(FileInterceptor('fileUpload'))
  uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    const fileExt = extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(fileExt)) {
      throw new BadRequestException(`Unsupported file type ${fileExt}`);
    }

    if (file.size > 1024 * 1024) {
      throw new BadRequestException(`File too large`);
    }

    console.log(file);
    return { fileName: file.filename };
  }

  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(+id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.remove(+id);
  }
}
