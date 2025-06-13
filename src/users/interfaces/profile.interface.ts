import { User, SocialMedia } from '@prisma/client';

export interface ProfileResponse {
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  country: string;
  age: number;
  type: User['type'];
  profileImage: string | null;
  about: string | null;
  registrationNumber: string | null;
  industrySector: string | null;
  commercial: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
  socialMedia: SocialMedia | null;
}
