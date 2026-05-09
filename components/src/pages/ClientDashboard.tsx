import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/layout/MobileShell";
import { BackButton } from "@/layout/BackButton";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Badge } from "@/ui/badge";
import { Progress } from "@/ui/progress";
import { Calendar } from "@/ui/calendar";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
    BarChart3,
    CalendarDays,
    DollarSign,
    Users,
    Clock,
    Shield,
    Image,
    Video,
    Settings,
    Bell,
    LogOut,
    TrendingUp,
    PieChart,
    Wifi,
    WifiOff,
} from "lucide-react";
import { websocket, useWebSocket } from "@/lib/websocket";
import { useAuth } from "@/hooks/use-auth";
import { isMockMode } from "@/lib/api";

const ClientDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [loading, setLoading] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const [realTimeUpdates, setRealTimeUpdates] = useState<any[]>([]);
    const ws = useWebSocket();

    // Mock data for dashboard
    const summaryCards = [
        { title: "Total Bookings", value: "142", change: "+12%", icon: <BarChart3 className="h-5 w-5" />, color: "bg-blue-500" },
        { title: "Today's Bookings", value: "8", change: "+2", icon: <CalendarDays className="h-5 w-5" />, color: "bg-green-500" },
        { title: "Revenue", value: "₹ 1,24,500", change: "+18%", icon: <DollarSign className="h-5 w-5" />, color: "bg-purple-500" },
        { title: "Available Slots", value: "24", change: "-3", icon: <Clock className="h-5 w-5" />, color: "bg-amber-500" },
        { title: "Blocked Slots", value: "6", change: "+1", icon: <Shield className="h-5 w-5" />, color: "bg-red-500" },
        { title: "Pending Approvals", value: "3", change: "-1", icon: <Users className="h-5 w-5" />, color: "bg-orange-500" },
        { title: "Total Reviews", value: "89", change: "+5", icon: <TrendingUp className="h-5 w-5" />, color: "bg-teal-500" },
        { title: "Occupancy Rate", value: "78%", change: "+4%", icon: <PieChart className="h-5 w-5" />, color: "bg-indigo-500" },
    ];

    const recentBookings = [
        { id: 1, customer: "Rahul Sharma", time: "10:00 AM - 12:00 PM", status: "Confirmed", amount: "₹ 2,400" },
        { id: 2, customer: "Priya Patel", time: "2:00 PM - 4:00 PM", status: "Pending", amount: "₹ 3,000" },
        { id: 3, customer: "Amit Kumar", time: "6:00 PM - 8:00 PM", status: "Confirmed", amount: "₹ 3,600" },
        { id: 4, customer: "Neha Singh", time: "8:00 PM - 10:00 PM", status: "Cancelled", amount: "₹ 4,000" },
    ];

    const handleLogout = async () => {
        localStorage.removeItem("client_token");
        localStorage.removeItem("client_id");
        // Also sign out from the auth store
        const { signOut } = await import("@/lib/auth");
        await signOut();
        toast.success("Logged out successfully");
        navigate("/more");
    };

    const handleNavigate = (path: string) => {
        navigate(path);
    };

    // Check if client is logged in and connect to WebSocket (only in real backend mode)
    useEffect(() => {
        // In mock mode, skip WebSocket and client_token checks — auth store is sufficient
        if (isMockMode) {
            // Simulate some real-time updates with mock data
            const mockUpdates = [
                { type: "booking", message: "New booking: Rahul Sharma", timestamp: "10:30 AM" },
                { type: "slot", message: "Slot 14:00-16:00 now available", timestamp: "10:15 AM" },
                { type: "booking", message: "Booking confirmed: Priya Patel", timestamp: "09:45 AM" },
            ];
            setRealTimeUpdates(mockUpdates);
            return;
        }

        const token = localStorage.getItem("client_token");
        if (!token) {
            navigate("/client/login");
            return;
        }

        // Connect to WebSocket (only when real backend is available)
        ws.connect(token);

        // Subscribe to WebSocket events
        const unsubscribeConnected = ws.on("connected", () => {
            setWsConnected(true);
            toast.success("Real-time updates connected");

            // Subscribe to turf updates (mock turf ID - in real app, get from user data)
            const turfId = localStorage.getItem("client_turf_id") || "1";
            ws.subscribeToTurf(turfId);
        });

        const unsubscribeDisconnected = ws.on("disconnected", () => {
            setWsConnected(false);
        });

        const unsubscribeBookingUpdated = ws.on("booking_updated", (data) => {
            setRealTimeUpdates(prev => [...prev.slice(-4), {
                type: "booking",
                message: `Booking updated: ${data.booking?.customer_name || "Unknown"}`,
                timestamp: new Date().toLocaleTimeString(),
                data
            }]);

            toast.info("New booking update received", {
                description: `Booking status: ${data.booking?.status || "updated"}`
            });

            // Refresh dashboard data
            setLoading(true);
            setTimeout(() => setLoading(false), 1000);
        });

        const unsubscribeSlotUpdated = ws.on("slot_updated", (data) => {
            setRealTimeUpdates(prev => [...prev.slice(-4), {
                type: "slot",
                message: `Slot ${data.slot?.status || "updated"}: ${data.slot?.time || "Unknown time"}`,
                timestamp: new Date().toLocaleTimeString(),
                data
            }]);

            toast.info("Slot availability changed", {
                description: `Slot ${data.slot?.time} is now ${data.slot?.status}`
            });

            // Refresh dashboard data
            setLoading(true);
            setTimeout(() => setLoading(false), 1000);
        });

        // Cleanup on unmount
        return () => {
            unsubscribeConnected();
            unsubscribeDisconnected();
            unsubscribeBookingUpdated();
            unsubscribeSlotUpdated();
            ws.disconnect();
        };
    }, [navigate, ws]);

    return (
        <MobileShell>
            <div className="min-h-screen bg-gray-950 text-white">
                {/* Header */}
                <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BackButton />
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold">Client Dashboard</h1>
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${wsConnected ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                    {wsConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                                    <span>{wsConnected ? 'Live' : 'Offline'}</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400">Welcome back, Turf Owner</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Bell className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout}>
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-4 space-y-6">
                    {/* Summary Cards Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                        {summaryCards.map((card, idx) => (
                            <Card key={idx} className="bg-gray-800 border-gray-700">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-400">{card.title}</p>
                                            <p className="text-2xl font-bold mt-1">{card.value}</p>
                                            <p className="text-xs mt-1 text-green-400">{card.change}</p>
                                        </div>
                                        <div className={`${card.color} p-3 rounded-full`}>
                                            {card.icon}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </motion.div>

                    {/* Main Tabs */}
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid grid-cols-4 bg-gray-800">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="bookings">Bookings</TabsTrigger>
                            <TabsTrigger value="manage">Manage</TabsTrigger>
                            <TabsTrigger value="settings">Settings</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Calendar */}
                                <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
                                    <CardHeader>
                                        <CardTitle>Booking Calendar</CardTitle>
                                        <CardDescription>View and manage your turf bookings</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            className="rounded-md border border-gray-700"
                                        />
                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Available</span>
                                                <Badge variant="outline" className="bg-green-900/30 text-green-400">24 slots</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Booked</span>
                                                <Badge variant="outline" className="bg-blue-900/30 text-blue-400">8 slots</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Blocked</span>
                                                <Badge variant="outline" className="bg-red-900/30 text-red-400">6 slots</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Real-time Updates */}
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Real-time Updates</CardTitle>
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${wsConnected ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                                {wsConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                                                <span>{wsConnected ? 'Live Connected' : 'Offline'}</span>
                                            </div>
                                        </div>
                                        <CardDescription>Instant updates from main panel</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {realTimeUpdates.length > 0 ? (
                                                realTimeUpdates.map((update, index) => (
                                                    <div key={index} className="flex items-start gap-2 p-2 bg-gray-900/30 rounded">
                                                        <div className={`mt-1 h-2 w-2 rounded-full ${update.type === 'booking' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{update.message}</p>
                                                            <p className="text-xs text-gray-400">{update.timestamp}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-4 text-gray-500 text-sm">
                                                    {wsConnected ? 'Waiting for updates...' : 'Connect to receive live updates'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-4 text-xs text-gray-400">
                                            Updates appear here when bookings or slots change in real-time
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Recent Bookings */}
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardHeader>
                                        <CardTitle>Recent Bookings</CardTitle>
                                        <CardDescription>Latest customer bookings</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {recentBookings.map((booking) => (
                                                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{booking.customer}</p>
                                                        <p className="text-sm text-gray-400">{booking.time}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge
                                                            className={
                                                                booking.status === "Confirmed"
                                                                    ? "bg-green-900/30 text-green-400"
                                                                    : booking.status === "Pending"
                                                                        ? "bg-yellow-900/30 text-yellow-400"
                                                                        : "bg-red-900/30 text-red-400"
                                                            }
                                                        >
                                                            {booking.status}
                                                        </Badge>
                                                        <p className="text-sm font-semibold mt-1">{booking.amount}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Button variant="outline" className="w-full mt-4 border-gray-600" onClick={() => handleNavigate("/client/bookings")}>
                                            View All Bookings
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quick Actions */}
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                    <CardDescription>Manage your turf quickly</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <Button className="bg-blue-600 hover:bg-blue-700 h-auto py-4 flex flex-col gap-2" onClick={() => handleNavigate("/client/slots")}>
                                            <Clock className="h-6 w-6" />
                                            <span>Manage Slots</span>
                                        </Button>
                                        <Button className="bg-purple-600 hover:bg-purple-700 h-auto py-4 flex flex-col gap-2" onClick={() => handleNavigate("/client/photos")}>
                                            <Image className="h-6 w-6" />
                                            <span>Upload Photos</span>
                                        </Button>
                                        <Button className="bg-amber-600 hover:bg-amber-700 h-auto py-4 flex flex-col gap-2" onClick={() => handleNavigate("/client/pricing")}>
                                            <DollarSign className="h-6 w-6" />
                                            <span>Update Pricing</span>
                                        </Button>
                                        <Button className="bg-teal-600 hover:bg-teal-700 h-auto py-4 flex flex-col gap-2" onClick={() => handleNavigate("/client/settings")}>
                                            <Settings className="h-6 w-6" />
                                            <span>Turf Settings</span>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Bookings Tab */}
                        <TabsContent value="bookings">
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <CardTitle>Booking Management</CardTitle>
                                    <CardDescription>View, accept, cancel, and reschedule bookings</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-400">Full booking management interface will be implemented here.</p>
                                    <div className="mt-4 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <Button>View Booking History</Button>
                                            <Button variant="outline">Customer Details</Button>
                                            <Button variant="outline">Generate Reports</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Manage Tab */}
                        <TabsContent value="manage">
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <CardTitle>Turf Management</CardTitle>
                                    <CardDescription>Update turf details, photos, videos, rules, and policies</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Button className="h-auto py-4 flex flex-col gap-2" variant="outline" onClick={() => handleNavigate("/client/turf/edit")}>
                                            <Image className="h-6 w-6" />
                                            <span>Turf Photos & Videos</span>
                                            <span className="text-xs text-gray-400">Upload and manage media</span>
                                        </Button>
                                        <Button className="h-auto py-4 flex flex-col gap-2" variant="outline" onClick={() => handleNavigate("/client/turf/edit")}>
                                            <Settings className="h-6 w-6" />
                                            <span>Turf Details</span>
                                            <span className="text-xs text-gray-400">Name, address, timings, amenities</span>
                                        </Button>
                                        <Button className="h-auto py-4 flex flex-col gap-2" variant="outline" onClick={() => handleNavigate("/client/pricing")}>
                                            <DollarSign className="h-6 w-6" />
                                            <span>Pricing & Offers</span>
                                            <span className="text-xs text-gray-400">Set rates, promo codes, peak hours</span>
                                        </Button>
                                        <Button className="h-auto py-4 flex flex-col gap-2" variant="outline" onClick={() => handleNavigate("/client/rules")}>
                                            <Shield className="h-6 w-6" />
                                            <span>Rules & Policies</span>
                                            <span className="text-xs text-gray-400">Cancellation, parking, turf rules</span>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Settings Tab */}
                        <TabsContent value="settings">
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <CardTitle>Profile & Settings</CardTitle>
                                    <CardDescription>Manage your account, notifications, and security</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                                            <div>
                                                <p className="font-medium">Change Password</p>
                                                <p className="text-sm text-gray-400">Update your login password</p>
                                            </div>
                                            <Button variant="outline">Change</Button>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                                            <div>
                                                <p className="font-medium">Notification Preferences</p>
                                                <p className="text-sm text-gray-400">Configure booking alerts</p>
                                            </div>
                                            <Button variant="outline">Configure</Button>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                                            <div>
                                                <p className="font-medium">Staff Access</p>
                                                <p className="text-sm text-gray-400">Add team members</p>
                                            </div>
                                            <Button variant="outline">Manage</Button>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                                            <div>
                                                <p className="font-medium">Audit Logs</p>
                                                <p className="text-sm text-gray-400">View who changed what and when</p>
                                            </div>
                                            <Button variant="outline">View Logs</Button>
                                        </div>
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

export default ClientDashboard;