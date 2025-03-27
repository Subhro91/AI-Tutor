'use client';

import { createNotification } from './firebase-db';
import { UserProfile } from './user-profile';

/**
 * Generate a streak notification for the user
 */
export async function notifyStreak(userId: string, streakDays: number): Promise<boolean> {
  try {
    // Only notify on significant streaks (3, 5, 7, 10, 15, etc.)
    const significantStreaks = [3, 5, 7, 10, 15, 21, 30, 50, 100, 365];
    if (!significantStreaks.includes(streakDays)) {
      return false;
    }
    
    await createNotification({
      userId,
      title: `${streakDays} Day Streak!`,
      message: `Congratulations! You've maintained a ${streakDays}-day learning streak. Keep up the great work!`,
      type: 'streak',
    });
    
    return true;
  } catch (error) {
    console.error('Error creating streak notification:', error);
    return false;
  }
}

/**
 * Generate a notification when user completes a topic
 */
export async function notifyTopicCompletion(userId: string, subjectName: string, topicName: string): Promise<boolean> {
  try {
    await createNotification({
      userId,
      title: `Topic Completed!`,
      message: `You've completed the "${topicName}" topic in ${subjectName}. Keep learning to master this subject!`,
      type: 'milestone',
      link: `/subjects/${subjectName.toLowerCase()}`
    });
    
    return true;
  } catch (error) {
    console.error('Error creating topic completion notification:', error);
    return false;
  }
}

/**
 * Generate a notification when a new achievement is unlocked
 */
export async function notifyAchievement(userId: string, achievementName: string, description: string): Promise<boolean> {
  try {
    await createNotification({
      userId,
      title: `Achievement Unlocked: ${achievementName}`,
      message: description,
      type: 'achievement'
    });
    
    return true;
  } catch (error) {
    console.error('Error creating achievement notification:', error);
    return false;
  }
}

/**
 * Generate a weekly progress summary notification
 */
export async function notifyWeeklySummary(userId: string, stats: {
  messagesCount: number,
  topicsCompleted: number,
  minutesStudied: number
}): Promise<boolean> {
  try {
    const { messagesCount, topicsCompleted, minutesStudied } = stats;
    
    await createNotification({
      userId,
      title: 'Your Weekly Learning Summary',
      message: `This week you exchanged ${messagesCount} messages, completed ${topicsCompleted} topics, and studied for ${minutesStudied} minutes.`,
      type: 'summary'
    });
    
    return true;
  } catch (error) {
    console.error('Error creating weekly summary notification:', error);
    return false;
  }
}

/**
 * Send email notification (for now, this would just log that an email would be sent)
 * In a production app, this would integrate with a service like SendGrid, Mailchimp, etc.
 */
export async function sendEmailNotification(userProfile: UserProfile, subject: string, body: string): Promise<boolean> {
  try {
    // Check if user has email notifications enabled
    if (userProfile.preferences?.emailUpdates === false || !userProfile.email) {
      return false;
    }
    
    // In a real app, this would connect to an email service
    console.log(`[EMAIL SERVICE] Would send email to ${userProfile.email}:`, { subject, body });
    
    // For demonstration, we'll just return true
    // In a real app, you would await the email service response
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
} 