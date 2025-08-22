import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ResumeAnalysisPage from './routes/ResumeAnalysisPage.jsx'
import InterviewDetailsPage from './routes/InterviewDetailsPage.jsx'
import AboutPage from './routes/AboutPage.jsx'
import ContactPage from './routes/ContactPage.jsx'
import ServicesPage from './routes/ServicesPage.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/resume-analysis" element={<ResumeAnalysisPage />} />
        <Route path="/interview/:sessionId" element={<InterviewDetailsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/services" element={<ServicesPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
