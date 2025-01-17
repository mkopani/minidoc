import CircularProgress, { CircularProgressProps } from '@mui/material/CircularProgress';

const LoadingSpinner = (props: CircularProgressProps) => (
  <CircularProgress color="primary" size="3rem" {...props} />
);

export default LoadingSpinner;
