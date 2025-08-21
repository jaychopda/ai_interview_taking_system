import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API_BASE = 'http://localhost:5000';

export default function InterviewDetailsPage() {
  const { sessionId } = useParams();
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' }).then(r => r.json());
        if (me.authenticated) setAuthUser(me.user);
      } catch (_) {}
      try {
        const res = await fetch(`${API_BASE}/api/user/interview/${sessionId}`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || 'Failed to fetch details');
        } else {
          setDetails(data);
        }
      } catch (_) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [sessionId]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-indigo-50 via-white to-white">
      <Header authUser={authUser} setShowHistory={() => {}} doLogout={() => {}} setAuthMode={() => {}} setShowAuth={() => {}} />
      <main className="flex-grow">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Interview Details</h1>
            <Link to="/" className="rounded-md bg-gray-800 px-4 py-2 text-white hover:bg-black">Back to Home</Link>
          </div>
          {loading && <div className="rounded-xl bg-indigo-50 p-4 text-indigo-700">Loading...</div>}
          {error && !loading && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}
          {details && !loading && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-xl backdrop-blur-xl">
                <h2 className="mb-2 text-xl font-semibold text-gray-800">{details.interview.position} - {details.interview.difficulty}</h2>
                <p className="text-sm text-gray-600">Session: {details.interview.sessionId}</p>
                <p className="text-sm text-gray-600">Final Score: {details.interview.finalScore ?? '—'}/10</p>
                <p className="text-sm text-gray-600">Total Questions: {details.interview.totalQuestions}</p>
                <p className="text-sm text-gray-600">Skills: {(details.interview.skills || []).join(', ') || '—'}</p>
                <p className="text-sm text-gray-600">Date: {new Date(details.interview.createdAt).toLocaleString()}</p>
              </div>

              {details.results && (
                <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-xl backdrop-blur-xl">
                  <h3 className="mb-4 text-lg font-semibold text-gray-800">Questions & Answers</h3>
                  <div className="space-y-4">
                    {(details.results.questions_and_answers || []).map((qa, idx) => (
                      <div key={idx} className="rounded-lg border border-gray-200 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h5 className="font-semibold text-gray-800">Question {qa.question_number}</h5>
                          <span className="text-sm text-gray-600">Score: {qa.score}/10</span>
                        </div>
                        <p className="mb-2 text-gray-700"><strong>Q:</strong> {qa.question}</p>
                        {qa.answer && <p className="mb-2 text-gray-700"><strong>A:</strong> {qa.answer}</p>}
                        {qa.feedback && <p className="text-sm text-gray-600"><strong>Feedback:</strong> {qa.feedback}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}


