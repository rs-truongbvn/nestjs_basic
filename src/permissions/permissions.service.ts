import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,
  ) {}
  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    const isExistPermission = await this.permissionModel.findOne({
      apiPath: createPermissionDto.apiPath,
      method: createPermissionDto.method,
    });
    if (isExistPermission) {
      throw new BadRequestException('apiPath và method đã tồn tại!');
    }
    let permission = await this.permissionModel.create({
      ...createPermissionDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return {
      _id: permission._id,
      createdAt: permission.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    // if (isEmpty(sort)) {
    //   // @ts-ignore: Unreachable code error
    //   sort = "-updatedAt"
    // }

    const result = await this.permissionModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .select(projection as any)
      .sort(sort as any)
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

  async findOne(_id: string) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException('not found permission');
    return await this.permissionModel.findOne({ _id });
  }

  async update(
    _id: string,
    updatePermissionDto: UpdatePermissionDto,
    user: IUser,
  ) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException('not found permission');
    const isExistPermission = await this.permissionModel.findOne({
      _id: { $ne: _id },
      apiPath: updatePermissionDto.apiPath,
      method: updatePermissionDto.method,
    });
    if (isExistPermission) {
      throw new BadRequestException('apiPath và method đã tồn tại!');
    }

    return await this.permissionModel.updateOne(
      { _id },
      {
        ...updatePermissionDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  async remove(_id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException('not found permission');
    await this.permissionModel.updateOne(
      { _id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.permissionModel.softDelete({
      _id,
    });
  }
}
