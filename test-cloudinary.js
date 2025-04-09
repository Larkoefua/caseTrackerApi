import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test the connection
async function testCloudinary() {
  try {
    console.log('Testing Cloudinary connection...');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    
    // Try to list resources to verify connection
    const result = await cloudinary.api.resources({
      max_results: 1
    });
    
    console.log('Connection successful!');
    console.log('Account details:', {
      resources: result.resources.length,
      rate_limit_remaining: result.rate_limit_remaining
    });
  } catch (error) {
    console.error('Connection failed:', error.message);
    console.error('Error details:', {
      name: error.name,
      status: error.http_status,
      message: error.message
    });
  }
}

testCloudinary(); 