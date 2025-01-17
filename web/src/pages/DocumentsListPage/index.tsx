import FolderOffOutlinedIcon from '@mui/icons-material/FolderOffOutlined';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import api from '@/api';
import DocumentsList from '@/components/DocumentsList';
import Layout from '@/components/Layout';
import { Document } from '@/models';

import CreateDocumentButton from './CreateDocumentButton';

const DocumentsListPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);

  // Fetch documents from API
  const fetchDocuments = async () => {
    try {
      const response = await api.get<Document[]>('/documents/');
      setDocuments(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch documents on initial render
  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <Layout>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="div">
          My Documents
        </Typography>
        {/* Only show New Document button if documents already exist */}
        {documents.length ? (
          <CreateDocumentButton>New Document</CreateDocumentButton>
        ) : null}
      </Box>

      {/* Documents view */}
      {documents.length ? (
        <DocumentsList
          documents={documents}
          onSuccessfulDelete={fetchDocuments}
        />
      ) : (
        // Display notice if no documents found
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
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
