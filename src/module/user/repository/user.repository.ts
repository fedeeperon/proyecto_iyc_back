import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../entities/user.entity';
import { IUserRepository } from './user-repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserMapper } from '../mappers/user.mapper';
import { ObjectId } from 'mongodb';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly ormRepo: MongoRepository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.ormRepo.findOne({ where: { email } });
  }

  async findById(id: ObjectId): Promise<User | null> {
    return this.ormRepo.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.ormRepo.find();
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const partial = UserMapper.fromCreateDto(dto);

    if (!partial.password) {
      throw new Error('La contraseña es obligatoria para crear un usuario');
    }

    const hashedPassword = await bcrypt.hash(partial.password, 10);

    const entity = this.ormRepo.create({
      ...partial,
      password: hashedPassword,
    });

    return this.ormRepo.save(entity);
  }

  async updateUser(id: ObjectId, dto: UpdateUserDto): Promise<User> {
    console.log('Buscando usuario con ObjectId:', id.toHexString());
    const user = await this.ormRepo.findOne({
      where: { _id: id },});
    console.log('Resultado de búsqueda:', user);
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    const partial = UserMapper.fromUpdateDto(dto);

    if (partial.password) {
      partial.password = await bcrypt.hash(partial.password, 10);
    }

    Object.assign(user, partial);
    return this.ormRepo.save(user);
  }
}