'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from './providers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import PageWrapper from '@/components/PageWrapper';

export default function Home() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <PageWrapper>
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary-50 to-primary-100 py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="lg:w-1/2 lg:pr-8">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
                  Your Personal AI Tutor for Enhanced Learning
                </h1>
                <p className="text-lg md:text-xl text-gray-700 mb-6 md:mb-8">
                  Experience personalized education with our AI-powered tutoring system that adapts to your unique learning style and pace.
                </p>
                {!loading && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    {user ? (
                      <>
                        <Button 
                          onClick={() => router.push('/dashboard')} 
                          size="lg" 
                          className="font-medium"
                        >
                          Go to Dashboard
                        </Button>
                        <Button 
                          onClick={handleSignOut} 
                          variant="outline" 
                          size="lg" 
                          className="font-medium"
                        >
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          asChild 
                          size="lg" 
                          className="font-medium"
                        >
                          <Link href="/auth/register">Get Started</Link>
                        </Button>
                        <Button 
                          asChild 
                          variant="outline" 
                          size="lg" 
                          className="font-medium"
                        >
                          <Link href="/auth/login">Log In</Link>
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="lg:w-1/2 w-full md:max-w-md mx-auto">
                <div className="rounded-xl overflow-hidden shadow-lg bg-white">
                  <AspectRatio ratio={16 / 9} className="relative">
                    {!imageLoaded && !imageError && (
                      <Skeleton className="w-full h-full rounded-none" />
                    )}
                    {!imageError ? (
                      <picture>
                        <source 
                          srcSet="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?fm=webp&q=80&w=800"
                          type="image/webp" 
                        />
                        <source 
                          srcSet="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800" 
                          type="image/jpeg" 
                        />
                        <Image
                          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
                          alt="Students learning together"
                          fill
                          priority
                          sizes="(max-width: 768px) 100vw, 600px"
                          className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                          onLoad={() => setImageLoaded(true)}
                          onError={() => {
                            setImageError(true);
                            setImageLoaded(true);
                          }}
                        />
                      </picture>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-2" />
                        </svg>
                      </div>
                    )}
                  </AspectRatio>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 md:mb-12">Key Features</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Feature 1 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Personalized Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Adaptive learning paths tailored to your pace and learning style.
                  </p>
                </CardContent>
              </Card>
              
              {/* Feature 2 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Real-Time Assistance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Immediate help with academic questions through AI-powered chat.
                  </p>
                </CardContent>
              </Card>
              
              {/* Feature 3 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Progress Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Continuous assessment and feedback to guide your improvement.
                  </p>
                </CardContent>
              </Card>
              
              {/* Feature 4 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Content Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Personalized resources based on your interests and progress.
                  </p>
                </CardContent>
              </Card>
              
              {/* Feature 5 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Secure & Private</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Your learning data is protected with secure authentication.
                  </p>
                </CardContent>
              </Card>
              
              {/* Feature 6 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Multi-device Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Learn on any device, anytime, with seamless synchronization.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </PageWrapper>
  );
} 