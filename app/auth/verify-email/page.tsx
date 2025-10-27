// app/auth/verify-email/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Api, setAccessToken } from '@/lib/api'; // Adjust the import path as needed

interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'photographer' | 'admin';
  emailVerified: boolean;
}

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const uid = searchParams.get('uid');

    const verifyEmail = async () => {
      if (!token || !uid) {
        setStatus('error');
        setMessage('Invalid verification link. Missing token or user ID.');
        return;
      }

      try {
        // Use the Api utility to call the verify-email endpoint
        const response = await Api.get<{ 
          message: string; 
          accessToken: string;
        }>(`/auth/verify-email?token=${token}&uid=${uid}`);

        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
        
        // Store the access token using the setAccessToken function from api.ts
        if (response.accessToken) {
          setAccessToken(response.accessToken);
        }

        // Get user data to determine role for redirection
        try {
          const userData = await Api.get<User>('/me');
          setUser(userData);
          
          // Redirect based on user role after delay
          setTimeout(() => {
            if (userData) {
              switch (userData.role) {
                case "client":
                  router.push("/dashboard/client");
                  break;
                case "photographer":
                  router.push("/dashboard/photographer");
                  break;
                case "admin":
                  router.push("/dashboard/admin");
                  break;
                default:
                  router.push("/");
              }
            }
          }, 3000);
        } catch (userError) {
          console.error('Failed to fetch user data:', userError);
          // If we can't get user data, redirect to default dashboard
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        }

      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('error');
        
        // Extract error message from ApiError
        if (error.status === 400 || error.status === 401) {
          setMessage(error.message || 'Email verification failed. The link may be invalid or expired.');
        } else {
          setMessage('Network error. Please check your connection and try again.');
        }
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  const getDashboardLabel = () => {
    if (!user) return 'dashboard';
    
    switch (user.role) {
      case "client":
        return "client dashboard";
      case "photographer":
        return "photographer dashboard";
      case "admin":
        return "admin dashboard";
      default:
        return "dashboard";
    }
  };

  const handleManualRedirect = () => {
    console.log ("Manual redirect to user", user);
    console.log ("Manual redirect to role", user?.role);
    if (user) {
      switch (user.role) {
        case "client":
          router.push("/dashboard/client");
          break;
        case "photographer":
          router.push("/dashboard/photographer");
          break;
        case "admin":
          router.push("/dashboard/admin");
          break;
        default:
          router.push("/login");
      }
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                  Verifying your email...
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Please wait while we verify your email address.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                  Email Verified!
                </h2>
                <p className="mt-2 text-sm text-gray-600">{message}</p>
                
                {user && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700">
                      Welcome, <strong>{user.name}</strong>! 
                      <br />
                      Role: <span className="capitalize">{user.role}</span>
                    </p>
                  </div>
                )}
                
                <div className="mt-6 space-y-3">
                  <p className="text-sm text-gray-500">
                    Redirecting to your {getDashboardLabel()}...
                  </p>
                  <button
                    onClick={handleManualRedirect}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Go to {getDashboardLabel().charAt(0).toUpperCase() + getDashboardLabel().slice(1)} Now
                  </button>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                  Verification Failed
                </h2>
                <p className="mt-2 text-sm text-gray-600">{message}</p>
                <div className="mt-6 space-y-3">
                  <Link
                    href="/auth/resend-verification"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Resend Verification Email
                  </Link>
                  <Link
                    href="/login"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}