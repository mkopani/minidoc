import ArticleIcon from '@mui/icons-material/Article';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar, { SnackbarProps } from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import api from '@/api';
import DocumentEditor from '@/components/DocumentEditor';
import Layout from '@/components/Layout';
import { Document } from '@/models';
import { formatUpdatedAt } from '@/util/general';

import TitleInputField from './TitleInputField';

// TODO: Look at moving WebSocket logic and methods back into this file
const DocumentEditorPage = () => {
  const { id } = useParams<{ id?: string }>();
  // TODO: Start WebSocket connection for real-time collaboration

  const isNewDocument = !id;

  const [snackbars, setSnackbars] = useState<SnackbarProps[]>([]);
  const [title, setTitle] = useState<string>('Untitled document');
  const [editingTitle, setEditingTitle] = useState<boolean>(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>('');

  // TODO: Re-enable loading state after refining WebSocket
  // const isLoading = !(isNewDocument);

  // const queueSnackbar = (snackbar: SnackbarProps) => {
  //   setSnackbars((prev) => [...prev, snackbar]);
  // };

  const fetchDocument = async () => {
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

  const handleFinishEditingTitle = async () => {
    setEditingTitle(false);
    let newTitle = title.trim();
    if (!newTitle) {
      newTitle = 'Untitled document';
      setTitle(title);
    }

    // TODO: Send message to WebSocket with eventType `UPDATE_TITLE`
    // await saveDocument(title);
    // sendMessage({ content, title: newTitle });
  };

// TODO: Uncomment after implementing collaborators dialog
  // const handleOpenCollabDialog = () => {
  //   // setDialogOpen(true);

  //   console.log('Collaborators dialog open');
  // };

  // const handleCloseCollabDialog = () => {
  //   setDialogOpen(false);
  // };

  useEffect(() => {
    if (!isNewDocument) {
      fetchDocument();
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

          {/* TODO: Implement after finishing authentication */}
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            justifyContent: 'center',
            // alignItems: isLoading ? 'center' : undefined,
          }}
        >
          <DocumentEditor documentId={id} />
          {/* {isLoading || !id ? (
            <CircularProgress color="primary" size="3rem" />
          ) : (
            <DocumentEditor
              documentId={id}
              // currentContent={content}
              // onChange={handleChangeContent}
            />
          )} */}
        </Box>
      </Stack>

      {/* TODO: Implement collaborators dialog */}
      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={index}
          {...snackbar}
          onClose={() =>
            setSnackbars((prev) => prev.filter((_, i) => i !== index))
          }
        />
      ))}
    </Layout>
  );
};

export default DocumentEditorPage;
