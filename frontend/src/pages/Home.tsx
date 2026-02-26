import { Link, Navigate } from "react-router-dom";
import { Shield, Zap, Users } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import Navbar from "../components/NavBar";

export default function Home() {
  const token = useAuthStore((state) => state.token);

  if(token) 
    return <Navigate to="/chat"  replace />
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <Navbar />
      {/* Hero Section */}
      <div className="relative isolate px-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-20 text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-slate-400 ring-1 ring-white/10 hover:ring-white/20">
              New: Secure Real-time Messaging
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Connect Instantly with <span className="text-emerald-400">ChatApp</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            A fast, secure, and modern way to chat with friends. Send messages, find new people, and stay connected in real-time.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {token ? (
              <Link
                to="/chat"
                className="rounded-md bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                Go to Chats
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="rounded-md bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
                >
                  Get started
                </Link>
                <Link to="/login" className="text-sm font-semibold leading-6 text-white">
                  Log in <span aria-hidden="true">→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-emerald-400">Faster communication</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need to stay connected
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
              
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600">
                    <Zap className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Real-time Messaging
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-400">
                  Powered by WebSockets, messages are delivered instantly. No refreshing required.
                </dd>
              </div>

              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600">
                    <Users className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Find Friends
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-400">
                  Search for users by username, view profiles, and send friend requests easily.
                </dd>
              </div>

              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600">
                    <Shield className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Secure & Private
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-400">
                  Your data is safe. We use JWT authentication to ensure only you access your account.
                </dd>
              </div>

            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}