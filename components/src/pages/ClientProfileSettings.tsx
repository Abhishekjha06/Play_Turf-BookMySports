/**
 * Client Profile Settings page for managing profile, password, notifications, and audit logs.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/layout/MobileShell";
import { BackButton } from "@/components/layout/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Lock, Bell, History, Save, Eye, EyeOff, Key, LogOut } from "lucide-react";

const ClientProfileSettings = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Profile state
    const [profile, setProfile] = useState({
        companyName: "Arena 7 Sports Turf",
        clientId: "CLIENT_001",
        email: "owner@arena7.com",
        phone: "+91 9876543210",
    });

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Notification preferences
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        smsNotifications: true,
        bookingConfirmations: true,
        bookingCancellations: true,
    });

    // Audit logs mock data
    const auditLogs = [
        { id: 1, action: "Password changed", user: "System", timestamp: "2024-03-15 14:30:22", ip: "192.168.1.105" },
        { id: 2, action: "Booking accepted", user: "Rajesh Sharma", timestamp: "2024-03-15 11:15:45", ip: "192.168.1.105" },
        { id: 3, action: "Slot blocked", user: "Rajesh Sharma", timestamp: "2024-03-14 16:45:33", ip: "192.168.1.105" },
        { id: 4, action: "Profile updated", user: "Rajesh Sharma", timestamp: "2024-03-13 09:22:18", ip: "192.168.1.105" },
    ];

    useEffect(() => {
        const token = localStorage.getItem("client_token");
        if (!token) {
            navigate("/client/login");
        }
    }, [navigate]);

    const handleProfileUpdate = () => {
        setLoading(true);
        setTimeout(() => {
            toast.success("Profile updated successfully");
            setLoading(false);
        }, 1000);
    };

    const handlePasswordChange = () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New password and confirm password do not match");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setTimeout(() => {
            toast.success("Password changed successfully");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setLoading(false);
        }, 1000);
    };

    const handleNotificationToggle = (key: keyof typeof notifications) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSaveNotifications = () => {
        setLoading(true);
        setTimeout(() => {
            toast.success("Notification preferences saved");
            setLoading(false);
        }, 800);
    };

    const handleLogout = () => {
        localStorage.removeItem("client_token");
        localStorage.removeItem("client_id");
        toast.success("Logged out successfully");
        navigate("/client/login");
    };

    return (
        <MobileShell>
            <div className="min-h-screen bg-gray-950 text-white">
                {/* Header */}
                <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BackButton />
                        <div>
                            <h1 className="text-xl font-bold">Profile & Settings</h1>
                            <p className="text-sm text-gray-400">Manage your account and preferences</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout}>
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>

                {/* Main Content */}
                <div className="p-4">
                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid grid-cols-4 mb-6">
                            <TabsTrigger value="profile" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="hidden sm:inline">Profile</span>
                            </TabsTrigger>
                            <TabsTrigger value="security" className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                <span className="hidden sm:inline">Security</span>
                            </TabsTrigger>
                            <TabsTrigger value="notifications" className="flex items-center gap-2">
                                <Bell className="h-4 w-4" />
                                <span className="hidden sm:inline">Notifications</span>
                            </TabsTrigger>
                            <TabsTrigger value="audit" className="flex items-center gap-2">
                                <History className="h-4 w-4" />
                                <span className="hidden sm:inline">Audit Logs</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Profile Tab */}
                        <TabsContent value="profile" className="space-y-4">
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Company Profile
                                    </CardTitle>
                                    <CardDescription>Update your company information</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="companyName">Company Name</Label>
                                            <Input
                                                id="companyName"
                                                value={profile.companyName}
                                                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                                                className="bg-gray-900 border-gray-700"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="clientId">Client ID</Label>
                                            <Input
                                                id="clientId"
                                                value={profile.clientId}
                                                disabled
                                                className="bg-gray-900 border-gray-700"
                                            />
                                            <p className="text-xs text-gray-400">Client ID cannot be changed</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profile.email}
                                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                className="bg-gray-900 border-gray-700"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={profile.phone}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                className="bg-gray-900 border-gray-700"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <Button onClick={handleProfileUpdate} disabled={loading}>
                                            {loading ? "Saving..." : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security" className="space-y-4">
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lock className="h-5 w-5" />
                                        Change Password
                                    </CardTitle>
                                    <CardDescription>Update your password to keep your account secure</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">Current Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="currentPassword"
                                                    type={showPassword ? "text" : "password"}
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    className="bg-gray-900 border-gray-700 pr-10"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="bg-gray-900 border-gray-700"
                                            />
                                            <p className="text-xs text-gray-400">Password must be at least 6 characters</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="bg-gray-900 border-gray-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button onClick={handlePasswordChange} disabled={loading}>
                                            {loading ? "Updating..." : (
                                                <>
                                                    <Key className="h-4 w-4 mr-2" />
                                                    Change Password
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Notifications Tab */}
                        <TabsContent value="notifications" className="space-y-4">
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="h-5 w-5" />
                                        Notification Preferences
                                    </CardTitle>
                                    <CardDescription>Choose which notifications you want to receive</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Email Notifications</p>
                                                <p className="text-sm text-gray-400">Receive updates via email</p>
                                            </div>
                                            <Switch
                                                checked={notifications.emailNotifications}
                                                onCheckedChange={() => handleNotificationToggle("emailNotifications")}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">SMS Notifications</p>
                                                <p className="text-sm text-gray-400">Receive updates via SMS</p>
                                            </div>
                                            <Switch
                                                checked={notifications.smsNotifications}
                                                onCheckedChange={() => handleNotificationToggle("smsNotifications")}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Booking Confirmations</p>
                                                <p className="text-sm text-gray-400">Notify when bookings are confirmed</p>
                                            </div>
                                            <Switch
                                                checked={notifications.bookingConfirmations}
                                                onCheckedChange={() => handleNotificationToggle("bookingConfirmations")}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Booking Cancellations</p>
                                                <p className="text-sm text-gray-400">Notify when bookings are cancelled</p>
                                            </div>
                                            <Switch
                                                checked={notifications.bookingCancellations}
                                                onCheckedChange={() => handleNotificationToggle("bookingCancellations")}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button onClick={handleSaveNotifications} disabled={loading}>
                                            {loading ? "Saving..." : "Save Preferences"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Audit Logs Tab */}
                        <TabsContent value="audit" className="space-y-4">
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <History className="h-5 w-5" />
                                        Audit Logs
                                    </CardTitle>
                                    <CardDescription>Track all activities on your account</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {auditLogs.map((log) => (
                                            <div key={log.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                                                <div>
                                                    <p className="font-medium">{log.action}</p>
                                                    <p className="text-sm text-gray-400">By {log.user} • {log.timestamp}</p>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {log.ip}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-center pt-4">
                                        <p className="text-sm text-gray-400">Showing {auditLogs.length} most recent activities</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </MobileShell>
    );
};

export default ClientProfileSettings;
