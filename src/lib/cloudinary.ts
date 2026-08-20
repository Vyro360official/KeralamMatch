import { v2 as cloudinary } from "cloudinary";

// If CLOUDINARY_URL is present, v2 automatically picks up the configuration keys
if (!process.env.CLOUDINARY_URL) {
  console.warn("CLOUDINARY_URL is not set in environment variables. Uploads may fail.");
}

export { cloudinary };
