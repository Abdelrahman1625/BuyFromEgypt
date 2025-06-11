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
import { CommentLikesService } from 'src/comment-likes/comment-likes.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private commentLikesService: CommentLikesService
  ) {}
  @Get('admin')
  @Roles(`${RoleEnum.ADMIN}`)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Get all users' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found any Users' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal Server Error' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiResponse({ status: HttpStatus.OK, description: 'User retrieved successfully By Admin' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'This is allowed only for admin' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal Server Error' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Please login and try again' })
  async getUserById(@Param('id') userId: string) {
    return this.usersService.getUser(userId);
  }

  @ApiBody({ type: CreateUserDto })
  @Roles(`${RoleEnum.ADMIN}`)
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'This allow only for admin' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal Server Error' })
  @Post('admin')
  create(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return this.usersService.createUser(createUserDto);
  }

  @Put('profile')
  @UseGuards(AuthGuard)
  @Roles(`${RoleEnum.ADMIN}`, `${RoleEnum.USER}`)
  @ApiResponse({ status: HttpStatus.OK, description: 'User updated successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal Server Error' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Please Login and try again' })
  async updateUser(@Req() req: Request & { user: { userId: string } }, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(req.user.userId, updateUserDto);
  }

  @Put('admin/:id')
  @Roles(`${RoleEnum.ADMIN}`)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBody({ type: UpdateUserForAdminDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'User updated successfully By Admin' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'This allow only for admin' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal Server Error' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Please Login and try again' })
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
  @Roles(`${RoleEnum.ADMIN}`)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiResponse({ status: HttpStatus.OK, description: 'User deleted successfully By Admin' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'This allow only for admin' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User with this ID not found' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal Server Error' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Please Login and try again' })
  async delete(@Param('id') userId: string) {
    return this.usersService.deleteUser(userId);
  }
}
