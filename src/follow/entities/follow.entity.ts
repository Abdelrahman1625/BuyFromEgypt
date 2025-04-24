import { User } from '../../users/entities/user.entity';

export class Follow {
  id: string;
  follower: User;
  following: User;
  createdAt: Date;
}
