import { Transform, Type } from 'class-transformer';
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    Min,
    Max,
} from 'class-validator';
import { Categoria } from '../enum/categoria-column.enum';

export class CreateImcDto {
    @Type(() => Number) // transforma el valor entrante a número
    @IsNumber({}, { message: 'El peso debe ser un número' })
    @IsNotEmpty({ message: 'El peso no puede estar vacío' })
    @Min(0.1, { message: 'El peso debe ser mayor que 0' })
    @Max(499.99, { message: 'El peso debe ser menor a 500 kg' })
    peso: number;

    @Type(() => Number)
    @IsNumber({}, { message: 'La altura debe ser un número' })
    @IsNotEmpty({ message: 'La altura no puede estar vacía' })
    @Min(0.1, { message: 'La altura mínima es 0.1 metros' })
    @Max(2.99, { message: 'La altura debe ser menor a 3 metros' })
    altura: number;

    @Type(() => Number)
    @IsNumber({}, { message: 'El IMC debe ser un número' })
    @IsNotEmpty({ message: 'El IMC no puede estar vacío' })
    @Min(10, { message: 'El IMC no puede ser menor que 10' }) //respeta  los límites mínimos de altura y peso
    @Max(99.999, { message: 'El IMC debe ser menor a 100' })
    imc: number;

    @IsEnum(Categoria, { message: 'La categoría debe ser un valor válido' })
    @IsNotEmpty({ message: 'La categoría no puede estar vacía' })
    categoria: Categoria;
}
