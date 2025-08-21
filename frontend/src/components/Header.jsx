import React from 'react';
import { Briefcase } from 'lucide-react';

const Header = ({ authUser, setShowHistory, doLogout, setAuthMode, setShowAuth }) => {
  return (
    <header className="bg-white/70 backdrop-blur-xl border-b border-white/60 shadow-sm sticky top-0 z-40">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-indigo-600" />
            <h1 className="ml-3 bg-gradient-to-r from-indigo-700 via-purple-700 to-sky-600 bg-clip-text text-2xl font-extrabold text-transparent">
              AI Interview System
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {authUser ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:block">Signed in as <span className="font-medium text-gray-800">{authUser.name || authUser.email}</span></span>
                <button onClick={() => setShowHistory(true)} className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700">History</button>
                <button onClick={doLogout} className="rounded-md bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-black">Logout</button>
              </>
            ) : (
              <button onClick={() => { setAuthMode('login'); setShowAuth(true); }} className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700">Login / Register</button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
