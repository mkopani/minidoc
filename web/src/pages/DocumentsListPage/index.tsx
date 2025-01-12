import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FolderOffOutlinedIcon from '@mui/icons-material/FolderOffOutlined';

import api from '@/api';
import DocumentsList from "@/components/DocumentsList";
import Layout from "@/components/Layout";

import CreateDocumentButton from './CreateDocumentButton';
import { useEffect, useState } from 'react';
import { Document } from '@/models';

const DocumentsListPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);

  const fetchDocuments = async () => {
    try {
      const response = await api.get<Document[]>('/documents/');
      setDocuments(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <Layout>
      <Typography variant="h4" mb={3}>My Documents</Typography>

      {documents.length ? (
        <DocumentsList documents={documents} onSuccessfulDelete={fetchDocuments} />
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Stack spacing={2} direction="column" alignItems="center">
            <Box>
              <FolderOffOutlinedIcon color="secondary" sx={{ fontSize: 200 }} />
            </Box>
            <Box textAlign="center">
              <Typography variant="h6">No documents found</Typography>
              <Typography color="textSecondary">
                Ready to get started?
              </Typography>
            </Box>
            <Box>
              <CreateDocumentButton />
            </Box>
          </Stack>
        </Box>
      )}
    </Layout>
  );
};

export default DocumentsListPage;