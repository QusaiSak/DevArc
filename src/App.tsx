import { ThemeProvider } from "@/components/ui/theme-provider";
import { Home } from "./pages/home";
import { Dashboard } from "./pages/project";
import Dashboard1 from "./pages/Dashboard";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthCallback } from "./authAndError/AuthCallback";
import { Navbar } from "./components/ui/navbar";
import RepositoryDetailsPage from "./pages/RepositoryDetails";
import { Toaster } from "sonner";
import { AuthProvider } from "./authAndError/AuthContext";
import { ProtectedRoute } from "./helper/ProtectedRoute";
import CreateProjectPage from "./pages/CreateProject";
import ProjectViewPage from "./pages/ProjectView";
import { Pricing } from "./pages/Pricing";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <Dashboard1 />
                </ProtectedRoute>
              }
            />
            <Route path="/create-project" element={<CreateProjectPage />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/projects/:id" element={<ProjectViewPage />} />
            <Route
              path="/repository/:owner/:repo"
              element={<RepositoryDetailsPage />}
            />
            <Route path="/auth/callback" element={<AuthCallback />} />

            <Route
              path="*"
              element={<div className="p-4">Page Not Found</div>}
            />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
