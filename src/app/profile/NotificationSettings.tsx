'use client';

import { useState } from 'react';
import { UserProfile, updateNotificationPreferences } from '@/lib/user-profile';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface NotificationSettingsProps {
  userId: string;
  initialPreferences?: UserProfile['preferences'];
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

export default function NotificationSettings({ 
  userId, 
  initialPreferences,
  setProfile 
}: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState({
    notifications: initialPreferences?.notifications !== false, // Default to true
    emailUpdates: initialPreferences?.emailUpdates !== false // Default to true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleToggle = (setting: 'notifications' | 'emailUpdates') => {
    setPreferences(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // Update notification preferences in Firestore
      const success = await updateNotificationPreferences(userId, preferences);
      
      if (success) {
        // Update local state
        setProfile(prev => prev ? { 
          ...prev, 
          preferences 
        } : null);
        
        setSuccessMessage('Notification settings updated successfully!');
        
        // Clear success message after a delay
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setErrorMessage('Failed to update notification settings. Please try again.');
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setErrorMessage('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
          <p className="text-gray-600 text-sm mb-6">
            Manage how you receive notifications and updates from AI Tutor.
          </p>
        </div>
        
        {/* Toggle switches for preferences */}
        <div className="space-y-4">
          {/* In-app notifications */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">In-app Notifications</Label>
              <p className="text-sm text-gray-600">
                Receive notifications about your progress and achievements
              </p>
            </div>
            
            <button
              type="button"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                preferences.notifications ? 'bg-primary-600' : 'bg-gray-200'
              }`}
              onClick={() => handleToggle('notifications')}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {/* Email updates */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Email Updates</Label>
              <p className="text-sm text-gray-600">
                Receive weekly summaries and important updates via email
              </p>
            </div>
            
            <button
              type="button"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                preferences.emailUpdates ? 'bg-primary-600' : 'bg-gray-200'
              }`}
              onClick={() => handleToggle('emailUpdates')}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.emailUpdates ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        
        {/* Additional information */}
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">Notification Types</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Learning streak reminders</li>
            <li>New achievements unlocked</li>
            <li>Subject completion milestones</li>
            <li>Weekly progress summaries</li>
            <li>New content and feature updates</li>
          </ul>
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
          >
            {isSubmitting ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </form>
  );
} 