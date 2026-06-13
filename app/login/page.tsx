"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DEMO_ACCOUNTS = [
  { email: "demo@example.com", password: "Demo@12345", name: "Demo Agent" },
  { email: "agent@insurance.com", password: "Agent@2024", name: "Insurance Agent" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simple validation - check against demo accounts
    const account = DEMO_ACCOUNTS.find(
      (acc) => acc.email === email && acc.password === password
    );

    if (account) {
      // Store in localStorage for this session
      localStorage.setItem("currentUser", JSON.stringify({
        email: account.email,
        name: account.name,
      }));
      router.push("/dashboard");
    } else {
      setError("Invalid email or password. Use demo credentials below.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">InsureAgent</h1>
          <p className="text-muted-foreground">Policy Reminder System</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="bg-accent/5">
          <CardHeader>
            <CardTitle className="text-base">Demo Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {DEMO_ACCOUNTS.map((account, idx) => (
              <div key={idx} className="space-y-1 p-2 bg-background rounded border border-border">
                <p className="text-xs font-medium text-muted-foreground">Account {idx + 1}</p>
                <p className="text-sm"><code className="bg-muted px-1 py-0.5 rounded">{account.email}</code></p>
                <p className="text-sm"><code className="bg-muted px-1 py-0.5 rounded">{account.password}</code></p>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Use any of the above credentials to login and explore the demo.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
