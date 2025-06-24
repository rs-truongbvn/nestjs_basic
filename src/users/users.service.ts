import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };
  async create(createUserDto: CreateUserDto, creator: IUser) {
    const hashPassword = this.getHashPassword(createUserDto.password);
    let user = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
      createdBy: {
        _id: creator._id,
        email: creator.email,
      },
    });
    return {
      _id: user._id,
      createdAt: user.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    // if (isEmpty(sort)) {
    //   // @ts-ignore: Unreachable code error
    //   sort = "-updatedAt"
    // }

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select('-password')
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'not found user';
    return this.userModel
      .findOne({
        _id: id,
      })
      .select('-password')
      .populate({ path: 'role', select: { _id: 1, name: 1 } });
  }

  findOneByUsername(username: string) {
    return this.userModel
      .findOne({
        email: username,
      })
      .populate({ path: 'role', select: { name: 1 } });
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async update(updateUserDto: UpdateUserDto, updater: IUser) {
    if (!mongoose.Types.ObjectId.isValid(updateUserDto._id))
      return 'not found user';
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: updater._id,
          email: updater.email,
        },
      },
    );
  }

  async remove(id: string, deleter: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'not found user';
    const foundUser = await this.userModel.findById(id);
    if (foundUser.email === 'admin@gmail.com') {
      throw new BadRequestException(
        'Không thể xóa tài khoản Admin - admin@gmail.com',
      );
    }
    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: deleter._id,
          email: deleter.email,
        },
      },
    );
    return this.userModel.softDelete({
      _id: id,
    });
  }

  updateRefreshToken = async (refresh_token: string, _id: string) => {
    return await this.userModel.updateOne({ _id }, { refresh_token });
  };

  findUserByToken = async (refresh_token: string) => {
    return await this.userModel
      .findOne({ refresh_token })
      .populate({ path: 'role', select: { name: 1 } });
  };
}
