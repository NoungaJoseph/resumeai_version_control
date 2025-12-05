import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ResumeProvider } from './context/ResumeContext';
import { LandingPage } from './components/LandingPage';
import { EditPage } from './pages/EditPage';
import { PreviewPage } from './pages/PreviewPage';
import './index.css';

function AppContent() {
  const [showLanding, setShowLanding] = useState(() => {
    return localStorage.getItem('hasStarted') !== 'true';
  });

  const handleStartApp = () => {
    setShowLanding(false);
    localStorage.setItem('hasStarted', 'true');
  };

  if (showLanding) {
    return <LandingPage onStart={handleStartApp} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/edit" replace />} />
        <Route path="/edit" element={<EditPage />} />
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <ResumeProvider>
      <AppContent />
    </ResumeProvider>
  );
}
