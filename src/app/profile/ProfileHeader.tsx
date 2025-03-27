'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserProfile, uploadProfilePhoto } from '@/lib/user-profile';
import { Button } from '@/components/ui/button';

interface ProfileHeaderProps {
  profile: UserProfile;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Default placeholder image if no profile photo
  const avatarUrl = profile.photoURL || 'https://via.placeholder.com/150';
  
  // Reset error message after 5 seconds
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };
  
  // Handle file selection and upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Clear any previous errors
    setError(null);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showError('File size must be less than 2MB');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Use a mock progress interval since we can't directly access progress from the library function
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      // Upload the file
      const result = await uploadProfilePhoto(profile.uid, file);
      
      // Cleanup and finish
      clearInterval(progressInterval);
      
      if (!result) {
        setUploadProgress(0);
        showError('Upload failed. Please try again later.');
        return;
      }
      
      setUploadProgress(100);
      
      // Refresh the page to see the new photo after a short delay
      setTimeout(() => window.location.reload(), 1000);
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      
      // Handle CORS errors specifically
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('CORS') || errorMessage.includes('network')) {
        showError('Network error: CORS issue detected. Please try again later.');
      } else {
        showError('Error uploading photo. Please try again.');
      }
      
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6 relative">
      <div className="flex flex-col md:flex-row items-center">
        {/* Profile Image */}
        <div className="relative mb-4 md:mb-0 md:mr-6">
          <div className="w-32 h-32 rounded-full overflow-hidden relative">
            <Image
              src={avatarUrl}
              alt={profile.displayName || 'User profile'}
              width={128}
              height={128}
              className="object-cover w-full h-full"
              priority
            />
            
            {/* Upload progress overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="w-3/4 bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Photo upload button */}
          <label className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow cursor-pointer border border-gray-200 hover:bg-gray-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={isUploading}
            />
          </label>
          
          {/* Error message */}
          {error && (
            <div className="absolute -bottom-10 left-0 right-0 bg-red-50 text-red-600 p-2 text-xs rounded shadow">
              {error}
            </div>
          )}
        </div>
        
        {/* User Info */}
        <div>
          <h1 className="text-2xl font-bold">{profile.displayName || 'User Profile'}</h1>
          <p className="text-gray-600">{profile.email}</p>
          
          {profile.bio && (
            <p className="mt-2 text-gray-700">{profile.bio}</p>
          )}
        </div>
      </div>
      
      {/* Navigation button back to dashboard */}
      <div className="absolute top-4 right-4">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
} 