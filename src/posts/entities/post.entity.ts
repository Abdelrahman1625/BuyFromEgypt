import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

export interface PostTs {
  postId: string;
  title: string;
  content: string;
  user: {
    userId: string;
    name: string;
  };
  products: {
    productId: string;
    name: string;
    description: string | null;
    price: number;
    owner: {
      userId: string;
      name: string;
    };
  }[];
  images: {
    url: string;
    id: string;
    postId: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  // comments: Comment[];
  // likes: PostLike[];
}
