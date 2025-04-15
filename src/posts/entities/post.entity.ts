export class PostEntity {
  id: string;
  title: string;
  content: string;
  status: string;
  createdAt: Date;
  userId: string;
  images?: string[];
  products?: string[];
  comments?: any[];
  likes?: any[];
}
