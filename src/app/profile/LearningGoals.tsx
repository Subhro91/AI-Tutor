'use client';

import { useState } from 'react';
import { UserProfile, updateLearningGoals } from '@/lib/user-profile';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { subjects } from '@/lib/subjects-data';

interface LearningGoalsProps {
  userId: string;
  initialGoals?: UserProfile['learningGoals'];
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

export default function LearningGoals({ 
  userId, 
  initialGoals, 
  setProfile 
}: LearningGoalsProps) {
  const [goals, setGoals] = useState({
    dailyGoalMinutes: initialGoals?.dailyGoalMinutes || 30,
    weeklyGoalDays: initialGoals?.weeklyGoalDays || 5,
    focusSubjects: initialGoals?.focusSubjects || []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setGoals(prev => ({
      ...prev,
      dailyGoalMinutes: Math.max(0, Math.min(240, value)) // Limit to 0-240 minutes
    }));
  };
  
  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setGoals(prev => ({
      ...prev,
      weeklyGoalDays: Math.max(0, Math.min(7, value)) // Limit to 0-7 days
    }));
  };
  
  const handleSubjectToggle = (subjectId: string) => {
    setGoals(prev => {
      const focusSubjects = [...prev.focusSubjects];
      
      if (focusSubjects.includes(subjectId)) {
        // Remove subject if already selected
        const index = focusSubjects.indexOf(subjectId);
        focusSubjects.splice(index, 1);
      } else {
        // Add subject if not already selected
        focusSubjects.push(subjectId);
      }
      
      return {
        ...prev,
        focusSubjects
      };
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // Update learning goals in Firestore
      const success = await updateLearningGoals(userId, goals);
      
      if (success) {
        // Update local state
        setProfile(prev => prev ? { 
          ...prev, 
          learningGoals: goals 
        } : null);
        
        setSuccessMessage('Learning goals updated successfully!');
        
        // Clear success message after a delay
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setErrorMessage('Failed to update learning goals. Please try again.');
      }
    } catch (error) {
      console.error('Error updating learning goals:', error);
      setErrorMessage('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Learning Goals</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            Set your learning goals to help us personalize your learning experience.
          </p>
        </div>
        
        {/* Daily Time Goal */}
        <div className="space-y-2">
          <Label htmlFor="dailyGoalMinutes" className="text-gray-900 dark:text-gray-100">Daily Study Goal (minutes)</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="dailyGoalMinutes"
              type="number"
              min="0"
              max="240"
              value={goals.dailyGoalMinutes}
              onChange={handleMinutesChange}
              className="w-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <span className="text-gray-500 dark:text-gray-400">minutes per day</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Recommended: 15-60 minutes</p>
        </div>
        
        {/* Weekly Days Goal */}
        <div className="space-y-2">
          <Label htmlFor="weeklyGoalDays" className="text-gray-900 dark:text-gray-100">Weekly Frequency (days)</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="weeklyGoalDays"
              type="number"
              min="0"
              max="7"
              value={goals.weeklyGoalDays}
              onChange={handleDaysChange}
              className="w-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <span className="text-gray-500 dark:text-gray-400">days per week</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Recommended: 3-7 days</p>
        </div>
        
        {/* Focus Subjects */}
        <div className="space-y-2">
          <Label className="text-gray-900 dark:text-gray-100">Focus Subjects</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {subjects.map(subject => (
              <div 
                key={subject.id}
                className={`border rounded-md p-3 cursor-pointer transition-colors ${
                  goals.focusSubjects.includes(subject.id)
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => handleSubjectToggle(subject.id)}
              >
                <div className="flex items-center">
                  <div 
                    className={`w-4 h-4 rounded-full mr-2 flex-shrink-0 ${
                      goals.focusSubjects.includes(subject.id)
                        ? 'bg-primary-500'
                        : 'border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {goals.focusSubjects.includes(subject.id) && (
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: subject.color }}>
                      {subject.name}
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      {subject.description.substring(0, 50)}
                      {subject.description.length > 50 ? '...' : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Select subjects you want to focus on</p>
        </div>
        
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            {errorMessage}
          </div>
        )}
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Goals'}
          </Button>
        </div>
      </div>
    </form>
  );
} 