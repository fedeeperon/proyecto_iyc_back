import { ImcEntity } from '../entities/imc.entity';
import { ImcDto } from '../dto/imc.dto';

export class ImcMapper {
    static toDto(entity: ImcEntity): ImcDto {
        const dto = new ImcDto();
        dto.id = entity.id;
        dto.peso = Number(entity.peso);
        dto.altura = Number(entity.altura);
        dto.imc = Number(entity.imc);
        dto.categoria = entity.categoria; // ahora es del tipo Categoria correcto
        dto.fecha = entity.fecha;
        return dto;
    }

    static toDtoList(entities: ImcEntity[]): ImcDto[] {
        return entities.map(entity => this.toDto(entity));
    }
}
