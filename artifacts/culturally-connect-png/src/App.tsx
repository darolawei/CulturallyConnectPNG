import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import MapPage from "@/pages/Map";
import ProvinceDashboard from "@/pages/Province";
import ReviewPage from "@/pages/Review";
import AdminPage from "@/pages/Admin";
import { AuthProvider, RequireAuth } from "@/lib/auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/map">
        <RequireAuth roles={["visitor", "contributor", "reviewer", "admin"]}>
          <MapPage />
        </RequireAuth>
      </Route>
      <Route path="/province/:id">
        <RequireAuth roles={["visitor", "contributor", "reviewer", "admin"]}>
          <ProvinceDashboard />
        </RequireAuth>
      </Route>
      <Route path="/review">
        <RequireAuth roles={["reviewer", "admin"]}>
          <ReviewPage />
        </RequireAuth>
      </Route>
      <Route path="/admin">
        <RequireAuth roles={["admin"]}>
          <AdminPage />
        </RequireAuth>
      </Route>
      <Route component={NotFound} />
    </Switch>
    
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
