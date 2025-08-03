import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { TimerProvider } from './context/TimerContext';
import { useAuth } from './hooks/useAuth';

// Layout Components
import Layout from './components/common/Layout';
import PrivateRoute from './components/common/PrivateRoute';
import PublicRoute from './components/common/PublicRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudyRecord from './pages/student/StudyRecord';
import AddStudyRecord from './pages/student/AddStudyRecord';
import AddMockExam from './pages/student/AddMockExam';
import MockExams from './pages/student/MockExams';
import StudyHistory from './pages/student/StudyHistory';
import StudyTimer from './pages/student/StudyTimer';
import StudentProfile from './pages/student/StudentProfile';
import Statistics from './pages/student/Statistics';

// Coach Pages
import CoachDashboard from './pages/coach/CoachDashboard';
import CoachProfile from './pages/coach/CoachProfile';
import StudentTasks from './pages/coach/StudentTasks';
import StudentStatistics from './pages/coach/StudentStatistics';

// Common Pages
import NotFound from './pages/common/NotFound';
import Loading from './components/common/Loading';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
      <div>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <PublicRoute>
              <Navigate to={user ? (user.role === 'student' ? '/dashboard' : '/coach/dashboard') : '/login'} replace />
            </PublicRoute>
          } />
          
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          {/* Register disabled - only admin access */}
          <Route path="/register" element={<Navigate to="/login" replace />} />
          
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />

          {/* Student Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute roles={['student']}>
              <Layout>
                <StudentDashboard />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/statistics" element={
            <PrivateRoute roles={['student']}>
              <Layout>
                <Statistics />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/study/record" element={
            <PrivateRoute roles={['student']}>
              <Layout>
                <StudyRecord />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/study/add" element={
            <PrivateRoute roles={['student']}>
              <Layout>
                <AddStudyRecord />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/exam/add" element={
            <PrivateRoute roles={['student']}>
              <Layout>
                <AddMockExam />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/exam/edit/:id" element={
            <PrivateRoute roles={['student']}>
              <Layout>
                <AddMockExam />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/mock-exams" element={
            <PrivateRoute roles={['student']}>
              <Layout>
                <MockExams />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/exams" element={
            <PrivateRoute roles={['student']}>
              <Layout>
                <MockExams />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/study/history" element={
            <PrivateRoute roles={['student']}>
              <Layout>
                <StudyHistory />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/study/timer" element={
            <PrivateRoute roles={['student']}>
              <Layout>
                <StudyTimer />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute roles={['student']}>
              <Layout>
                <StudentProfile />
              </Layout>
            </PrivateRoute>
          } />
          

          {/* Coach Routes */}
          <Route path="/coach/dashboard" element={
            <PrivateRoute roles={['coach']}>
              <Layout>
                <CoachDashboard />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/coach/profile" element={
            <PrivateRoute roles={['coach']}>
              <Layout>
                <CoachProfile />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/coach/student/:studentId/tasks" element={
            <PrivateRoute roles={['coach']}>
              <Layout>
                <StudentTasks />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/coach/student/:studentId/statistics" element={
            <PrivateRoute roles={['coach']}>
              <Layout>
                <StudentStatistics />
              </Layout>
            </PrivateRoute>
          } />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <TimerProvider>
        <AppRoutes />
      </TimerProvider>
    </AuthProvider>
  );
}

export default App;