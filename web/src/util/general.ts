/**
 * Format the date to a readable and relative format.
 */
export const formatUpdatedAt = (date: string) => {
  let updatedAtReadable = '';
  const updatedAtDate = new Date(date);
  const now = new Date();
  // Calculate the difference in milliseconds
  const diff = now.getTime() - updatedAtDate.getTime();

  // Compute different time units
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

  return updatedAtReadable;
};
