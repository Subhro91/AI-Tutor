'use client';

import { useState } from 'react';
import { UserProfile, updateUserProfile, createUserProfile } from '@/lib/user-profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProfileFormProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

export default function ProfileForm({ profile, setProfile }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    displayName: profile.displayName || '',
    email: profile.email || '',
    bio: profile.bio || ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // Create updated profile object
      const updatedProfile: Partial<UserProfile> = {
        displayName: formData.displayName,
        bio: formData.bio
      };
      
      // Update or create profile in Firestore
      let success;
      if (profile.createdAt) {
        // Update existing profile
        success = await updateUserProfile(profile.uid, updatedProfile);
      } else {
        // Create new profile
        success = await createUserProfile({
          ...profile,
          ...updatedProfile
        });
      }
      
      if (success) {
        // Update local state
        setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
        setSuccessMessage('Profile updated successfully!');
        
        // Clear success message after a delay
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setErrorMessage('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <p className="text-gray-600 text-sm mb-6">
            Update your personal information and how others see you on the platform.
          </p>
        </div>
        
        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            placeholder="Your name"
            required
          />
        </div>
        
        {/* Email (Read Only) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            value={formData.email}
            readOnly
            disabled
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-500">Email cannot be changed</p>
        </div>
        
        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us a bit about yourself"
            className="form-input min-h-20"
            rows={4}
          />
          <p className="text-xs text-gray-500">Brief description for your profile</p>
        </div>
        
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {errorMessage}
          </div>
        )}
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="ml-3"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </form>
  );
} 