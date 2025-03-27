'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { getUserProfile, UserProfile } from '@/lib/user-profile';
import ProfileForm from './ProfileForm';
import ProfileHeader from './ProfileHeader';
import LearningGoals from './LearningGoals';
import NotificationSettings from './NotificationSettings';
import { Card, CardContent } from '@/components/ui/card';
import ContentLoader from '@/components/ContentLoader';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'goals' | 'notifications'>('profile');

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Fetch user profile data
  useEffect(() => {
    async function loadUserProfile() {
      if (!user) return;

      try {
        setIsLoading(true);
        const userProfile = await getUserProfile(user.uid);
        
        if (userProfile) {
          setProfile(userProfile);
        } else {
          // If profile doesn't exist yet, create a basic one from auth info
          const basicProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            preferences: {
              notifications: true,
              emailUpdates: true
            },
            learningGoals: {
              dailyGoalMinutes: 30,
              weeklyGoalDays: 5,
              focusSubjects: []
            }
          };
          setProfile(basicProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" text="Loading your profile..." />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <ContentLoader type="profile" className="mb-6" />
          <div className="my-6">
            <ContentLoader type="text" count={1} />
          </div>
          <Card>
            <CardContent className="p-6">
              <ContentLoader type="text" count={3} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {profile && (
          <>
            <ProfileHeader profile={profile} />
            
            {/* Tabs navigation */}
            <div className="flex border-b mb-6">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'profile' 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                Profile Information
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'goals' 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('goals')}
              >
                Learning Goals
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'notifications' 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('notifications')}
              >
                Notifications
              </button>
            </div>
            
            {/* Tab content */}
            <Card>
              <CardContent className="p-6">
                {activeTab === 'profile' && (
                  <ProfileForm profile={profile} setProfile={setProfile} />
                )}
                
                {activeTab === 'goals' && (
                  <LearningGoals 
                    userId={profile.uid} 
                    initialGoals={profile.learningGoals || {
                      dailyGoalMinutes: 30,
                      weeklyGoalDays: 5,
                      focusSubjects: []
                    }}
                    setProfile={setProfile}
                  />
                )}
                
                {activeTab === 'notifications' && (
                  <NotificationSettings 
                    userId={profile.uid}
                    initialPreferences={profile.preferences || {
                      notifications: true,
                      emailUpdates: true
                    }}
                    setProfile={setProfile}
                  />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
} 