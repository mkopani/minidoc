import Typography from '@mui/material/Typography';

import { generateMockDocuments } from "@/__mock__/documents";
import DocumentsList from "@/components/DocumentsList";
import Layout from "@/components/Layout";

const DocumentsListPage = () => {
  // TODO: Fetch documents from API
  const documents = generateMockDocuments(7);

  return (
    <Layout>
      <Typography variant="h4" mb={3}>My Documents</Typography>

      {/* TODO: Implement "no documents" notice */}
      <DocumentsList documents={documents} />
    </Layout>
  );
};

export default DocumentsListPage;