import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(createUserDto: any): Promise<User> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async findAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findUserByAddress(address: string): Promise<User> {
    const user = await this.userModel.findOne({ address }).exec();
    if (!user) {
      throw new NotFoundException({ error: `User with address ${address} not found` });
    }
    return user;
  }

  async updateUser(address: string, updateUserDto: any): Promise<User> {
    const updatedUser = await this.userModel
      .findOneAndUpdate({ address }, updateUserDto, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException({ error: `User with address ${address} not found` });
    }
    return updatedUser;
  }

  async deleteUser(address: string): Promise<any> {
    const deletedUser = await this.userModel.findOneAndDelete({ address }).exec();
    if (!deletedUser) {
      throw new NotFoundException({ error: `User with address ${address} not found` });
    }
    return deletedUser;
  }
}
