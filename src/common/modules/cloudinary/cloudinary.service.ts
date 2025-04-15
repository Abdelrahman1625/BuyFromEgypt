import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File, folder: string) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result?.secure_url,
          id: result?.public_id,
        });
      });

      uploadStream.end(file.buffer);
    });
  }

  async uploadImages(files: Express.Multer.File[], folder: string) {
    return Promise.all(files.map((file) => this.uploadImage(file, folder)));
  }

  async deleteFolder(folder: string): Promise<void> {
    await cloudinary.api.delete_resources_by_prefix(folder);
    await cloudinary.api.delete_folder(folder);
  }

  async deleteImage(publicId:string): Promise<void> {
    console.log(publicId);
    await cloudinary.uploader.destroy(publicId);
  }
}
