import React, { useState } from 'react';
import { Briefcase, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = ({ authUser, setShowHistory, doLogout, setAuthMode, setShowAuth }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/70 backdrop-blur-xl border-b border-white/60 shadow-sm sticky top-0 z-40">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Briefcase className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-3 bg-gradient-to-r from-indigo-700 via-purple-700 to-sky-600 bg-clip-text text-2xl font-extrabold text-transparent">
                AI Interview System
              </h1>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100">About</Link>
              <Link to="/services" className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100">Services</Link>
              <Link to="/contact" className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100">Contact</Link>
            </div>
            <Link to="/resume-analysis" className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-200">Resume Analysis</Link>
            {authUser ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:block">Signed in as <span className="font-medium text-gray-800">{authUser.name || authUser.email}</span></span>
                <button onClick={() => setShowHistory(true)} className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700">History</button>
                <button onClick={doLogout} className="rounded-md bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-black">Logout</button>
              </>
            ) : (
              <button onClick={() => { setAuthMode('login'); setShowAuth(true); }} className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700">Login / Register</button>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-md p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              <Link to="/about" className="block text-sm text-gray-600 hover:text-gray-900 py-2 px-3 rounded-md hover:bg-gray-100">About</Link>
              <Link to="/services" className="block text-sm text-gray-600 hover:text-gray-900 py-2 px-3 rounded-md hover:bg-gray-100">Services</Link>
              <Link to="/contact" className="block text-sm text-gray-600 hover:text-gray-900 py-2 px-3 rounded-md hover:bg-gray-100">Contact</Link>
              <Link to="/resume-analysis" className="block text-sm text-gray-600 hover:text-gray-900 py-2 px-3 rounded-md hover:bg-gray-100">Resume Analysis</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
