// import PersonAddIcon from '@mui/icons-material/PersonAdd';
// import Button from '@mui/material/Button';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArticleIcon from '@mui/icons-material/Article';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import * as Y from 'yjs';

import api from '@/api';
import DocumentEditor from '@/components/DocumentEditor';
import FullSpanBox from '@/components/FullSpanBox';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import useWebsocketProvider from '@/hooks/useWebsocketProvider';
import { Document } from '@/models';
import { formatUpdatedAt } from '@/util/general';

import TitleInputField from './TitleInputField';

// TODO: Look at moving WebSocket logic and methods back into this file
const DocumentEditorPage = () => {
  const { id } = useParams<{ id?: string }>();

  const isNewDocument = !id;

  const [title, setTitle] = useState<string>('Untitled document');
  const [editingTitle, setEditingTitle] = useState<boolean>(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const idRef = useRef(id || uuid());
  const yDocRef = useRef(new Y.Doc());

  useEffect(() => {
    // Initialize 'content' field in Y.Doc
    yDocRef.current.getText('content');

    if (!id) {
      // Generate new uuid and replace the current URL
      window.history.replaceState(null, '', `/document/${idRef.current}`);
    }
  }, []);

  const handleTitleUpdate = (title: string) => {
    setTitle(title);
  };

  const handleSave = () => {
    setLastUpdatedAt(new Date().toISOString());
  };

  const handleLoad = () => {
    setLoading(false);
  };

  const { publishSaveDocument, publishUpdateTitle } = useWebsocketProvider({
    documentId: idRef.current,
    yDocRef,
    onTitleUpdate: handleTitleUpdate,
    onSave: handleSave,
    onLoad: handleLoad,
  });

  const fetchDocumentMetadata = async () => {
    const { data } = await api.get<Document>(`/documents/${id}`);

    setTitle(data.title);
    setLastUpdatedAt(data.updated_at);
  };

  const handleStartEditingTitle = () => {
    setEditingTitle(true);
  };

  const handleChangeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleFinishEditingTitle = () => {
    setEditingTitle(false);
    const newTitle = title.trim() || 'Untitled document';
    setTitle(newTitle);
    publishUpdateTitle(newTitle);
  };

  // TODO: Uncomment after implementing collaborators dialog
  // const handleOpenCollabDialog = () => {
  //   // setDialogOpen(true);

  //   console.log('Collaborators dialog open');
  // };

  // const handleCloseCollabDialog = () => {
  //   setDialogOpen(false);
  // };

  // Publish a save event when user presses Cmd+S on Mac or Ctrl+S on Windows
  const handleSaveShortcut = useCallback((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 's') {
      event.preventDefault();
      publishSaveDocument();
    }
  }, []);

  // Add listener for save shortcut
  useEffect(() => {
    window.addEventListener('keydown', handleSaveShortcut);
    return () => {
      window.removeEventListener('keydown', handleSaveShortcut);
    };
  }, [handleSaveShortcut]);

  // Fetch document metadata when page loads if document already exists
  useEffect(() => {
    if (!isNewDocument) {
      fetchDocumentMetadata();
    }
  }, [isNewDocument]);

  return (
    <Layout>
      <Stack spacing={2} direction="column" height="100%">
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Stack
            spacing={1}
            direction="row"
            alignItems="center"
            sx={{ display: 'flex' }}
          >
            <IconButton
              color="primary"
              size="small"
              // TODO: Define routes.ts and use dashboard route here
              onClick={() => window.history.back()}
            >
              <ArrowBackIosNewIcon />
            </IconButton>
            <ArticleIcon color="primary" />
            {editingTitle ? (
              <TitleInputField
                value={title}
                onChange={handleChangeTitle}
                onBlur={handleFinishEditingTitle}
              />
            ) : (
              <Tooltip title="Click to edit" arrow>
                <Typography
                  variant="h6"
                  component="div"
                  fontWeight={500}
                  sx={{
                    '&:hover': {
                      color: 'primary.main',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    },
                  }}
                  onClick={handleStartEditingTitle}
                >
                  {title || 'Untitled document'}
                </Typography>
              </Tooltip>
            )}
            {lastUpdatedAt ? (
              <Typography variant="body1" color="textSecondary">
                {formatUpdatedAt(lastUpdatedAt)}
              </Typography>
            ) : null}
          </Stack>

          {/* TODO: Uncomment after implementing collaboration */}
          {/* <Box>
            <Button
              onClick={handleOpenCollabDialog}
              variant="contained"
              color="primary"
              size="small"
              startIcon={<PersonAddIcon />}
            >
              Collaborate
            </Button>
          </Box> */}
        </Box>

        {/* Document editor */}
        <FullSpanBox alignItems={loading ? 'center' : undefined}>
          {loading ? <LoadingSpinner /> : <DocumentEditor yDocRef={yDocRef} />}
        </FullSpanBox>
      </Stack>
    </Layout>
  );
};

export default DocumentEditorPage;
