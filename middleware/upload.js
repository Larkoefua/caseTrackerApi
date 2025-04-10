import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate Cloudinary credentials
if (!process.env.CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Missing Cloudinary credentials in environment variables');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    // Determine resource type based on file extension
    const fileExt = file.originalname.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png'].includes(fileExt);
    const isDocument = ['pdf', 'doc', 'docx'].includes(fileExt);

    return {
      folder: 'case-tracker',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
      resource_type: isImage ? 'image' : 'raw',
      use_filename: true,
      unique_filename: true,
      format: fileExt
    };
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Get file extension
  const fileExt = file.originalname.split('.').pop().toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
  
  if (allowedExtensions.includes(fileExt)) {
    console.log('File accepted:', {
      filename: file.originalname,
      extension: fileExt
    });
    cb(null, true);
  } else {
    console.log('File rejected:', {
      filename: file.originalname,
      extension: fileExt
    });
    cb(new Error(`Invalid file type. Allowed extensions are: ${allowedExtensions.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export { cloudinary, upload };