export const formatDateForInput = (
  isoString: string | null | undefined
): string => {
  if (!isoString) return "";
  return new Date(isoString).toISOString().split("T")[0];
};
