import { Toaster } from "sonner";
import AppRoutes from "@/AppRoute";
import Loading from "@/components/Loading";
import ErrorBoundary from "@/components/error/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <Loading>
        <Toaster />
        <AppRoutes />
      </Loading>
    </ErrorBoundary>
  );
}

export default App;
