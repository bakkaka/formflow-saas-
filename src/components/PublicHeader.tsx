'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FF</span>
              </div>
              <span className="font-bold text-xl text-gray-900">FormFlow AI</span>
            </Link>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/features" 
              className="text-gray-700 hover:text-indigo-600 transition-colors"
            >
              Fonctionnalités
            </Link>
            <Link 
              href="/pricing" 
              className="text-gray-700 hover:text-indigo-600 transition-colors"
            >
              Tarifs
            </Link>
            <Link 
              href="/templates" 
              className="text-gray-700 hover:text-indigo-600 transition-colors"
            >
              Templates
            </Link>
            
            <SignedOut>
              <Link 
                href="/sign-in" 
                className="text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Connexion
              </Link>
              <Link 
                href="/sign-up"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Essai gratuit
              </Link>
            </SignedOut>

            <SignedIn>
              <Link 
                href="/dashboard" 
                className="text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Dashboard
              </Link>
              <UserButton />
            </SignedIn>
          </nav>

          {/* Menu Mobile Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-indigo-600 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/features" 
                className="text-gray-700 hover:text-indigo-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Fonctionnalités
              </Link>
              <Link 
                href="/pricing" 
                className="text-gray-700 hover:text-indigo-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Tarifs
              </Link>
              <Link 
                href="/templates" 
                className="text-gray-700 hover:text-indigo-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Templates
              </Link>
              
              <SignedOut>
                <Link 
                  href="/sign-in" 
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link 
                  href="/sign-up"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Essai gratuit
                </Link>
              </SignedOut>

              <SignedIn>
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </SignedIn>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}