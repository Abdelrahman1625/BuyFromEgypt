import { Controller, Get, Post, Body, Put, UseGuards, Req, Param, Delete, Patch, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-userForAdmin.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleEnum, User } from '@prisma/client';
import { Request } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateUserForAdminDto } from './dto/update-user.dto';
import { PostLikesService } from 'src/post-likes/post-likes.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private postLikesService: PostLikesService
  ) {}
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiBody({ type: CreateUserDto })
  @Post()
  create(@Body() data: CreateUserDto) {
    console.log(data);
    return this.usersService.createUser(data);
  }

  @Put('profile')
  @UseGuards(AuthGuard)
  async updateUser(@Req() req: Request & { user: { userId: string } }, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(req.user.userId, updateUserDto);
  }

  @Put('admin/:id')
  @Roles(`${RoleEnum.ADMIN}`)
  @UseGuards(AuthGuard, RolesGuard)
  async updateUserForAdmin(@Param('id') userId: string, @Body() updateUserForAdminDto: UpdateUserForAdminDto) {
    return this.usersService.updateUser(userId, updateUserForAdminDto);
  }

  @Put('admin/approveUser/:id')
  @Roles(RoleEnum.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiResponse({ status: HttpStatus.OK, description: 'User approved successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'This allow only for admin' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'User already activated' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal Server Error' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Please Login and try again' })
  async approveUser(@Param('id') userId: string) {
    return this.usersService.toggleUserState(userId, 'approve');
  }
  
  @Put('admin/deactivateUser/:id')
  @Roles(RoleEnum.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiResponse({ status: HttpStatus.OK, description: 'User deactivated successfully' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'This allow only for admin' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'User already deactivated' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal Server Error' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Please Login and try again' })
  async deactivateUser(@Param('id') userId: string) {
    return this.usersService.toggleUserState(userId, 'deactivate');
  }

  @Delete('admin/:id')
  @UseGuards(AuthGuard)
  @Roles(`${RoleEnum.ADMIN}`)
  async delete(@Param('id') userId: string) {
    return this.usersService.deleteUser(userId);
  }
}
