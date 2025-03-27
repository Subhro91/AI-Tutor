'use client';

import Link from 'next/link';
import { useAuth } from '@/app/providers';

export default function NavLinks() {
  const { user, loading } = useAuth();
  
  // Don't render anything during loading
  if (loading) {
    return null;
  }
  
  // If logged in, show authenticated links
  if (user) {
    return (
      <>
        <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors">
          Dashboard
        </Link>
        <Link href="/subjects/math" className="text-gray-700 hover:text-primary-600 transition-colors">
          Subjects
        </Link>
        <Link href="/profile" className="text-gray-700 hover:text-primary-600 transition-colors">
          Profile
        </Link>
      </>
    );
  }
  
  // If not logged in, show public links
  return (
    <>
      <Link href="/auth/login" className="text-gray-700 hover:text-primary-600 transition-colors">
        Login
      </Link>
      <Link href="/auth/register" className="text-gray-700 hover:text-primary-600 transition-colors">
        Register
      </Link>
      <Link href="/about" className="text-gray-700 hover:text-primary-600 transition-colors">
        About
      </Link>
    </>
  );
} 