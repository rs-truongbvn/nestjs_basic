import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './users.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ResponseMessage('Create a new User')
  @Post()
  create(@Body() createUserDto: CreateUserDto, @User() creator: IUser) {
    return this.usersService.create(createUserDto, creator);
  }

  @ResponseMessage('Fetch user with paginate')
  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @ResponseMessage('Fetch user by id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ResponseMessage('Update a User')
  @Patch()
  update(@Body() updateUserDto: UpdateUserDto, @User() updater: IUser) {
    return this.usersService.update(updateUserDto, updater);
  }

  @ResponseMessage('Delete a User')
  @Delete(':id')
  remove(@Param('id') id: string, @User() deleter: IUser) {
    return this.usersService.remove(id, deleter);
  }
}
