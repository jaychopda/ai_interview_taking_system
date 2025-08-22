import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Brain, Users, Target, Shield, Zap, Award, TrendingUp, Globe, CheckCircle, Star, Clock, DollarSign } from 'lucide-react';

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState('individual');

  const services = {
    individual: {
      title: 'Individual Plans',
      description: 'Perfect for job seekers and professionals looking to improve their interview skills',
      features: [
        'AI-powered mock interviews',
        'Personalized question sets',
        'Real-time feedback and scoring',
        'Resume analysis and optimization',
        'Interview history and progress tracking',
        'Mobile-friendly interface'
      ],
      pricing: '$29/month',
      popular: false
    },
    enterprise: {
      title: 'Enterprise Solutions',
      description: 'Comprehensive interview preparation platform for companies and organizations',
      features: [
        'Custom interview question banks',
        'Team performance analytics',
        'White-label solutions',
        'API integration capabilities',
        'Dedicated account manager',
        'Advanced reporting and insights'
      ],
      pricing: 'Custom pricing',
      popular: true
    },
    educational: {
      title: 'Educational Institutions',
      description: 'Specialized solutions for universities, colleges, and training programs',
      features: [
        'Curriculum-aligned questions',
        'Student progress monitoring',
        'Instructor dashboard',
        'Assessment tools',
        'Career counseling integration',
        'Bulk licensing options'
      ],
      pricing: 'Contact us',
      popular: false
    }
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Questions',
      description: 'Intelligent question generation based on industry, role, and difficulty level'
    },
    {
      icon: Users,
      title: 'Personalized Experience',
      description: 'Tailored interview sessions based on your resume and career goals'
    },
    {
      icon: Target,
      title: 'Role-Specific Training',
      description: 'Focus on the exact skills and knowledge needed for your target position'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enterprise-grade security protecting your personal and professional information'
    },
    {
      icon: Zap,
      title: 'Real-time Feedback',
      description: 'Instant evaluation and suggestions to improve your interview performance'
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Monitor your improvement over time with detailed analytics and insights'
    }
  ];

  const industries = [
    'Software Development',
    'Data Science & Analytics',
    'Product Management',
    'Marketing & Sales',
    'Finance & Banking',
    'Healthcare & Biotech',
    'Consulting',
    'Education',
    'Government',
    'Non-profit'
  ];

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
                Our Services
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-xl text-indigo-100">
                Comprehensive interview preparation solutions designed to help you succeed in your career journey.
              </p>
            </div>
          </div>
        </div>

        {/* Service Plans */}
        <div className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Choose Your Plan
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                We offer flexible solutions for individuals, enterprises, and educational institutions.
              </p>
            </div>

            {/* Service Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 rounded-lg p-1">
                {Object.keys(services).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedService(key)}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedService === key
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {services[key].title}
                  </button>
                ))}
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
              <div className="text-center mb-8">
                {services[selectedService].popular && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 mb-4">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-bold text-gray-900">{services[selectedService].title}</h3>
                <p className="mt-2 text-gray-600">{services[selectedService].description}</p>
                <div className="mt-4 flex items-center justify-center">
                  <span className="text-4xl font-bold text-indigo-600">{services[selectedService].pricing}</span>
                  {selectedService === 'individual' && (
                    <span className="ml-2 text-gray-500">/month</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services[selectedService].features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Why Choose Our Platform?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                Advanced technology combined with proven methodologies to deliver exceptional results.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                    <feature.icon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Industries Served */}
        <div className="py-16 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Industries We Serve
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                Our platform covers a wide range of industries and job roles to meet your specific needs.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {industries.map((industry, index) => (
                <div key={index} className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-sm font-medium text-gray-700">{industry}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Comparison */}
        <div className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Pricing Comparison
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                Transparent pricing for all our service tiers.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Individual Plan */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900">Individual</h3>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">$29</span>
                    <span className="ml-1 text-gray-500">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">Perfect for job seekers</p>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">5 mock interviews/month</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Resume analysis</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Basic analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Email support</span>
                  </li>
                </ul>
                <button className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors">
                  Start Free Trial
                </button>
              </div>

              {/* Professional Plan */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-indigo-500 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900">Professional</h3>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">$79</span>
                    <span className="ml-1 text-gray-500">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">For serious professionals</p>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Unlimited interviews</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Advanced analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Custom question sets</span>
                  </li>
                </ul>
                <button className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors">
                  Start Free Trial
                </button>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900">Enterprise</h3>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">Custom</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">For organizations</p>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Custom integrations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Dedicated support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">White-label options</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">SLA guarantees</span>
                  </li>
                </ul>
                <button className="mt-8 w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 bg-indigo-600">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-indigo-100">
              Join thousands of professionals who have improved their interview skills with our AI-powered platform.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors">
                Start Free Trial
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-3 rounded-lg font-medium transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
