// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LogoIcon from "@/assets/logo-icon.png";

export default function Login() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // If already logged in, redirect to dashboard
    if (user) return <Navigate to="/dashboard" replace />;

    const from = location.state?.from?.pathname || "/dashboard";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await login({ email, password });
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-lg border p-8">

                {/* Logo + Title */}
                <div className="flex flex-col items-center mb-8">
                    <img src={LogoIcon} alt="DevConnect" className="h-10 w-10 mb-3" />
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Sign in to your DevConnect account
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={submitting}
                        />
                    </div>

                    <div>
                        <Label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={submitting}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md
                       hover:shadow-xl transition-all duration-300 hover:scale-[1.01]
                       disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Signing in...
                            </span>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>

                {/* Register link */}
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link to="/register" className="font-medium text-blue-600 hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
