import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImcModule } from './module/imc/imc.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImcEntity } from './module/imc/entities/imc.entity';
import * as dotenv from 'dotenv';
import { UserModule } from './module/user/user.module';
import { AuthModule } from './module/auth/auth.module';
import { User } from './module/user/entities/user.entity';

dotenv.config(); 

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.MONGO_URI,   
      synchronize: true,            
      entities: [ImcEntity, User],  
      extra: {
        useUnifiedTopology: true, 
      },    
    }),
    ImcModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}