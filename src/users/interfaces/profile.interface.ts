import { SocialMedia, RoleEnum, TypeEnum } from '@prisma/client';

export type ProfileResponse = {
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  country: string;
  age: number;
  type: TypeEnum;
  address: string | null;
  active: boolean;
  profileImage: string | null;
  about: string | null;
  role: RoleEnum;
  socialLinks: SocialMedia[];
  posts: {
    postId: string;
    title: string;
    content: string;
    createdAt: Date;
    images: {
      id: string;
      url: string;
    }[];
  }[];
  products: {
    productId: string;
    name: string;
    price: number;
    currencyCode: string;
    images: {
      id: string;
      url: string;
      isPrimary: boolean;
    }[];
  }[];
};
