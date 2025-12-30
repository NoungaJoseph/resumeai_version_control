import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ResumeProvider } from './context/ResumeContext';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './components/LandingPage';
import { EditPage } from './pages/EditPage';
import { PreviewPage } from './pages/PreviewPage';
import { TypeSelection } from './pages/Selection/TypeSelection';
import { TemplateGallery } from './pages/Selection/TemplateGallery';
import './index.css';

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/select-type" element={<TypeSelection />} />
        <Route path="/select-template" element={<TemplateGallery />} />
        <Route path="/edit" element={<EditPage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ResumeProvider>
        <AppContent />
      </ResumeProvider>
    </AuthProvider>
  );
}
