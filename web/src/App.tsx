import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import DocumentEditorPage from '@/pages/DocumentEditorPage';
import DocumentsListPage from '@/pages/DocumentsListPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DocumentsListPage />} />
        <Route path="/documents/:id" element={<DocumentEditorPage />} />
      </Routes>
    </Router>
  );
}

export default App
