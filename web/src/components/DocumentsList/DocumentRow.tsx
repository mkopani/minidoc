import TableRow from '@mui/material/TableRow';
import ArticleIcon from '@mui/icons-material/Article';
import TableCell from '@mui/material/TableCell';

import type { Document } from '@/models';
import { Typography } from '@mui/material';

interface Props {
  document: Document;
  onClick: (document: Document) => void;
}

const PREVIEW_LIMIT = 50;

const DocumentRow = (props: Props) => {
  const { document, onClick } = props;
  const { title, content, updated_at } = document;

  // Make updated_at human-readable
  const updatedAtDate = new Date(updated_at);
  const now = new Date();
  const diff = now.getTime() - updatedAtDate.getTime();
  let updatedAtReadable = '';
  if (diff < 1000) {
    updatedAtReadable = 'now';
  } else if (diff < 60 * 1000) {
    const seconds = Math.floor(diff / 1000);
    updatedAtReadable = `${seconds} second${seconds === 1 ? '' : 's'} ago`;
  } else if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    updatedAtReadable = `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    updatedAtReadable = `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    updatedAtReadable = `${days} day${days === 1 ? '' : 's'} ago`;
  }

  const contentPreview = content.length > PREVIEW_LIMIT
    ? `${content.slice(0, PREVIEW_LIMIT)}...` :
    content;

  return (
    <TableRow
      hover
      onClick={() => onClick(document)}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell padding="checkbox" align="center">
        <ArticleIcon color="primary" />
      </TableCell>

      <TableCell align="left">{title}</TableCell>
      <TableCell align="left" color="textSecondary">
        <Typography color="textSecondary" variant="body2">
          {contentPreview}
        </Typography>
      </TableCell>
      <TableCell align="left">{updatedAtReadable}</TableCell>
    </TableRow>
  );

};

export default DocumentRow;
