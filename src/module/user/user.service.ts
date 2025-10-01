import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from './repository/user-repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ObjectId } from 'mongodb';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  // Cambiar de `number` a `string | ObjectId`
  async findById(id: string | ObjectId) {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return this.userRepository.findById(objectId);
  }

  async findAll() {
    return this.userRepository.findAll();
  }

  async create(dto: CreateUserDto) {
    return this.userRepository.createUser(dto);
  }

  // Cambiar de `number` a `string | ObjectId`
  async update(id: ObjectId, dto: UpdateUserDto) {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
  
    const updateData = { ...dto };
  
    console.log('ID recibido en updateUser:', id);

    return this.userRepository.updateUser(objectId, updateData);
  }
  
}
