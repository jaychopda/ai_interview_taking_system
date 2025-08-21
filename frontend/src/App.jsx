import { useState } from 'react'
import './App.css'

import React, { useRef } from 'react';
import { Upload, Mic, MicOff, Play, Pause, FileText, Briefcase, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

const API_BASE = 'http://localhost:5000';

const AIInterviewSystem = () => {
  const [currentStep, setCurrentStep] = useState('selection');
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTotalQuestions, setSelectedTotalQuestions] = useState(5);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState(null);
  const [finalResults, setFinalResults] = useState(null);

  // Auth state
  const [authUser, setAuthUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Interview history state
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  
  const fileInputRef = useRef(null);

  const positions = [
    'Software Developer',
    'Data Scientist',
    'Product Manager',
    'UI/UX Designer',
    'DevOps Engineer',
    'Business Analyst'
  ];

  const difficulties = [
    { level: 'Beginner', description: 'Entry level, basic concepts' },
    { level: 'Intermediate', description: 'Mid-level, practical experience' },
    { level: 'Advanced', description: 'Senior level, complex scenarios' }
  ];

  const sampleQuestions = {
    'Software Developer': {
      'Beginner': [
        'Tell me about yourself and why you chose software development.',
        'What is the difference between a list and a tuple in Python?',
        'How do you handle version control in your projects?'
      ],
      'Intermediate': [
        'Describe a challenging bug you encountered and how you solved it.',
        'Explain the concept of RESTful APIs and how you would design one.',
        'What are your strategies for code optimization?'
      ],
      'Advanced': [
        'How would you design a scalable microservices architecture?',
        'Discuss your experience with performance optimization in large applications.',
        'How do you handle technical debt in legacy systems?'
      ]
    }
  };

  const fetchInterviewHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/user/interviews`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setInterviewHistory(data.interviews);
      }
    } catch (_) { /* noop */ }
  };

  const fetchLatestResumeAnalysis = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/user/resume-analysis`, { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.analysis) {
        setResumeAnalysis(data.analysis);
      }
    } catch (_) { /* noop */ }
  };

  const fetchMe = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' });
      const data = await res.json();
      if (data.authenticated) {
        setAuthUser(data.user);
        fetchInterviewHistory();
        fetchLatestResumeAnalysis();
      } else {
        setAuthUser(null);
        setInterviewHistory([]);
        setResumeAnalysis(null);
        setSelectedSkills([]);
      }
    } catch (_) { /* noop */ }
  };

  React.useEffect(() => {
    fetchMe();
  }, []);

  React.useEffect(() => {
    const cancelIfInProgress = () => {
      if (sessionId && currentStep !== 'results') {
        try {
          const payload = JSON.stringify({ sessionId });
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon('http://localhost:5000/api/cancel-interview', blob);
        } catch (_) { /* noop */ }
      }
    };

    const onBeforeUnload = () => {
      cancelIfInProgress();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') cancelIfInProgress();
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [sessionId, currentStep]);

  const doAuth = async () => {
    setAuthError('');
    try {
      const url = authMode === 'login' ? `${API_BASE}/api/auth/login` : `${API_BASE}/api/auth/register`;
      const body = authMode === 'login'
        ? { email: authEmail, password: authPassword }
        : { email: authEmail, password: authPassword, name: authName };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Authentication failed');
        return;
      }
      setAuthUser(data.user);
      setShowAuth(false);
      fetchInterviewHistory();
      fetchLatestResumeAnalysis(); // Call this after successful auth
    } catch (e) {
      setAuthError('Network error');
    }
  };

  const doLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
      setAuthUser(null);
      setInterviewHistory([]);
      setCurrentStep('selection');
    } catch (_) { /* noop */ }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      setResumeUploaded(true);
      
      try {
        const formData = new FormData();
        formData.append('resume', file);

        const response = await fetch('http://localhost:5000/api/upload-resume', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        const result = await response.json();
        
        if (result.success) {
          setResumeAnalysis(result.analysis);
          setTimeout(() => {
            setCurrentStep('selection');
            setLoading(false);
          }, 1000);
        } else {
          alert('Failed to analyze resume: ' + result.error);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error uploading resume:', error);
        alert('Failed to upload resume. Please try again.');
        setLoading(false);
      }
    }
  };

  const startInterview = async () => {
    if (!authUser) {
      alert('Please login to start an interview');
      setShowAuth(true);
      return;
    }
    
    if (selectedPosition && selectedDifficulty) {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/start-interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            position: selectedPosition,
            difficulty: selectedDifficulty,
            skills: selectedSkills,
            totalQuestions: selectedTotalQuestions,
            resumeAnalysis: resumeAnalysis
          })
        });
        const result = await response.json();
        if (result.success) {
          setSessionId(result.sessionId);
          setCurrentQuestion(result.firstQuestion);
          setQuestionNumber(1);
          setTotalQuestions(result.totalQuestions || selectedTotalQuestions);
          setCurrentStep('interview');
          setInterviewStarted(true);
        } else {
          alert('Failed to start interview: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error starting interview:', error);
        alert('Failed to start interview. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          await convertSpeechToText(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        setAudioRecorder(mediaRecorder);
        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting recording:', error);
        alert('Failed to start recording. Please check microphone permissions.');
      }
    } else {
      // Stop recording
      if (audioRecorder) {
        audioRecorder.stop();
        setIsRecording(false);
        setAudioRecorder(null);
      }
    }
  };

  const convertSpeechToText = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('http://localhost:5000/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setUserAnswer(result.transcript);
        await submitAnswer(result.transcript);
      } else {
        alert('Failed to convert speech to text: ' + result.error);
      }
    } catch (error) {
      console.error('Error converting speech to text:', error);
      setUserAnswer("Speech recognition failed. Please try again.");
    }
  };

  const submitAnswer = async (answer) => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          sessionId: sessionId,
          answer: answer,
          questionNumber: questionNumber
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setFeedback(result.feedback);
        
        if (result.isComplete) {
          setFinalResults({
            finalScore: result.finalScore,
            totalQuestions: result.totalQuestions || totalQuestions,
            suggestions: result.suggestions || [],
            overallAdvice: result.overallAdvice || ''
          });
          setCurrentStep('results');
          fetchInterviewHistory(); // Refresh history after completion
        } else {
          setCurrentQuestion(result.nextQuestion);
          setQuestionNumber(result.questionNumber);
        }
        setLoading(false);
      } else {
        alert('Failed to submit answer: ' + result.error);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
      setLoading(false);
    }
  };

  const togglePlayback = async () => {
    if (!isPlaying) {
      setIsPlaying(true);
      
      try {
        const response = await fetch('http://localhost:5000/api/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: currentQuestion
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          // Play the audio
          const audio = new Audio(result.audioUrl);
          audio.onended = () => setIsPlaying(false);
          audio.onerror = () => setIsPlaying(false);
          audio.play();
        } else {
          console.error('TTS failed:', result.error);
          setIsPlaying(false);
        }
      } catch (error) {
        console.error('Error with text-to-speech:', error);
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
    }
  };

  const nextQuestion = () => {
    setUserAnswer('');
    setFeedback('');
  };

  const viewInterviewDetail = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE}/api/user/interview/${sessionId}`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setSelectedInterview(data.interview);
        setShowHistory(true);
      }
    } catch (error) {
      console.error('Error fetching interview details:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -top-32 -left-20 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-200/70 to-sky-200/70 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-gradient-to-br from-fuchsia-200/60 to-pink-200/60 blur-3xl"></div>

      <Header
        authUser={authUser}
        setShowHistory={setShowHistory}
        doLogout={doLogout}
        setAuthMode={setAuthMode}
        setShowAuth={setShowAuth}
      />

      <main className="flex-grow">
        <div className="mx-auto max-w-5xl px-4 py-8">
          {/* Hero */}
          <div className="mb-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 p-6 text-white shadow">
            <h2 className="text-2xl font-bold">Start Your AI-Powered Interview</h2>
            <p className="mt-1 text-sm opacity-90">Choose a position and difficulty to begin. You can analyze your resume from the header anytime.</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between">
              <span className={`text-xs md:text-sm ${currentStep === 'selection' ? 'text-indigo-500 font-semibold' : 'text-gray-500'}`}>Position Selection</span>
              <span className={`text-xs md:text-sm ${currentStep === 'interview' ? 'text-indigo-500 font-semibold' : 'text-gray-500'}`}>Interview</span>
              <span className={`text-xs md:text-sm ${currentStep === 'results' ? 'text-indigo-500 font-semibold' : 'text-gray-500'}`}>Results</span>
            </div>
            <div className="relative h-2 w-full rounded-full bg-gray-200">
              <div
                className="absolute left-0 top-0 h-2 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 transition-all duration-500"
                style={{
                  width:
                    currentStep === 'selection'
                      ? '33%'
                      : currentStep === 'interview'
                      ? '66%'
                      : '100%'
                }}
              />
            </div>
          </div>

          {/* Step 2: Position & Difficulty Selection */}
          {currentStep === 'selection' && (
            <div className="rounded-2xl border border-white/60 bg-white/70 p-8 shadow-xl backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Interview Configuration</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Position Selection */}
                <div>
                  <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-700">
                    <Briefcase className="mr-2 h-5 w-5" />
                    Select Position
                  </h3>
                  <div className="space-y-3">
                    {positions.map((position) => (
                      <label key={position} className="block cursor-pointer rounded-lg border border-gray-200 bg-white/70 p-3 transition-colors hover:border-indigo-300">
                        <input
                          type="radio"
                          name="position"
                          value={position}
                          onChange={(e) => setSelectedPosition(e.target.value)}
                          className="mr-3 accent-indigo-600"
                        />
                        <span className="text-gray-700">{position}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Difficulty Selection */}
                <div>
                  <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-700">
                    <Clock className="mr-2 h-5 w-5" />
                    Select Difficulty
                  </h3>
                  <div className="space-y-3">
                    {difficulties.map((diff) => (
                      <label key={diff.level} className="block cursor-pointer rounded-lg border border-gray-200 bg-white/70 p-3 transition-colors hover:border-indigo-300">
                        <input
                          type="radio"
                          name="difficulty"
                          value={diff.level}
                          onChange={(e) => setSelectedDifficulty(e.target.value)}
                          className="mr-3 accent-indigo-600"
                        />
                        <div>
                          <span className="text-gray-700 font-medium">{diff.level}</span>
                          <p className="ml-6 text-sm text-gray-500">{diff.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Total Questions Selection */}
              <div className="mt-8">
                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-700">
                  <Clock className="mr-2 h-5 w-5" />
                  Select Number of Questions
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {[3,5,7,10,12,15].map(q => (
                    <label key={q} className={`block cursor-pointer rounded-lg border p-3 text-center ${selectedTotalQuestions === q ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white/70 text-gray-700'} hover:border-indigo-300`}>
                      <input
                        type="radio"
                        name="totalQuestions"
                        value={q}
                        checked={selectedTotalQuestions === q}
                        onChange={() => setSelectedTotalQuestions(q)}
                        className="hidden"
                      />
                      {q}
                    </label>
                  ))}
                </div>
              </div>

              {/* Skill Selection */}
              {resumeAnalysis && Array.isArray(resumeAnalysis.skills) && resumeAnalysis.skills.length > 0 ? (
                <div className="mt-8">
                  <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-700">
                    <FileText className="mr-2 h-5 w-5" />
                    Select Skills to Focus On
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Choose the technical skills from your resume that you want to be interviewed on:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {resumeAnalysis.skills.map((skill, index) => (
                      <label key={index} className="flex items-center cursor-pointer rounded-lg border border-gray-200 bg-white/70 p-3 transition-colors hover:border-indigo-300">
                        <input
                          type="checkbox"
                          value={skill}
                          checked={selectedSkills.includes(skill)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSkills([...selectedSkills, skill]);
                            } else {
                              setSelectedSkills(selectedSkills.filter(s => s !== skill));
                            }
                          }}
                          className="mr-2 accent-indigo-600"
                        />
                        <span className="text-sm text-gray-700">{skill}</span>
                      </label>
                    ))}
                  </div>
                  {selectedSkills.length > 0 && (
                    <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                      <p className="text-sm text-indigo-700">
                        <strong>Selected Skills:</strong> {selectedSkills.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
                  <p className="text-sm">No skills found from your resume yet. Please <Link className="font-medium underline" to="/resume-analysis">upload a resume</Link> first so we can extract your technical skills for selection.</p>
                </div>
              )}

              <div className="text-center mt-8">
                {loading ? (
                  <div className="inline-flex items-center">
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                    <span className="text-indigo-700">Starting interview...</span>
                  </div>
                ) : (
                  <button
                    onClick={startInterview}
                    disabled={!selectedPosition || !selectedDifficulty || selectedSkills.length === 0 || !selectedTotalQuestions}
                    className="rounded-lg bg-gradient-to-r from-indigo-600 to-sky-600 px-8 py-3 text-white shadow-md transition-all hover:from-indigo-700 hover:to-sky-700 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300"
                  >
                    Start Interview
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Interview Interface */}
          {currentStep === 'interview' && (
            <div className="rounded-2xl border border-white/60 bg-white/70 p-8 shadow-xl backdrop-blur-xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Question {questionNumber} of {totalQuestions}</h2>
                <p className="text-gray-600">{selectedPosition} - {selectedDifficulty} Level</p>
                {selectedSkills.length > 0 && (
                  <p className="text-sm text-indigo-600 mt-2">
                    <strong>Focusing on:</strong> {selectedSkills.join(', ')}
                  </p>
                )}
              </div>

              {/* Question Display */}
              <div className="mb-6 rounded-xl bg-indigo-50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Current Question:</h3>
                  <button
                    onClick={togglePlayback}
                    className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-600 px-4 py-2 text-white shadow-md transition-colors hover:from-indigo-700 hover:to-sky-700"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    <span>{isPlaying ? 'Stop' : 'Listen'}</span>
                  </button>
                </div>
                <p className="text-gray-700 text-lg">{currentQuestion}</p>
              </div>

              {/* Voice Recording */}
              <div className="text-center mb-6">
                <button
                  onClick={toggleRecording}
                  className={`mx-auto flex items-center space-x-3 rounded-full px-6 py-4 text-white transition-all ${
                    isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
                >
                  {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                </button>
                {isRecording && (
                  <p className="text-sm text-gray-500 mt-2">Recording your answer...</p>
                )}
              </div>

              {/* Answer Display */}
              {userAnswer && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-700 mb-2">Your Answer:</h4>
                  <p className="text-gray-600">{userAnswer}</p>
                </div>
              )}

              {/* AI Feedback */}
              {feedback && (
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-green-800 mb-2">AI Feedback:</h4>
                  <p className="text-green-700">{feedback}</p>
                </div>
              )}

              {/* Next Question Button */}
              {userAnswer && feedback && !loading && (
                <div className="text-center">
                  <button
                    onClick={nextQuestion}
                    className="rounded-lg bg-gradient-to-r from-indigo-600 to-sky-600 px-6 py-3 text-white shadow-md transition-colors hover:from-indigo-700 hover:to-sky-700"
                  >
                    {questionNumber < 5 ? 'Continue' : 'Finish Interview'}
                  </button>
                </div>
              )}

              {loading && (
                <div className="text-center">
                  <div className="inline-flex items-center">
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                    <span className="text-indigo-700">Processing your answer...</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Results */}
          {currentStep === 'results' && (
            <div className="rounded-2xl border border-white/60 bg-white/70 p-8 text-center shadow-xl backdrop-blur-xl">
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
              <h2 className="mb-4 text-2xl font-bold text-gray-800">Interview Completed!</h2>
              <p className="mb-6 text-gray-600">Thank you for completing the AI interview session.</p>
              
              <div className="mb-6 rounded-xl bg-gray-50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Interview Summary</h3>
                <div className="grid gap-4 text-center md:grid-cols-3">
                  <div>
                    <p className="text-2xl font-bold text-indigo-600">{finalResults?.totalQuestions || 5}</p>
                    <p className="text-sm text-gray-600">Questions Answered</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{finalResults?.finalScore ?? 0}/10</p>
                    <p className="text-sm text-gray-600">Overall Score</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">15 min</p>
                    <p className="text-sm text-gray-600">Total Duration</p>
                  </div>
                </div>
                
                {resumeAnalysis && (
                  <div className="mt-4 rounded border bg-white p-4">
                    <h4 className="mb-2 font-semibold text-gray-700">Position Applied: {selectedPosition}</h4>
                    <p className="text-sm text-gray-600">Difficulty Level: {selectedDifficulty}</p>
                    {resumeAnalysis.name && (
                      <p className="text-sm text-gray-600">Candidate: {resumeAnalysis.name}</p>
                    )}
                  </div>
                )}
              </div>

              {finalResults?.suggestions && finalResults.suggestions.length > 0 && (
                <div className="mb-6 rounded-xl bg-indigo-50 p-6 text-left">
                  <h3 className="mb-3 text-lg font-semibold text-indigo-800">AI Suggestions for Improvement</h3>
                  <ul className="list-disc pl-6 text-sm text-indigo-900 space-y-1">
                    {finalResults.suggestions.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                  {finalResults.overallAdvice && (
                    <p className="mt-3 text-sm text-indigo-900"><strong>Overall advice:</strong> {finalResults.overallAdvice}</p>
                  )}
                </div>
              )}

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setCurrentStep('selection');
                    setResumeUploaded(false);
                    setSelectedPosition('');
                    setSelectedDifficulty('');
                    setQuestionNumber(1);
                    setUserAnswer('');
                    setFeedback('');
                    setCurrentQuestion('');
                    setSessionId('');
                    setResumeAnalysis(null);
                    setFinalResults(null);
                  }}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-sky-600 px-8 py-3 text-white shadow-md transition-colors hover:from-indigo-700 hover:to-sky-700"
                >
                  Start New Interview
                </button>
                <button
                  onClick={() => setShowHistory(true)}
                  className="rounded-lg bg-gray-600 px-8 py-3 text-white shadow-md transition-colors hover:bg-gray-700"
                >
                  View History
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Interview History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Interview History</h3>
              <button onClick={() => { setShowHistory(false); setSelectedInterview(null); }} className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100">Close</button>
            </div>
            
            {selectedInterview ? (
              <div>
                <div className="mb-4 rounded-lg bg-gray-50 p-4">
                  <h4 className="mb-2 text-lg font-semibold text-gray-800">{selectedInterview.position} - {selectedInterview.difficulty}</h4>
                  <p className="text-sm text-gray-600">Score: {selectedInterview.finalScore}/10 | Questions: {selectedInterview.totalQuestions}</p>
                  <p className="text-sm text-gray-600">Date: {new Date(selectedInterview.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div className="space-y-4">
                  {selectedInterview.questions.map((q, index) => (
                    <div key={index} className="rounded-lg border border-gray-200 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h5 className="font-semibold text-gray-800">Question {q.questionNumber}</h5>
                        <span className="text-sm text-gray-600">Score: {q.score}/10</span>
                      </div>
                      <p className="mb-2 text-gray-700"><strong>Q:</strong> {q.questionText}</p>
                      <p className="mb-2 text-gray-700"><strong>A:</strong> {q.answerText}</p>
                      <p className="text-sm text-gray-600"><strong>Feedback:</strong> {q.aiFeedback}</p>
                    </div>
                  ))}
                </div>
                
                <button onClick={() => setSelectedInterview(null)} className="mt-4 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">Back to List</button>
              </div>
            ) : (
              <div>
                {interviewHistory.length === 0 ? (
                  <p className="text-center text-gray-500">No interview history found.</p>
                ) : (
                  <div className="space-y-3">
                    {interviewHistory.map((interview) => (
                      <div key={interview.sessionId} className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                        <div>
                          <h4 className="font-semibold text-gray-800">{interview.position} - {interview.difficulty}</h4>
                          <p className="text-sm text-gray-600">
                            Score: {interview.finalScore ?? '—'}/10 | Questions: {interview.totalQuestions} | Skills: {(interview.skills || []).slice(0,3).join(', ') || '—'}
                          </p>
                          <p className="text-xs text-gray-500">{new Date(interview.createdAt).toLocaleString()}</p>
                        </div>
                        <a
                          href={`/interview/${interview.sessionId}`}
                          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
                        >
                          View Details
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">{authMode === 'login' ? 'Login' : 'Create Account'}</h3>
              <button onClick={() => setShowAuth(false)} className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100">Close</button>
            </div>
            {authError && <div className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{authError}</div>}
            {authMode === 'register' && (
              <div className="mb-3">
                <label className="mb-1 block text-sm text-gray-700">Name</label>
                <input value={authName} onChange={(e) => setAuthName(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="Your name" />
              </div>
            )}
            <div className="mb-3">
              <label className="mb-1 block text-sm text-gray-700">Email</label>
              <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="you@example.com" />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm text-gray-700">Password</label>
              <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="••••••••" />
            </div>
            <div className="flex items-center justify-between">
              <button onClick={doAuth} className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">{authMode === 'login' ? 'Login' : 'Register'}</button>
              <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-sm text-indigo-600 hover:underline">
                {authMode === 'login' ? 'Create an account' : 'Have an account? Login'}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default AIInterviewSystem;