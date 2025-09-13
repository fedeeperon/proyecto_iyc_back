import { Test, TestingModule } from '@nestjs/testing';
import { ImcRepository } from './imc.repository';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ImcEntity } from '../entities/imc.entity';
import { CreateImcDto } from '../dto/create-imc.dto';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
});

describe('ImcRepository', () => {
  let repository: ImcRepository;
  let repo: ReturnType<typeof mockRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImcRepository,
        {
          provide: getRepositoryToken(ImcEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<ImcRepository>(ImcRepository);
    repo = module.get(getRepositoryToken(ImcEntity));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createAndSave', () => {
    it('should create and save an ImcEntity', async () => {
      const fecha = new Date();
      const dto: CreateImcDto = { peso: 70, altura: 1.75, imc: 22.86, categoria: 'Normal', fecha };
      const entity = new ImcEntity();
      entity.id = 1;
      entity.peso = dto.peso;
      entity.altura = dto.altura;
      entity.imc = dto.imc;
      entity.categoria = dto.categoria;
          entity.fecha = fecha;
      repo.create.mockReturnValue(entity);
      repo.save.mockResolvedValue(entity);
      const result = await repository.createAndSave(dto);
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });

    it('should throw InternalServerErrorException on error', async () => {
      repo.create.mockImplementation(() => { throw new Error('fail'); });
      const dto: CreateImcDto = { peso: 70, altura: 1.75, imc: 22.86, categoria: 'Normal', fecha: new Date() };
      await expect(repository.createAndSave(dto)).rejects.toThrow('No se pudo crear el registro IMC');
    });
  });

  describe('find', () => {
    it('should return entities in DESC order', async () => {
      const entity = new ImcEntity();
      entity.id = 1;
      entity.peso = 70;
      entity.altura = 1.75;
      entity.imc = 22.86;
      entity.categoria = 'Normal';
      entity.fecha = new Date();
      const entities: ImcEntity[] = [entity];
      repo.find.mockResolvedValue(entities);
      const result = await repository.find(true, 0, 10);
      expect(repo.find).toHaveBeenCalledWith({ order: { fecha: 'DESC' }, skip: 0, take: 10 });
      expect(result).toEqual(entities);
        });
        it('should return entities in ASC order', async () => {
      const entity = new ImcEntity();
      entity.id = 1;
      entity.peso = 70;
      entity.altura = 1.75;
      entity.imc = 22.86;
      entity.categoria = 'Normal';
      entity.fecha = new Date();
      const entities: ImcEntity[] = [entity];
      repo.find.mockResolvedValue(entities);
      const result = await repository.find(false, 0, 10);
      expect(repo.find).toHaveBeenCalledWith({ order: { fecha: 'ASC' }, skip: 0, take: 10 });
      expect(result).toEqual(entities);
    });
    it('should throw InternalServerErrorException on error', async () => {
      repo.find.mockRejectedValue(new Error('fail'));
      await expect(repository.find(true, 0, 10)).rejects.toThrow('No se pudo obtener el historial de IMC');
    });
  });
});
