import Typography from '@mui/material/Typography';

import { generateMockDocuments } from "@/__mock__/documents";
import DocumentsList from "@/components/DocumentsList";
import Layout from "@/components/Layout";

const DocumentsListPage = () => {
  const mockDocuments = generateMockDocuments(7);
  return (
    <Layout>
      <Typography variant="h4" mb={3}>My Documents</Typography>

      <DocumentsList documents={mockDocuments} />
    </Layout>
  );
};

export default DocumentsListPage;