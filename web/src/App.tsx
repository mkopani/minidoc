import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import ProtectedRoute from '@/components/ProtectedRoute';
import DocumentEditorPage from '@/pages/DocumentEditorPage';
import DocumentsListPage from '@/pages/DocumentsListPage';
import LoginPage from '@/pages/Login';

import { refreshCSRFToken } from './api';

function App() {
  const dispatch = useDispatch();

  // Set CSRF token on load
  useEffect(() => {
    const initialize = async () => {
      try {
        await refreshCSRFToken();
      } catch (error) {
        console.error('Failed to refresh CSRF token:', error);
      }
    };
    initialize();
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Documents list */}
        <Route
          path="/"
          element={<ProtectedRoute element={<DocumentsListPage />} />}
        />

        {/* Edit document */}
        <Route
          path="/document/:id"
          element={<ProtectedRoute element={<DocumentEditorPage />} />}
        />

        {/* Create document */}
        <Route
          path="/document"
          element={<ProtectedRoute element={<DocumentEditorPage />} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
