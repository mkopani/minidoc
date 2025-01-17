import ArticleIcon from '@mui/icons-material/Article';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { useState } from 'react';

import type { Document } from '@/models';
import { formatUpdatedAt } from '@/util/general';

interface Props {
  document: Document;
  onClick: (document: Document) => void;
  onDelete: (document: Document) => Promise<void>;
}

const DocumentRow = (props: Props) => {
  const { document, onClick, onDelete } = props;
  const { title, updated_at } = document;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = (event: React.MouseEvent) => {
    event.stopPropagation();
    setDeleteDialogOpen(false);
  };

  const handleDeleteDocument = async (event: React.MouseEvent) => {
    event.stopPropagation();

    await onDelete(document);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <TableRow
        hover
        onClick={() => onClick(document)}
        sx={{ cursor: 'pointer' }}
      >
        <TableCell padding="checkbox" align="center">
          <ArticleIcon color="primary" />
        </TableCell>

        <TableCell align="left" sx={{ fontWeight: 500 }}>
          {title}
        </TableCell>

        <TableCell align="left" color="textSecondary">
          {/* TODO: Re-enable after extracting readable text from YDoc state */}
          {/* <DocumentPreview content={content} /> */}
          &nbsp;
        </TableCell>

        <TableCell align="left">{formatUpdatedAt(updated_at)}</TableCell>

        <TableCell align="right">
          <IconButton onClick={handleDeleteButtonClick}>
            <DeleteIcon color="secondary" />
          </IconButton>
        </TableCell>
      </TableRow>
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this document? This action is
            irreversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDeleteDocument} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DocumentRow;
