import { Injectable, OnModuleInit } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryConstants } from '../../constants/cloudinary.constants';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  constructor() {
    this.validateConfig();
  }

  onModuleInit() {
    this.validateConfig();
  }

  private validateConfig() {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = cloudinaryConstants;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
    }

    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File, folder: string) {
    if (!file || !file.buffer) {
      throw new Error('Invalid file: File or file buffer is missing');
    }

    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              if (error.http_code === 401) {
                reject(new Error('Cloudinary authentication failed. Please check your credentials.'));
              } else if (error.http_code === 403) {
                reject(new Error('Cloudinary access denied. Please check your permissions.'));
              } else {
                reject(new Error(`Failed to upload image: ${error.message}`));
              }
              return;
            }
            if (!result) {
              reject(new Error('No result returned from Cloudinary upload'));
              return;
            }
            resolve({
              url: result.secure_url,
              id: result.public_id,
            });
          }
        );

        uploadStream.end(file.buffer);
      });
    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async uploadImages(files: Express.Multer.File[], folder: string) {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error('Invalid files: No files provided or invalid file array');
    }

    try {
      const uploadPromises = files.map((file) => this.uploadImage(file, folder));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error in uploadImages:', error);
      throw new Error(`Failed to upload images: ${error.message}`);
    }
  }

  async deleteFolder(folder: string): Promise<void> {
    if (!folder) {
      console.log('No folder specified for deletion');
      return;
    }

    try {
      // First, try to delete all resources in the folder
      try {
        const result = await cloudinary.api.delete_resources_by_prefix(folder);
        console.log('Deleted resources result:', result);
      } catch (resourcesError: any) {
        // If resources don't exist, that's fine
        if (resourcesError.http_code === 404) {
          console.log('No resources found in folder:', folder);
        } else {
          throw resourcesError;
        }
      }

      // Then, try to delete the folder itself
      try {
        await cloudinary.api.delete_folder(folder);
        console.log('Successfully deleted folder:', folder);
      } catch (folderError: any) {
        // If folder doesn't exist (404), that's fine
        if (folderError.http_code === 404) {
          console.log('Folder already deleted or does not exist:', folder);
          return;
        }
        throw folderError;
      }
    } catch (error: any) {
      console.error('Error in deleteFolder:', error);

      // Handle specific Cloudinary errors
      if (error.http_code === 401) {
        throw new Error('Cloudinary authentication failed. Please check your credentials.');
      }

      if (error.http_code === 403) {
        throw new Error('Cloudinary access denied. Please check your permissions.');
      }

      // For 404 errors, we consider it a success since the folder is already gone
      if (error.http_code === 404) {
        console.log('Folder or resources not found:', folder);
        return;
      }

      throw new Error(`Failed to delete folder from Cloudinary: ${error.message || 'Unknown error'}`);
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) {
      console.log('No public ID specified for deletion');
      return;
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log('Deleted image result:', result);

      if (result.result !== 'ok') {
        throw new Error(`Failed to delete image: ${result.result}`);
      }
    } catch (error: any) {
      console.error('Error in deleteImage:', error);

      if (error.http_code === 404) {
        console.log('Image not found:', publicId);
        return;
      }

      throw new Error(`Failed to delete image: ${error.message || 'Unknown error'}`);
    }
  }
}
