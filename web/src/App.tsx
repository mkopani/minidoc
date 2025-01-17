import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import ProtectedRoute from '@/components/ProtectedRoute';
import DocumentEditorPage from '@/pages/DocumentEditorPage';
import DocumentsListPage from '@/pages/DocumentsListPage';
import LoginPage from '@/pages/Login';


function App() {
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
