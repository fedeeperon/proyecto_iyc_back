import { Test, TestingModule } from '@nestjs/testing';
import { ImcService } from './imc.service';
import { CalcularImcDto } from './dto/calcular-imc.dto';

describe('ImcService', () => {

    describe('calcularImc error handling', () => {
        it('should log and throw if repository fails', async () => {
            const spyLogger = jest.spyOn(service['logger'], 'error');
            mockImcRepository.createAndSave.mockRejectedValue(new Error('fail'));
            const dto: CalcularImcDto = { altura: 1.75, peso: 70 };
            await expect(service.calcularImc(dto)).rejects.toThrow('No se pudo crear el registro IMC');
            expect(spyLogger).toHaveBeenCalledWith(
                expect.stringContaining('Error al crear el registro IMC: fail'),
                expect.anything()
            );
        });
    });

    describe('getHistorial', () => {
        it('should return mapped historial in DESC order', async () => {
            const mockEntities = [
                { id: 1, peso: 70, altura: 1.75, imc: 22.86, categoria: 'Normal', fecha: new Date('2023-01-01T00:00:00Z') },
                { id: 2, peso: 80, altura: 1.75, imc: 26.12, categoria: 'Sobrepeso', fecha: new Date('2023-01-02T00:00:00Z') },
            ];
            mockImcRepository.find.mockResolvedValue(mockEntities);
            const result = await service.getHistorial(true, 0, 2);
            expect(mockImcRepository.find).toHaveBeenCalledWith(true, 0, 2);
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(2);
            expect(result[0].peso).toBe(70);
            expect(result[1].categoria).toBe('Sobrepeso');
        });

        it('should return mapped historial in ASC order', async () => {
            const mockEntities = [
                { id: 1, peso: 60, altura: 1.7, imc: 20.76, categoria: 'Normal', fecha: new Date('2023-01-01T00:00:00Z') },
                { id: 2, peso: 90, altura: 1.8, imc: 27.78, categoria: 'Sobrepeso', fecha: new Date('2023-01-02T00:00:00Z') },
            ];
            mockImcRepository.find.mockResolvedValue(mockEntities);
            const result = await service.getHistorial(false, 0, 2);
            expect(mockImcRepository.find).toHaveBeenCalledWith(false, 0, 2);
            expect(result[0].peso).toBe(60);
            expect(result[1].imc).toBeCloseTo(27.78, 2);
        });

        it('should throw if repository throws', async () => {
            mockImcRepository.find.mockRejectedValue(new Error('fail'));
            await expect(service.getHistorial(true, 0, 2)).rejects.toThrow('No se pudo obtener el historial de IMC');
        });
    });
    let service: ImcService;
    let mockImcRepository: { createAndSave: jest.Mock; find: jest.Mock };

    beforeEach(async () => {
        mockImcRepository = {
            createAndSave: jest.fn(),
            find: jest.fn(),
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ImcService,
                {
                    provide: 'IImcRepository',
                    useValue: mockImcRepository,
                },
            ],
        }).compile();

        service = module.get<ImcService>(ImcService);

        mockImcRepository.createAndSave.mockImplementation((data) => Promise.resolve({
            id: 1,
            ...data,
        }));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    //PU-01
    it('should throw an error if altura tiene más de dos decimales (caso de validación específica)', async () => {
        const dto = { altura: 2.111, peso: 100 };
        await expect(service.calcularImc(dto as any)).rejects.toThrow();
    });
    
    //PU-02
    it('should throw an error if peso tiene más de dos decimales (caso de validación específica)', async () => {
        const dto = { altura: 2.1, peso: 100.555 };
        await expect(service.calcularImc(dto as any)).rejects.toThrow();
    });

    //PU-03
    it('should calculate IMC correctly', async () => {
        const dto: CalcularImcDto = { altura: 2.1, peso: 101 };
        const result = await service.calcularImc(dto);
        expect(result.imc).toBeCloseTo(22.90, 2);
        expect(result.categoria).toBe('Normal');
    });

    //PU-04

    //PU-05
    it('should throw an error if peso <=0 (caso de validación específica)', async () => {
        const dto = { altura: 1.77, peso: -100 };
        await expect(service.calcularImc(dto as any)).rejects.toThrow();
    });

    //PU-06
    it('should throw an error if altura <=0 (caso de validación específica)', async () => {
        const dto = { altura: -1.77, peso: 100 };
        await expect(service.calcularImc(dto as any)).rejects.toThrow();
    });

    it('should return Bajo Peso for IMC < 18.5', async () => {
        const dto: CalcularImcDto = { altura: 1.75, peso: 50 };
        const result = await service.calcularImc(dto);
        expect(result.imc).toBeCloseTo(16.33, 2);
        expect(result.categoria).toBe('Bajo Peso');
    });

    it('should return Sobrepeso for 25 <= IMC < 30', async () => {
        const dto: CalcularImcDto = { altura: 1.75, peso: 80 };
        const result = await service.calcularImc(dto);
        expect(result.imc).toBeCloseTo(26.12, 2);
        expect(result.categoria).toBe('Sobrepeso');
    });

    it('should return Obeso for IMC >= 30', async () => {
        const dto: CalcularImcDto = { altura: 1.75, peso: 100 };
        const result = await service.calcularImc(dto);
        expect(result.imc).toBeCloseTo(32.65, 2);
        expect(result.categoria).toBe('Obeso');
    });
});
