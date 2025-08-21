import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FileText, Upload, CheckCircle, RefreshCw, Lightbulb, User, Mail, Phone, GraduationCap, Code, Building } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

export default function ResumeAnalysisPage() {
  const [authUser, setAuthUser] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' });
        const data = await res.json();
        if (data.authenticated) setAuthUser(data.user);
      } catch (_) {}
    };
    fetchMe();
  }, []);

  useEffect(() => {
    const fetchExisting = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/user/resume-analysis`, { credentials: 'include' });
        const data = await res.json();
        if (data.success && data.analysis) {
          setAnalysis(data.analysis);
          computeSuggestions(data.analysis);
        }
      } catch (_) {}
      setLoading(false);
    };
    fetchExisting();
  }, []);

  const computeSuggestions = (a) => {
    if (!a) { setSuggestions([]); return; }
    const tips = [];
    if (!a.summary || a.summary === 'Resume analysis failed') tips.push('Add a concise professional summary highlighting impact.');
    if (!a.skills || a.skills.length < 5) tips.push('List at least 5-8 relevant technical skills.');
    if (!a.previous_roles || a.previous_roles.length === 0) tips.push('Include previous roles with metrics (e.g., improved X by Y%).');
    if (!a.key_projects || a.key_projects.length === 0) tips.push('Add 2-3 key projects with outcomes and tech stack.');
    if (!a.education) tips.push('Mention highest education with specialization.');

    const normalizedSkills = new Set((a.skills || []).map(s => (s || '').toLowerCase()));
    const roles = [
      { role: 'Frontend Developer', required: ['html', 'css', 'javascript', 'react', 'typescript'], triggers: ['react', 'javascript', 'css', 'html'] },
      { role: 'Backend Developer (Node.js)', required: ['node', 'express', 'mongodb', 'rest api', 'authentication', 'testing'], triggers: ['node', 'express', 'mongodb', 'mysql', 'postgres'] },
      { role: 'Full Stack Developer', required: ['react', 'node', 'express', 'mongodb', 'typescript'], triggers: ['react', 'node'] },
      { role: 'Data Scientist', required: ['python', 'pandas', 'numpy', 'scikit-learn', 'ml'], triggers: ['python', 'pandas', 'scikit', 'machine learning'] },
      { role: 'ML Engineer', required: ['python', 'pytorch', 'tensorflow', 'mlops', 'docker'], triggers: ['pytorch', 'tensorflow', 'ml'] },
      { role: 'Data Analyst', required: ['sql', 'excel', 'tableau', 'power bi', 'statistics'], triggers: ['sql', 'tableau', 'power bi', 'excel'] },
      { role: 'DevOps Engineer', required: ['linux', 'docker', 'kubernetes', 'aws', 'ci/cd'], triggers: ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd'] },
      { role: 'UI/UX Designer', required: ['figma', 'wireframing', 'prototyping', 'ux research'], triggers: ['figma', 'ux', 'ui'] },
    ];

    const roleRecs = [];
    for (const r of roles) {
      const triggerHit = r.triggers.some(t => Array.from(normalizedSkills).some(s => s.includes(t)));
      if (!triggerHit) continue;
      const have = r.required.filter(req => Array.from(normalizedSkills).some(s => s.includes(req)));
      const missing = r.required.filter(req => !have.some(h => h === req));
      const coverage = have.length / r.required.length;
      roleRecs.push({ role: r.role, coverage, missing });
    }

    roleRecs.sort((a, b) => b.coverage - a.coverage);

    const roleTips = roleRecs.map(r => {
      if (r.coverage >= 0.7) return `Strong fit for ${r.role}.`;
      if (r.missing.length > 0) return `Potential fit for ${r.role}. Add: ${r.missing.slice(0,3).join(', ')}.`;
      return `Potential fit for ${r.role}.`;
    });

    setSuggestions([...tips, ...roleTips]);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await fetch(`${API_BASE}/api/upload-resume`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setAnalysis(result.analysis);
        computeSuggestions(result.analysis);
      } else {
        alert(result.error || 'Failed to analyze resume');
      }
    } catch (e) {
      alert('Network error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-indigo-50 via-white to-white">
      <Header authUser={authUser} setShowHistory={() => {}} doLogout={() => {}} setAuthMode={() => {}} setShowAuth={() => {}} />
      <main className="flex-grow">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Resume Analysis</h1>
              <p className="text-sm text-gray-600">Upload your resume to view AI-extracted insights and suggestions.</p>
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
              <Upload className="h-4 w-4" /> {analysis ? 'Upload New Resume' : 'Upload Resume'}
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
          </div>

          {loading && (
            <div className="rounded-xl bg-indigo-50 p-4 text-indigo-700">Loading your latest analysis...</div>
          )}

          {!loading && !analysis && (
            <div className="rounded-2xl border border-white/60 bg-white/70 p-8 text-center shadow-xl backdrop-blur-xl">
              <FileText className="mx-auto mb-4 h-16 w-16 text-indigo-600" />
              <h2 className="mb-2 text-2xl font-bold text-gray-800">No analysis found</h2>
              <p className="mb-6 text-gray-600">Upload your resume to generate AI insights.</p>
              <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700">
                <Upload className="h-4 w-4" /> Upload Resume
              </button>
            </div>
          )}

          {analysis && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-xl backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">Extracted Details</h2>
                  <span className="inline-flex items-center gap-2 text-sm text-gray-600">
                    <RefreshCw className={`h-4 w-4 ${uploading ? 'animate-spin' : ''}`} />
                    {uploading ? 'Updating...' : 'Latest Analysis'}
                  </span>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-gray-50 rounded-lg p-5">
                    <h3 className="flex items-center text-base font-semibold text-gray-700 mb-3">
                      <User className="mr-2 h-5 w-5" /> Personal Information
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center"><User className="h-4 w-4 text-gray-500 mr-2" /> Name: <span className="ml-2 font-medium">{analysis.name || 'Not specified'}</span></div>
                      <div className="flex items-center"><Mail className="h-4 w-4 text-gray-500 mr-2" /> Email: <span className="ml-2 font-medium">{analysis.email || 'Not specified'}</span></div>
                      <div className="flex items-center"><Phone className="h-4 w-4 text-gray-500 mr-2" /> Phone: <span className="ml-2 font-medium">{analysis.phone || 'Not specified'}</span></div>
                      <div className="flex items-center"><FileText className="h-4 w-4 text-gray-500 mr-2" /> Experience: <span className="ml-2 font-medium">{analysis.experience_years || 'Not specified'}</span></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-5">
                    <h3 className="flex items-center text-base font-semibold text-gray-700 mb-3">
                      <Building className="mr-2 h-5 w-5" /> Professional Background
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center mb-1"><GraduationCap className="h-4 w-4 text-gray-500 mr-2" /> Education:</div>
                      <div className="ml-6 font-medium">{analysis.education || 'Not specified'}</div>
                      <div className="flex items-center mb-1 mt-3"><Building className="h-4 w-4 text-gray-500 mr-2" /> Previous Roles:</div>
                      <div className="ml-6">
                        {(analysis.previous_roles || []).length > 0 ? (
                          (analysis.previous_roles || []).map((role, idx) => (
                            <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-2">{role}</span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">Not specified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-5">
                    <h3 className="flex items-center text-base font-semibold text-gray-700 mb-3">
                      <Code className="mr-2 h-5 w-5" /> Technical Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(analysis.skills || []).length > 0 ? (
                        (analysis.skills || []).map((skill, idx) => (
                          <span key={idx} className="inline-block bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full">{skill}</span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No skills specified</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-5">
                    <h3 className="flex items-center text-base font-semibold text-gray-700 mb-3">
                      <FileText className="mr-2 h-5 w-5" /> Key Projects
                    </h3>
                    <div className="space-y-2">
                      {(analysis.key_projects || []).length > 0 ? (
                        (analysis.key_projects || []).map((p, idx) => (
                          <div key={idx} className="flex items-center text-sm text-gray-700"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> {p}</div>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No projects specified</span>
                      )}
                    </div>
                  </div>
                </div>

                {analysis.summary && (
                  <div className="bg-indigo-50 rounded-lg p-5 mt-6">
                    <h3 className="text-base font-semibold text-indigo-800 mb-2">AI Summary</h3>
                    <p className="text-indigo-700 text-sm">{analysis.summary}</p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-xl backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-gray-800">AI Suggestions</h3>
                </div>
                {suggestions.length === 0 ? (
                  <p className="text-sm text-gray-600">Looks good! Consider tailoring your resume to the specific job description.</p>
                ) : (
                  <ul className="list-disc space-y-2 pl-6 text-sm text-gray-700">
                    {suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
