import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import i18n from '../src/i18n.ts'
import ErrorBoundary from "@/utils/ErrorBoundary.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary fallback={<h2>Something went wrong while loading the app.</h2>}>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="top-center" reverseOrder={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
