'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Flame } from 'lucide-react';

interface StreakDisplayProps {
  streakCount: number;
}

export default function StreakDisplay({ streakCount }: StreakDisplayProps) {
  if (!streakCount || streakCount <= 0) {
    return null;
  }
  
  return (
    <Card className="mb-12 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-500 dark:bg-amber-600 flex items-center justify-center">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {streakCount === 1 ? 'First day!' : `${streakCount}-Day Streak!`}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {streakCount === 1 
                ? "You've started your learning journey! Come back tomorrow to build your streak."
                : streakCount < 5 
                  ? "You're building momentum! Keep learning daily to grow your streak."
                  : "Impressive dedication! Your consistency is key to mastery."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 