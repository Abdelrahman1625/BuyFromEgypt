import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

export class Category {
  categoryId: string;
  name: string;
  description?: string | null;
  user?: User;
  products?: Product[];
}
