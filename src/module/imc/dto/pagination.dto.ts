import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PaginationDto {
    @IsOptional()
    @IsBoolean()
    @ApiProperty({
        description: 'Definir si el orden es descendente, sino es ascendente',
        example: 'true',
        default: true,
    })
    esDescendente: boolean = true;

    @IsInt()
    @Min(0, { message: 'El valor mínimo de skip es 0' })
    @Type(() => Number)
    @ApiProperty({
        description: 'Número de registros a omitir',
        example: 0,
        default: 0,
    })
    skip: number = 0;

    @IsInt()
    @Min(1, { message: 'El valor mínimo de take es 1' })
    @Type(() => Number)
    @ApiProperty({
        description: 'Número de registros a retornar',
        example: 10,
        default: 10,
    })
    take: number = 10;
}
