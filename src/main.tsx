import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "./index.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});


createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
