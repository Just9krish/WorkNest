import React, { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Github, Chrome, LoaderCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const AuthComponent: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, [navigate]);

  const handleOAuthLogin = async (provider: "github" | "google") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <LoaderCircle className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card>
        <CardHeader>
          <CardTitle className="sr-only">Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-primary to-secondary font-bold text-primary-foreground text-4xl">
              W
            </div>
            <h1 className="text-3xl font-bold ">Welcome to Worknest</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to access your workspace.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <Button
              onClick={() => handleOAuthLogin("google")}
              className="w-full"
            >
              <Chrome className="mr-3 h-5 w-5" />
              Sign in with Google
            </Button>
            <Button
              onClick={() => handleOAuthLogin("github")}
              className="w-full"
            >
              <Github className="mr-3 h-5 w-5" />
              Sign in with GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthComponent;
