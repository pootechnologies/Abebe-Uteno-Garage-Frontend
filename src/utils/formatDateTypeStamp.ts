export const formatDateTypeStamp = (isoString: string) => {
  const date = new Date(isoString);

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  };

  return date.toLocaleString("en-GB", options); // Day/Month/Year format
};
