import Typography from '@mui/material/Typography';

interface Props {
  content: string;
  maxChars?: number;
}

const DocumentPreview = (props: Props) => {
  const { content, maxChars = 50 } = props;

  const rawTextContent = content.replace(/<\/?[^>]+(>|$)/g, '');

  const contentPreview = rawTextContent.length > maxChars
    ? `${rawTextContent.slice(0, maxChars)}...`
    : rawTextContent;

  return (
    <Typography
      variant="body2"
      color="textSecondary"
    >
      {contentPreview}
    </Typography>
  );
};

export default DocumentPreview;
