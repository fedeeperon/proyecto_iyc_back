import { Controller, Get, UseGuards, Req, Patch, Param, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ObjectId } from 'mongodb';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    return this.userService.findByEmail(req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers() {
    
    const users= await this.userService.findAll();
    return users;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const objectId = new ObjectId(id);
    console.log('PATCH /users/:id');
    console.log('ID recibido:', id);

    return this.userService.update(objectId, dto);
  }
  

}
