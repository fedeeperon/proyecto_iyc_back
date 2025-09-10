import { Categoria } from '../enum/categoria-column.enum';

export class ImcDto {
    id: number;

    peso: number;

    altura: number;

    imc: number;

    categoria: Categoria;

    fecha: Date;
}
