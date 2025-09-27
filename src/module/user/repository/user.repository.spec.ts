import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserMapper } from '../mappers/user.mapper';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';

const mockRepository = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
});

describe('UserRepository', () => {
    let repository: UserRepository;
    let repo: ReturnType<typeof mockRepository>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserRepository,
                {
                    provide: getRepositoryToken(User),
                    useFactory: mockRepository,
                },
            ],
        }).compile();

        repository = module.get<UserRepository>(UserRepository);
        repo = module.get(getRepositoryToken(User));
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('findByEmail', () => {
        it('should return a user by email', async () => {
            const user = new User();
            user.id = 1;
            user.email = 'test@mail.com';
            repo.findOne.mockResolvedValue(user);

            const result = await repository.findByEmail('test@mail.com');
            expect(repo.findOne).toHaveBeenCalledWith({
                where: { email: 'test@mail.com' },
            });
            expect(result).toEqual(user);
        });
    });

    describe('findById', () => {
        it('should return a user by id', async () => {
            const user = new User();
            user.id = 1;
            repo.findOne.mockResolvedValue(user);

            const result = await repository.findById(1);
            expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(result).toEqual(user);
        });
    });

    describe('findAll', () => {
        it('should return all users', async () => {
            const users = [new User(), new User()];
            repo.find.mockResolvedValue(users);

            const result = await repository.findAll();
            expect(repo.find).toHaveBeenCalled();
            expect(result).toEqual(users);
        });
    });

    describe('createUser', () => {
        it('should create and save a user with hashed password', async () => {
            const dto: CreateUserDto = {
                email: 'new@mail.com',
                password: '123456',
            };
            const partial = { ...dto };
            const hashedPassword = 'hashedPassword';

            jest.spyOn(UserMapper, 'fromCreateDto').mockReturnValue(
                partial as any,
            );
            jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);

            const entity = new User();
            entity.id = 1;
            entity.email = dto.email;
            entity.password = hashedPassword;

            repo.create.mockReturnValue(entity);
            repo.save.mockResolvedValue(entity);

            const result = await repository.createUser(dto);

            expect(UserMapper.fromCreateDto).toHaveBeenCalledWith(dto);
            expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
            expect(repo.create).toHaveBeenCalledWith({
                ...partial,
                password: hashedPassword,
            });
            expect(repo.save).toHaveBeenCalledWith(entity);
            expect(result).toEqual(entity);
        });
    });

    describe('updateUser', () => {
        it('should update user fields without password', async () => {
            const user = new User();
            user.id = 1;
            user.email = 'old@mail.com';

            const dto: UpdateUserDto = { email: 'new@gmail.com' };
            const partial = { email: 'new@gmail.com' };

            repo.findOne.mockResolvedValue(user);
            jest.spyOn(UserMapper, 'fromUpdateDto').mockReturnValue(
                partial as any,
            );

            const updatedUser = { ...user, ...partial };
            repo.save.mockResolvedValue(updatedUser);

            const result = await repository.updateUser(1, dto);

            expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(UserMapper.fromUpdateDto).toHaveBeenCalledWith(dto);
            expect(repo.save).toHaveBeenCalledWith(updatedUser);
            expect(result).toEqual(updatedUser);
        });

        it('should update user with new password (hashed)', async () => {
            const user = new User();
            user.id = 1;
            user.password = 'oldPass';

            const dto: UpdateUserDto = { password: 'newPass' };
            const partial = { password: 'newPass' };

            repo.findOne.mockResolvedValue(user);
            jest.spyOn(UserMapper, 'fromUpdateDto').mockReturnValue(
                partial as any,
            );
            jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedNewPass');

            const updatedUser = { ...user, password: 'hashedNewPass' };
            repo.save.mockResolvedValue(updatedUser);

            const result = await repository.updateUser(1, dto);

            expect(bcrypt.hash).toHaveBeenCalledWith('newPass', 10);
            expect(repo.save).toHaveBeenCalledWith(updatedUser);
            expect(result.password).toBe('hashedNewPass');
        });

        it('should throw NotFoundException if user not found', async () => {
            repo.findOne.mockResolvedValue(null);
            const dto: UpdateUserDto = { email: 'fail' };

            await expect(repository.updateUser(1, dto)).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
