import { Product } from './product.entity';

export class ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  productId: string;
  product?: Product;
}
