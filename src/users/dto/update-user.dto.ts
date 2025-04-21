import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserForAdminDto extends PartialType(CreateUserDto) {}
