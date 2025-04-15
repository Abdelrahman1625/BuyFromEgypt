import { ProductImage } from './productImage.entity';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

export class Product {
  productId: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  currencyCode: string;
  active: boolean;
  rating?: number | null;
  reviewCount: number;
  owner?: User;
  category?: Category;
  approvedBy?: User;
  approvedAt?: Date | null;
  // certifications: Certification[];
  // orders: Order[];
  // posts: Post[];
  images?: ProductImage[];
  cloudFolder?: string | null
  createdAt: Date;
  updatedAt: Date;
}
