'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Memoize the mobile nav links to prevent unnecessary re-renders
const NavLink = memo(({ 
  href, 
  isActive, 
  children,
  onClick
}: { 
  href: string; 
  isActive: boolean; 
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={cn(
      "flex items-center p-3 rounded-lg transition-colors",
      isActive
        ? "bg-primary-50 text-primary-700 font-medium"
        : "hover:bg-gray-50 text-gray-700"
    )}
  >
    {children}
  </Link>
));

NavLink.displayName = 'NavLink';

function MobileNav() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // Close nav when path changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle sign out with useCallback
  const handleSignOut = useCallback(async () => {
    await signOut();
    setIsOpen(false);
  }, [signOut]);

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[350px] pr-0">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-primary-600">AI Tutor</SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col space-y-4 pr-6">
            <nav className="flex-1">
              <ul className="space-y-2">
                <li>
                  <NavLink 
                    href="/" 
                    isActive={pathname === '/'} 
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Home
                  </NavLink>
                </li>

                {user ? (
                  <>
                    <li>
                      <NavLink 
                        href="/dashboard" 
                        isActive={pathname === '/dashboard'} 
                        onClick={() => setIsOpen(false)}
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Dashboard
                      </NavLink>
                    </li>
                    <li>
                      <NavLink 
                        href="/subjects" 
                        isActive={pathname === '/subjects'} 
                        onClick={() => setIsOpen(false)}
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Subjects
                      </NavLink>
                    </li>
                    <li>
                      <NavLink 
                        href="/profile" 
                        isActive={pathname === '/profile'} 
                        onClick={() => setIsOpen(false)}
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </NavLink>
                    </li>
                    <li>
                      <NavLink 
                        href="/notifications" 
                        isActive={pathname === '/notifications'} 
                        onClick={() => setIsOpen(false)}
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Notifications
                      </NavLink>
                    </li>
                    <li className="mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-50 w-full text-left"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <NavLink 
                        href="/auth/login" 
                        isActive={pathname === '/auth/login'} 
                        onClick={() => setIsOpen(false)}
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Login
                      </NavLink>
                    </li>
                    <li>
                      <NavLink 
                        href="/auth/register" 
                        isActive={pathname === '/auth/register'} 
                        onClick={() => setIsOpen(false)}
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Register
                      </NavLink>
                    </li>
                    <li>
                      <NavLink 
                        href="/about" 
                        isActive={pathname === '/about'} 
                        onClick={() => setIsOpen(false)}
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        About
                      </NavLink>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Export as memoized component to prevent unnecessary re-renders
export default memo(MobileNav); 