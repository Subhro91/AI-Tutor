import { ref, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload a file to Firebase Storage with proper CORS handling
 * @param path Storage path where the file should be stored
 * @param file File to upload
 * @param progressCallback Optional callback for upload progress
 * @returns Promise with download URL or null on failure
 */
export async function uploadFileWithCORS(
  path: string,
  file: File,
  progressCallback?: (progress: number) => void
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    try {
      // Create storage reference
      const storageRef = ref(storage, path);
      
      // Set proper metadata with content type for CORS
      const metadata = {
        contentType: file.type,
        customMetadata: {
          'origin': typeof window !== 'undefined' ? window.location.origin : 'server',
          'uploadedAt': new Date().toISOString()
        }
      };
      
      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      
      // Track retries
      let retries = 0;
      const maxRetries = 3;
      
      // Handle task state changes
      const handleUpload = (task: UploadTask) => {
        task.on(
          'state_changed',
          (snapshot) => {
            // Calculate and report progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (progressCallback) {
              progressCallback(progress);
            }
          },
          (error) => {
            console.error('Upload failed:', error);
            
            // Retry on error with exponential backoff
            if (retries < maxRetries) {
              retries++;
              const delay = Math.pow(2, retries) * 1000; // Exponential backoff
              console.log(`Retrying upload (${retries}/${maxRetries}) in ${delay}ms...`);
              
              setTimeout(() => {
                // Create a new upload task and retry
                const newTask = uploadBytesResumable(storageRef, file, metadata);
                handleUpload(newTask);
              }, delay);
            } else {
              // Max retries reached
              console.error('Max retries reached, giving up');
              reject(error);
            }
          },
          async () => {
            try {
              // Upload completed successfully
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              console.error('Error getting download URL:', error);
              reject(error);
            }
          }
        );
      };
      
      // Start the upload process
      handleUpload(uploadTask);
      
    } catch (error) {
      console.error('Error setting up upload:', error);
      reject(error);
    }
  });
}

/**
 * Create a file blob from a base64 string (useful for testing uploads)
 */
export function base64ToFile(base64String: string, filename: string, mimeType: string): File {
  // Convert base64 to blob
  const byteString = atob(base64String.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  const blob = new Blob([ab], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
} 