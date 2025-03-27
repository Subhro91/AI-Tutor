'use client';

import Link from 'next/link';
import { useAuth } from '@/app/providers';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Footer() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t py-8">
      <div className="container mx-auto px-5">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="text-xl font-bold text-primary-600">
              AI Tutor
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              Personalized learning for everyone
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-8 space-y-2 md:space-y-0 items-center">
            <Link 
              href="/" 
              className={cn(
                buttonVariants({ variant: "link" }),
                "text-gray-600 hover:text-primary-600 p-0 h-auto"
              )}
            >
              Home
            </Link>
            
            {!user ? (
              <Link 
                href="/auth/login" 
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "text-gray-600 hover:text-primary-600 p-0 h-auto"
                )}
              >
                Login
              </Link>
            ) : (
              <Link 
                href="/dashboard" 
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "text-gray-600 hover:text-primary-600 p-0 h-auto"
                )}
              >
                Dashboard
              </Link>
            )}
            
            <Link 
              href="/help" 
              className={cn(
                buttonVariants({ variant: "link" }),
                "text-gray-600 hover:text-primary-600 p-0 h-auto"
              )}
            >
              Help
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t text-center text-gray-500 text-sm">
          &copy; {currentYear} AI Tutor. All rights reserved.
        </div>
      </div>
    </footer>
  );
} 