import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

export interface PostTs {
  postId: string;
  title: string;
  content: string;
  user: User;
  products: Product[];
  // comments: Comment[];
  // likes: PostLike[];
  // images: PostImage[];
}