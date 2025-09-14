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
    it('should throw an error if altura has more than 2 decimal places (PU-01)', async () => {
        const dto = { altura: 2.111, peso: 100 };
        await expect(service.calcularImc(dto as any)).rejects.toThrow();
    });
    
    //PU-02
    it('should throw an error if peso has more than 2 decimal places (PU-02)', async () => {
        const dto = { altura: 2.1, peso: 100.555 };
        await expect(service.calcularImc(dto as any)).rejects.toThrow();
    });

    //PU-03
    it('should calculate IMC correctly (PU-03)', async () => {
        const dto: CalcularImcDto = { altura: 2.1, peso: 101 };
        const result = await service.calcularImc(dto);
        expect(result.imc).toBeCloseTo(22.90, 2);
        expect(result.categoria).toBe('Normal');
    });

    //PU-04
    it('should throw an error if altura or peso are not numeric (PU-04)', async () => {
        const dto = { altura: 'abc', peso: '#$%' };
        await expect(service.calcularImc(dto as any)).rejects.toThrow();
    });

    //PU-05
    it('should throw an error if peso <=0 (PU-05)', async () => {
        const dto = { altura: 1.77, peso: -100 };
        await expect(service.calcularImc(dto as any)).rejects.toThrow();
    });

    //PU-06
    it('should throw an error if altura <=0 (PU-06)', async () => {
        const dto = { altura: -1.77, peso: 100 };
        await expect(service.calcularImc(dto as any)).rejects.toThrow();
    });

    //PU-07
    it('should throw an error if altura or peso are empty (PU-07)', async () => {
        const dto = { altura: '', peso: '' };
        await expect(service.calcularImc(dto as any)).rejects.toThrow();
    });

    //PU-08
    it('should throw an error if altura is 0 (PU-08)', async () => {
        const dto = { altura: 0, peso: 100 };
        await expect(service.calcularImc(dto as any)).rejects.toThrow();
    });

    //PU-09
    it('should throw an error if peso is 0 (PU-09)', async () => {
        const dto = { altura: 1.77, peso: 0 };
        await expect(service.calcularImc(dto as any)).rejects.toThrow();
    });


    //PU-10
    it('should throw an error if altura is 3 (PU-10)', async () => {
        const dto = { altura: 3, peso: 100 };
        await expect(service.calcularImc(dto as any)).rejects.toThrow();
    });


    //PU-11
    it('should throw an error if peso is 500 (PU-11)', async () => {
        const dto = { altura: 1.77, peso: 500 };
        await expect(service.calcularImc(dto as any)).rejects.toThrow();
    });

    //PU-12
    it('should return "Bajo Peso" if IMC < 18.5 (PU-12)', async () => {
        const dto: CalcularImcDto = { altura: 1.75, peso: 50 };
        const result = await service.calcularImc(dto);
        expect(result.imc).toBeLessThan(18.5);
        expect(result.categoria).toBe('Bajo Peso');
    });

    //PU-13
    it('should return "Normal" if 18.5 <= IMC <= 24.9 (PU-13)', async () => {
        const dto: CalcularImcDto = { altura: 1.75, peso: 75 };
        const result = await service.calcularImc(dto);
        expect(result.imc).toBeGreaterThanOrEqual(18.5);
        expect(result.imc).toBeLessThanOrEqual(24.9);
        expect(result.categoria).toBe('Normal');
    });

    //PU-14
    it('should return "Sobrepeso" if 25 <= IMC <= 29.9 (PU-14)', async () => {
        const dto: CalcularImcDto = { altura: 1.75, peso: 85 };
        const result = await service.calcularImc(dto);
        expect(result.imc).toBeGreaterThanOrEqual(25);
        expect(result.imc).toBeLessThanOrEqual(29.9);
        expect(result.categoria).toBe('Sobrepeso');
    });

    //PU-15
    it('should return "Obeso" if IMC >= 30 (PU-15)', async () => {
        const dto: CalcularImcDto = { altura: 1.75, peso: 100 };
        const result = await service.calcularImc(dto);
        expect(result.imc).toBeGreaterThanOrEqual(30);
        expect(result.categoria).toBe('Obeso');
    });

    //PU-16
    it('should record the IMC calculation in the history immediately with all the data', async () => {
        const dto: CalcularImcDto = { altura: 1.68, peso: 65 };
        const result = await service.calcularImc(dto);
        mockImcRepository.find.mockResolvedValue([
            {
                id: 1,
                altura: result.altura,
                peso: result.peso,
                imc: result.imc,
                categoria: result.categoria,
                fecha: result.fecha,
            } as any
        ]);
        const historial = await service.getHistorial(true, 0, 1);
        expect(Array.isArray(historial)).toBe(true);
        expect(historial.length).toBeGreaterThan(0);
        expect(historial[0]).toMatchObject({
            altura: 1.68,
            peso: 65,
            imc: 23.03,
            categoria: 'Normal',
        });
        expect(historial[0].fecha).toBeDefined();
    });

    //PU-17
    it('should filter historial by all categories (PU-17)', async () => {
        const mockHistorial = [
            { id: 1, altura: 1.7, peso: 50, imc: 17.3, categoria: 'Bajo Peso', fecha: new Date() },
            { id: 2, altura: 1.7, peso: 60, imc: 20.76, categoria: 'Normal', fecha: new Date() },
            { id: 3, altura: 1.7, peso: 80, imc: 27.68, categoria: 'Sobrepeso', fecha: new Date() },
            { id: 4, altura: 1.7, peso: 100, imc: 34.6, categoria: 'Obeso', fecha: new Date() },
        ];
        mockImcRepository.find.mockResolvedValue(mockHistorial);
        const historial = await service.getHistorial(true, 0, 10);

        // Todas
        expect(historial.length).toBe(4);

        // Bajo Peso
        const bajoPeso = historial.filter(item => item.categoria === 'Bajo Peso');
        expect(bajoPeso.length).toBe(1);
        expect(bajoPeso[0].categoria).toBe('Bajo Peso');

        // Normal
        const normal = historial.filter(item => item.categoria === 'Normal');
        expect(normal.length).toBe(1);
        expect(normal[0].categoria).toBe('Normal');

        // Sobrepeso
        const sobrepeso = historial.filter(item => item.categoria === 'Sobrepeso');
        expect(sobrepeso.length).toBe(1);
        expect(sobrepeso[0].categoria).toBe('Sobrepeso');

        // Obeso
        const obeso = historial.filter(item => item.categoria === 'Obeso');
        expect(obeso.length).toBe(1);
        expect(obeso[0].categoria).toBe('Obeso');
    });
});