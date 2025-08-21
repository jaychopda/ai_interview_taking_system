import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ResumeAnalysisPage from './routes/ResumeAnalysisPage.jsx'
import InterviewDetailsPage from './routes/InterviewDetailsPage.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/resume-analysis" element={<ResumeAnalysisPage />} />
        <Route path="/interview/:sessionId" element={<InterviewDetailsPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
