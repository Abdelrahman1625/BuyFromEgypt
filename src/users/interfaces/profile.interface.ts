import { User, SocialMedia } from '@prisma/client';

export type ProfileResponse = User & {
  socialMedia: SocialMedia | null;
};
