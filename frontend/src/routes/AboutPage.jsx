import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Brain, Users, Target, Shield, Zap, Award, TrendingUp, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-indigo-50 via-white to-white">
      <Header authUser={null} setShowHistory={() => {}} doLogout={() => {}} setAuthMode={() => {}} setShowAuth={() => {}} />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-sky-600 py-20">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                About AI Interview System
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-xl text-indigo-100">
                Revolutionizing the interview process with cutting-edge AI technology to help candidates prepare better and succeed in their careers.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Our Mission
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                To democratize access to high-quality interview preparation by leveraging artificial intelligence, making professional development accessible to everyone.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                  <Brain className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">AI-Powered</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Advanced machine learning algorithms provide intelligent interview questions and feedback.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Personalized</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Tailored interview experiences based on your resume, skills, and career goals.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Focused</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Industry-specific questions and role-appropriate difficulty levels.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Secure</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Enterprise-grade security protecting your personal and professional information.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Powered by Advanced AI
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Our system leverages state-of-the-art natural language processing and machine learning technologies to deliver intelligent, contextual interview experiences.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-yellow-500 mr-3" />
                    <span className="text-gray-700">Real-time question generation</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-yellow-500 mr-3" />
                    <span className="text-gray-700">Intelligent answer evaluation</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-yellow-500 mr-3" />
                    <span className="text-gray-700">Performance analytics</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-yellow-500 mr-3" />
                    <span className="text-gray-700">Multi-language support</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 lg:mt-0">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">AI Capabilities</h3>
                  <ul className="space-y-3 text-indigo-100">
                    <li>• Natural Language Understanding</li>
                    <li>• Context-Aware Question Generation</li>
                    <li>• Intelligent Answer Assessment</li>
                    <li>• Personalized Learning Paths</li>
                    <li>• Real-time Feedback Generation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600">10K+</div>
                <div className="mt-2 text-lg text-gray-600">Interviews Conducted</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600">95%</div>
                <div className="mt-2 text-lg text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600">50+</div>
                <div className="mt-2 text-lg text-gray-600">Industries Covered</div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Our Team
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                A dedicated team of AI researchers, software engineers, and career development experts working together to revolutionize interview preparation.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">AI</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">AI Research Team</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Experts in natural language processing and machine learning.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">DEV</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Development Team</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Full-stack developers building robust, scalable solutions.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">UX</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">UX Design Team</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Creating intuitive, user-friendly interview experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
