import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/layout/MobileShell";
import { BackButton } from "@/components/layout/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

const ClientLogin = () => {
    const navigate = useNavigate();
    const [clientId, setClientId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleClientLogin = async () => {
        if (!clientId.trim() || !password.trim()) {
            toast.error("Please enter client ID and password");
            return;
        }
        setLoading(true);
        try {
            // For demo, accept specific test credentials
            if (clientId.trim() === "abhishek1018@" && password === "123456789") {
                localStorage.setItem("client_token", "mock_client_token_abhishek");
                localStorage.setItem("client_id", "abhishek1018@");
                toast.success("Login successful - Welcome Abhishek!");
                navigate("/client/dashboard");
            } else {
                // Try API login (mock for now)
                const user = await api.clientLogin(clientId.trim(), password);
                if (user) {
                    localStorage.setItem("client_token", "mock_client_token");
                    localStorage.setItem("client_id", clientId.trim());
                    toast.success("Login successful");
                    navigate("/client/dashboard");
                } else {
                    toast.error("Invalid client ID or password");
                }
            }
        } catch (error) {
            toast.error((error as Error).message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    const handleMockLogin = async () => {
        // For demo purposes, simulate client login with test credentials
        localStorage.setItem("client_token", "mock_client_token_abhishek");
        localStorage.setItem("client_id", "abhishek1018@");
        toast.success("Mock login with test credentials successful");
        navigate("/client/dashboard");
    };

    return (
        <MobileShell>
            <BackButton />
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
                <div className="max-w-md mx-auto pt-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl font-bold text-center mb-2">Client Panel</h1>
                        <p className="text-gray-400 text-center mb-8">
                            Turf owners & managers – access your dashboard
                        </p>
                    </motion.div>

                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-white">Client Login</CardTitle>
                            <CardDescription className="text-gray-400">
                                Enter your client credentials to manage your turf
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="clientId" className="text-gray-300">
                                        Client ID
                                    </Label>
                                    <Input
                                        id="clientId"
                                        type="text"
                                        placeholder="e.g., turf_owner_123"
                                        value={clientId}
                                        onChange={(e) => setClientId(e.target.value)}
                                        className="bg-gray-900 border-gray-700 text-white"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="password" className="text-gray-300">
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-gray-900 border-gray-700 text-white"
                                    />
                                </div>
                                <Button
                                    onClick={handleClientLogin}
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                    {loading ? "Logging in..." : "Login as Client"}
                                </Button>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-gray-700" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-gray-800 px-2 text-gray-500">Demo</span>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handleMockLogin}
                                    className="w-full border-gray-600 text-gray-300"
                                >
                                    Try Demo Client Dashboard
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-8 text-center text-gray-500 text-sm">
                        <p>
                            Not a client?{" "}
                            <a href="/login" className="text-blue-400 hover:underline">
                                Go to user login
                            </a>
                        </p>
                        <p className="mt-2">
                            Forgot your credentials? Contact support at support@playturf.com
                        </p>
                    </div>
                </div>
            </div>
        </MobileShell>
    );
};

export default ClientLogin;