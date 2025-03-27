import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Script from 'next/script';
import { Suspense } from 'react';

// Import PageTransition component for loading animation
const PageTransition = dynamic(() => import('@/components/PageTransition'), { ssr: false });

// Load fonts with display:swap for better performance
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif']
});

// Import components with dynamic loading and named chunks for better caching
const MobileNav = dynamic(() => import(/* webpackChunkName: "mobile-nav" */ '@/components/MobileNav'), { 
  ssr: true,
  loading: () => (
    <button className="lg:hidden p-2 text-gray-400 rounded-lg bg-gray-100">
      <span className="w-6 h-6 block animate-pulse"></span>
    </button>
  )
});

const NotificationBell = dynamic(() => import(/* webpackChunkName: "notifications" */ '@/components/NotificationBell'), { 
  ssr: false, // Keep SSR disabled to prevent hydration mismatch
  loading: () => (
    <div className="w-10 h-10 flex items-center justify-center">
      <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
    </div>
  )
});

const NavLinks = dynamic(() => import(/* webpackChunkName: "nav-links" */ '@/components/NavLinks'), { 
  ssr: true,
  loading: () => (
    <div className="hidden lg:flex items-center space-x-8">
      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
    </div>
  )
});

const Footer = dynamic(() => import(/* webpackChunkName: "footer" */ '@/components/Footer'), { 
  ssr: true,
  loading: () => (
    <footer className="bg-white border-t py-8">
      <div className="container mx-auto px-5">
        <div className="w-full h-20 bg-gray-100 rounded animate-pulse"></div>
      </div>
    </footer>
  )
});

export const metadata: Metadata = {
  title: 'AI Tutor - Personalized Learning',
  description: 'AI-powered personal tutoring system that adapts to your learning style',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
        {/* Add preconnect for image hosting */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        
        {/* Add enhanced fallback styling with better initial loading state */}
        <style dangerouslySetInnerHTML={{ __html: `
          body { font-family: system-ui, sans-serif; }
          .fallback-container { padding: 20px; }
          .fallback-text { font-size: 16px; color: #333; }
          .initial-loader { 
            position: fixed; 
            top: 0; 
            left: 0; 
            right: 0; 
            bottom: 0; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            background-color: #fff; 
            z-index: 9999;
            transition: opacity 0.3s ease;
          }
          .initial-loader-content {
            text-align: center;
          }
          .initial-loader-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #4f46e5;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          #content-container {
            opacity: 0;
          }
          .content-loaded {
            opacity: 1 !important;
            transition: opacity 0.5s ease;
          }
        `}} />
      </head>
      <body className="font-sans antialiased">
        {/* Enhanced initial loader script */}
        <Script id="initial-loader-script" strategy="beforeInteractive">
          {`
            // Show initial loader
            function handleContentLoad() {
              const initialLoader = document.getElementById('initial-loader');
              const contentContainer = document.getElementById('content-container');
              
              if (initialLoader && contentContainer) {
                // Keep loader visible for at least 1.5 seconds
                setTimeout(() => {
                  contentContainer.classList.add('content-loaded');
                  initialLoader.style.opacity = '0';
                  setTimeout(() => {
                    initialLoader.style.display = 'none';
                  }, 500);
                }, 1500);
              }
              
              // Fallback in case of hydration errors
              window.addEventListener('error', function(e) {
                if (e.message && (
                  e.message.includes('hydration') || 
                  e.message.includes('Firebase') ||
                  e.message.includes('store')
                )) {
                  console.log('Detected hydration error, reloading page in 2 seconds');
                  // Only reload once to prevent loop
                  if (!sessionStorage.getItem('initialReload')) {
                    sessionStorage.setItem('initialReload', 'true');
                    setTimeout(() => window.location.reload(), 2000);
                  }
                }
              });
            }

            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', handleContentLoad);
            } else {
              handleContentLoad();
            }
          `}
        </Script>
        
        <div id="initial-loader" className="initial-loader">
          <div className="initial-loader-content">
            <div className="initial-loader-spinner"></div>
            <p className="mt-4">Loading AI Tutor...</p>
          </div>
        </div>
        
        <div id="content-container" className="opacity-0 transition-opacity duration-500">
          <Providers>
            {/* Add page transition loading indicator */}
            <PageTransition />
            
            <div className="min-h-screen flex flex-col">
              <Suspense fallback={
                <header className="bg-white border-b sticky top-0 z-30">
                  <div className="container mx-auto px-5 py-4 flex justify-between items-center">
                    <div className="text-2xl font-bold text-primary-600 tracking-tight">AI Tutor</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="w-10 h-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </header>
              }>
                <header className="bg-white border-b sticky top-0 z-30">
                  <div className="container mx-auto px-5 py-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold text-primary-600 tracking-tight">
                      AI Tutor
                    </Link>
                    <div className="hidden lg:flex items-center space-x-8">
                      <NavLinks />
                    </div>
                    
                    <div className="flex items-center">
                      <Suspense fallback={<div className="w-10 h-10 flex items-center justify-center"><div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div></div>}>
                        <NotificationBell />
                      </Suspense>
                      <MobileNav />
                    </div>
                  </div>
                </header>
              </Suspense>
              
              <main className="flex-1">
                <Suspense fallback={
                  <div className="container mx-auto px-5 py-8">
                    <div className="w-full h-64 bg-gray-100 rounded-lg animate-pulse"></div>
                  </div>
                }>
                  {children}
                </Suspense>
              </main>
              
              <Suspense fallback={
                <footer className="bg-white border-t py-8">
                  <div className="container mx-auto px-5">
                    <div className="w-full h-20 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                </footer>
              }>
                <Footer />
              </Suspense>
            </div>
          </Providers>
        </div>

        {/* Load Firebase only after main content */}
        <Script
          src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
          strategy="lazyOnload"
        />

        {/* Register service worker */}
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  setTimeout(() => {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('Service Worker registered with scope:', registration.scope);
                      })
                      .catch(function(error) {
                        console.log('Service Worker registration failed:', error);
                      });
                  }, 2000);
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
} 