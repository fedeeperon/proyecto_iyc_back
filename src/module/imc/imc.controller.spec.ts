import { Test, TestingModule } from '@nestjs/testing';
import { ImcController } from './imc.controller';
import { ImcService } from './imc.service';
import { CalcularImcDto } from './dto/calcular-imc.dto';
import {
    BadRequestException,
    ExecutionContext,
    ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    imc: [],
};

const mockAuthGuard = {
    canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = mockUser;
        return true;
    },
};

describe('ImcController', () => {
    let controller: ImcController;
    let service: ImcService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ImcController],
            providers: [
                {
                    provide: ImcService,
                    useValue: {
                        calcularImc: jest.fn(),
                    },
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue(mockAuthGuard)
            .compile();

        controller = module.get<ImcController>(ImcController);
        service = module.get<ImcService>(ImcService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return IMC and category for valid input', async () => {
        const dto: CalcularImcDto = { altura: 1.75, peso: 70 };
        jest.spyOn(service, 'calcularImc').mockResolvedValue({
            imc: 22.86,
            categoria: 'Normal',
        } as any);

        const result = await controller.calcular(dto, {
            user: mockUser,
        } as any);
        expect(result).toEqual({ imc: 22.86, categoria: 'Normal' });
        expect(service.calcularImc).toHaveBeenCalledWith(dto, mockUser);
    });

    it('should throw BadRequestException for invalid input', async () => {
        const invalidDto: CalcularImcDto = { altura: -1, peso: 70 };

        // Aplicar ValidationPipe manualmente en la prueba
        const validationPipe = new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        });

        await expect(
            validationPipe.transform(invalidDto, {
                type: 'body',
                metatype: CalcularImcDto,
            }),
        ).rejects.toThrow(BadRequestException);

        // Verificar que el servicio no se llama porque la validación falla antes
        expect(service.calcularImc).not.toHaveBeenCalled();
    });
});
