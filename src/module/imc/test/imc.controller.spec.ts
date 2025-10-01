import { Test, TestingModule } from '@nestjs/testing';
import { ImcController } from '../imc.controller';
import { ImcService } from '../imc.service';
import { CalcularImcDto } from '../dto/calcular-imc.dto';
import { ObjectId } from 'mongodb';
import { PaginationDto } from '../dto/pagination.dto';
import { BadRequestException } from '@nestjs/common';

describe('ImcController', () => {
  let controller: ImcController;
  let service: ImcService;
  let module: TestingModule;

  const mockUser = {
    id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: 'hashedpassword',
  };

  const mockRequest = {
    user: mockUser,
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [ImcController],
      providers: [
        {
          provide: ImcService,
          useValue: {
            calcularImc: jest.fn(),
            getHistorial: jest.fn(),
            getEstadisticas: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ImcController>(ImcController);
    service = module.get<ImcService>(ImcService);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('calcular', () => {
    it('should return IMC and category for valid input', async () => {
      const dto: CalcularImcDto = { altura: 1.75, peso: 70 };
      const expectedResult = {
        id: 'abc123',
        altura: 1.75,
        peso: 70,
        imc: 22.86,
        categoria: 'Normal',
        fecha: new Date(),
        };




      jest.spyOn(service, 'calcularImc').mockResolvedValue(expectedResult);

      const result = await controller.calcular(dto, mockRequest as any);

      expect(result).toEqual(expectedResult);
      expect(service.calcularImc).toHaveBeenCalledWith(dto, new ObjectId(mockUser.id));
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      const dto: CalcularImcDto = { altura: 1.75, peso: 70 };
      const badRequest = { user: { id: 'invalid-id', email: 'x' } };

      await expect(controller.calcular(dto, badRequest as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getHistorial', () => {
  it('should call getHistorial with correct parameters', async () => {
    const mockQuery: PaginationDto = { skip: 0, take: 10, esDescendente: true };
    const expectedResult = [
      {
        id: 'abc123',
        altura: 1.75,
        peso: 70,
        imc: 22.86,
        categoria: 'Normal',
        fecha: new Date(),
      },
    ];

    jest.spyOn(service, 'getHistorial').mockResolvedValue(expectedResult);

    const result = await controller.getHistorial(mockQuery, mockRequest as any);

    expect(result).toEqual(expectedResult);
    expect(service.getHistorial).toHaveBeenCalledWith(new ObjectId(mockUser.id), 0, 10, true);
  });
});

  describe('getEstadisticas', () => {
    it('should return statistics for valid user', async () => {
      const expectedStats = {
        imcMensual: [
            { mes: 'Enero', imc: 22.5 },
            { mes: 'Febrero', imc: 23.1 },
        ],
        variacionPeso: [
            { mes: 'Enero', peso: 70 },
            { mes: 'Febrero', peso: 72 },
        ],
        };


      jest.spyOn(service, 'getEstadisticas').mockResolvedValue(expectedStats);

      const result = await controller.getEstadisticas(mockRequest as any);

      expect(result).toEqual(expectedStats);
      expect(service.getEstadisticas).toHaveBeenCalledWith(new ObjectId(mockUser.id));
    });

    it('should throw BadRequestException if user is missing', async () => {
      const badRequest = { user: null };

      await expect(controller.getEstadisticas(badRequest as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      const badRequest = { user: { id: 'invalid-id', email: 'x' } };

      await expect(controller.getEstadisticas(badRequest as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('testAuth', () => {
    it('should return authentication info', async () => {
      const result = await controller.testAuth(mockRequest as any);

      expect(result).toEqual({
        message: 'Autenticación exitosa',
        user: mockUser,
        userId: mockUser.id,
        isValidObjectId: true,
      });
    });
  });
});