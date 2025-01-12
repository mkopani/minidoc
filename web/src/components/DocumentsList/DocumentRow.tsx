import TableRow from '@mui/material/TableRow';
import ArticleIcon from '@mui/icons-material/Article';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import type { Document } from '@/models';
import { formatUpdatedAt } from '@/util/general';

interface Props {
  document: Document;
  onClick: (document: Document) => void;
}

const PREVIEW_LIMIT = 50;

const DocumentRow = (props: Props) => {
  const { document, onClick } = props;
  const { title, content, updated_at } = document;

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
      <TableCell align="left">{formatUpdatedAt(updated_at)}</TableCell>
    </TableRow>
  );

};

export default DocumentRow;
