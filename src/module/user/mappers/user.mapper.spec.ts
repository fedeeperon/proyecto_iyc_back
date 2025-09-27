import 'reflect-metadata';
import { UserMapper } from './user.mapper';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UserMapper', () => {
    it('should map UserEntity to CreateImcDto correctly', () => {
        const entity = new User();
        entity.email = 'mail@gmail.com';
        entity.password = 'hashedPassword';

        const dto = UserMapper.fromCreateDto(entity);
        expect(dto.email).toBe(entity.email);
        expect(dto.password).toBe(entity.password);
    });

    it('should map user email to UpdateUserDto', () => {
        const entity1 = new User();
        entity1.email = 'mail1@gmail.com';

        const dto = UserMapper.fromUpdateDto(entity1);
        expect(dto.email).toBe(entity1.email);
    });

    it('should map user password to UpdateUserDto', () => {
        const entity2 = new User();
        entity2.password = 'hashedPassword2';

        const dto = UserMapper.fromUpdateDto(entity2);
        expect(dto.password).toBe(entity2.password);
    });

    it('should map user email and password to UpdateUserDto', () => {
        const entity3 = new User();
        entity3.email = 'mail3@gmail.com';
        entity3.password = 'hashedPassword3';

        const dto = UserMapper.fromUpdateDto(entity3);
        expect(dto.email).toBe(entity3.email);
        expect(dto.password).toBe(entity3.password);
    });

    it('should map UserEntity to response object without password', () => {
        const entity = new User();
        entity.email = 'mail4@gmail.com';
        entity.password = 'hashedPassword4';

        const response = UserMapper.toResponse(entity);

        expect(response).toHaveProperty('email', entity.email);
        expect(response).not.toHaveProperty('password');
    });
});
