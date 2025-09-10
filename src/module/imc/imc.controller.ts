import {
    Controller,
    Post,
    Body,
    ValidationPipe,
    Get,
    Query,
    Logger,
} from '@nestjs/common';
import { ImcService } from './imc.service';
import { CalcularImcDto } from './dto/calcular-imc.dto';
import { PaginationDto } from './dto/pagination.dto';

@Controller('imc')
export class ImcController {
    private readonly logger = new Logger('ImcController');
    constructor(private readonly imcService: ImcService) {}

    @Post('calcular')
    calcular(@Body(ValidationPipe) data: CalcularImcDto) {
        this.logger.debug(
            `Solicitud para calcular IMC con peso=${data.peso}, altura=${data.altura}`,
        );
        return this.imcService.calcularImc(data);
    }

    @Get('historial')
    getHistorial(@Query() query: PaginationDto) {
        const { esDescendente = true, skip = 0, take = 10 } = query;
        this.logger.debug(
            `Solicitud de historial: esDescendente=${esDescendente}, skip=${skip}, take=${take}`,
        );
        return this.imcService.getHistorial(esDescendente, skip, take);
    }
}
