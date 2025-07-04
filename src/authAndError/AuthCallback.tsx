import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/authAndError/AuthContext";

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        console.error("GitHub OAuth error:", error);
        navigate("/?error=auth_failed");
        return;
      }

      if (code) {
        try {
          const response = await fetch(
            "http://localhost:4000/auth/github/callback",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ code }),
            }
          );

          const data = await response.json();

          if (data.success) {
            // Refresh auth context and then redirect
            await checkAuthStatus();
            setTimeout(() => {
              window.location.href = "/";
            }, 100);
          } else {
            console.error("Auth callback failed:", data);
            navigate("/?error=auth_failed");
          }
        } catch (error) {
          console.error("Authentication failed:", error);
          navigate("/?error=auth_failed");
        }
      }
    };

    handleCallback();
  }, [searchParams, navigate, checkAuthStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-foreground font-body">
          Completing authentication...
        </p>
        <p className="mt-2 text-sm text-muted-foreground font-body">
          Please wait while we sign you in...
        </p>
      </div>
    </div>
  );
};
