import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';

import DocumentEditorPage from '@/pages/DocumentEditorPage';
import DocumentsListPage from '@/pages/DocumentsListPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Documents list */}
        <Route path="/" element={<DocumentsListPage />} />
        {/* Edit document */}
        <Route path="/document/:id" element={<DocumentEditorPage />} />
        {/* Create document */}
        <Route path="/document" element={<DocumentEditorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
