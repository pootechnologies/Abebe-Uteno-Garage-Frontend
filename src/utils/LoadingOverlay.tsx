import { Spinner } from "@/components/ui/spinner.tsx";
import { Box } from "@mui/material";

const LoadingOverlay = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <Spinner />
    </Box>
  );
};

export default LoadingOverlay;
