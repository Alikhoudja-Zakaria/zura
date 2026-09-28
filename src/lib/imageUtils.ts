/**
 * Image utilities for Zura
 * Compresses images client-side and converts to base64 for Firestore storage.
 * Firestore docs have a 1MB limit, so we aggressively compress.
 */

const MAX_WIDTH = 600;
const MAX_HEIGHT = 800;
const JPEG_QUALITY = 0.5;
const MAX_FILE_SIZE = 300 * 1024; // 300KB target per image

/**
 * Compress and convert an image file to a base64 string.
 */
export async function compressImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Scale down maintaining aspect ratio
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height;
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try to compress to under MAX_FILE_SIZE
        let quality = JPEG_QUALITY;
        let base64 = canvas.toDataURL("image/jpeg", quality);

        // If still too large, reduce quality further
        while (base64.length > MAX_FILE_SIZE * 1.37 && quality > 0.1) {
          quality -= 0.1;
          base64 = canvas.toDataURL("image/jpeg", quality);
        }

        resolve(base64);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file before processing.
 */
export function validateImageFile(file: File): string | null {
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  if (!validTypes.includes(file.type)) {
    return "Please upload a JPEG, PNG, or WebP image.";
  }
  if (file.size > 10 * 1024 * 1024) {
    return "Image must be under 10MB.";
  }
  return null;
}
