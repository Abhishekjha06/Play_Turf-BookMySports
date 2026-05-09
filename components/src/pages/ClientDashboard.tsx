import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/layout/MobileShell";
import { BackButton } from "@/layout/BackButton";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Badge } from "@/ui/badge";
import { Progress } from "@/ui/progress";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from "lodash-es";
import {
    format,
    isSameDay,
    addDays,
    startOfMonth,
    addMonths,
    subMonths,
    getDay,
    getDaysInMonth,
    isToday,
    isSameMonth,
} from "date-fns";
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
    TrendingDown,
    Minus,
    PieChart,
    Wifi,
    WifiOff,
    CheckCircle2,
    AlertCircle,
    XCircle,
    MapPin,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { websocket, useWebSocket } from "@/lib/websocket";
import { useAuth } from "@/hooks/use-auth";
import { isMockMode } from "@/lib/api";

/* ── Booking avatar color map ── */
const avatarColorMap: Record<string, { bg: string; color: string }> = {
    RS: { bg: "#0d2a4a", color: "#7fb8f5" },
    PP: { bg: "#2d1e00", color: "#f5b942" },
    AK: { bg: "#0d2e1a", color: "#4ade80" },
    NS: { bg: "#3d1a1a", color: "#f87171" },
};
const defaultAvatar = { bg: "#1e1040", color: "#b39dfa" };

function getInitials(name: string) {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("");
}

function getAvatarStyle(name: string) {
    const initials = getInitials(name);
    return avatarColorMap[initials] || defaultAvatar;
}

/* ── Status pill colors ── */
const statusPillMap: Record<string, { bg: string; color: string }> = {
    Confirmed: { bg: "#0d2e1a", color: "#4ade80" },
    Pending: { bg: "#2d1e00", color: "#f5b942" },
    Cancelled: { bg: "#3d1a1a", color: "#f87171" },
};

const ClientDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const [realTimeUpdates, setRealTimeUpdates] = useState<any[]>([]);
    const ws = useWebSocket();

    // Stat cards — each with its own tinted dark bg
    const summaryCards = [
        { title: "Total Bookings", value: "142", change: "+12%", icon: BarChart3, bg: "#0d2a4a", labelColor: "#7fb8f5", valueColor: "#e8f4ff" },
        { title: "Today's Bookings", value: "8", change: "+2", icon: CalendarDays, bg: "#0d2e1a", labelColor: "#6fcf8a", valueColor: "#e8ffee" },
        { title: "Revenue", value: "₹ 1,24,500", change: "+18%", icon: DollarSign, bg: "#2d1e00", labelColor: "#f5b942", valueColor: "#fff8e6" },
        { title: "Occupancy Rate", value: "78%", change: "+4%", icon: PieChart, bg: "#1e1040", labelColor: "#b39dfa", valueColor: "#ede8ff" },
        { title: "Available Slots", value: "24", change: "-3", icon: Clock, bg: "#062920", labelColor: "#3fd6a8", valueColor: "#e0fff5" },
        { title: "Blocked Slots", value: "6", change: "+1", icon: Shield, bg: "#2d1008", labelColor: "#f5886a", valueColor: "#fff1ee" },
        { title: "Pending Approvals", value: "3", change: "-1", icon: Users, bg: "#2a0a1a", labelColor: "#f07eb8", valueColor: "#ffe8f4" },
        { title: "Total Reviews", value: "89", change: "+5", icon: TrendingUp, bg: "#0e1240", labelColor: "#8a9ff5", valueColor: "#eaedff" },
    ];

    const recentBookings = [
        { id: 1, customer: "Rahul Sharma", time: "10:00 AM - 12:00 PM", status: "Confirmed", amount: "₹ 2,400" },
        { id: 2, customer: "Priya Patel", time: "2:00 PM - 4:00 PM", status: "Pending", amount: "₹ 3,000" },
        { id: 3, customer: "Amit Kumar", time: "6:00 PM - 8:00 PM", status: "Confirmed", amount: "₹ 3,600" },
        { id: 4, customer: "Neha Singh", time: "8:00 PM - 10:00 PM", status: "Cancelled", amount: "₹ 4,000" },
    ];

    // Booked dates with status and slot counts for calendar
    const today = new Date();
    const bookedDates = useMemo(() => [
        { date: today, booked: 3, available: 5, status: "booked" as const },
        { date: addDays(today, 1), booked: 2, available: 6, status: "booked" as const },
        { date: addDays(today, 2), booked: 2, available: 6, status: "partial" as const },
        { date: addDays(today, 3), booked: 1, available: 7, status: "booked" as const },
        { date: addDays(today, 5), booked: 2, available: 6, status: "partial" as const },
        { date: addDays(today, 7), booked: 4, available: 4, status: "booked" as const },
        { date: addDays(today, 8), booked: 0, available: 0, status: "blocked" as const },
        { date: addDays(today, 10), booked: 1, available: 7, status: "partial" as const },
        { date: addDays(today, 12), booked: 3, available: 5, status: "booked" as const },
        { date: addDays(today, 14), booked: 0, available: 0, status: "blocked" as const },
        { date: addDays(today, -1), booked: 2, available: 6, status: "booked" as const },
        { date: addDays(today, -3), booked: 1, available: 7, status: "partial" as const },
        { date: addDays(today, -5), booked: 3, available: 5, status: "booked" as const },
        { date: addDays(today, -7), booked: 1, available: 7, status: "partial" as const },
        { date: addDays(today, 4), booked: 0, available: 8, status: "available" as const },
        { date: addDays(today, 6), booked: 0, available: 8, status: "available" as const },
        { date: addDays(today, 9), booked: 0, available: 8, status: "available" as const },
        { date: addDays(today, 11), booked: 0, available: 8, status: "available" as const },
    ], []);

    // Calendar grid computation
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const daysInMonth = getDaysInMonth(monthStart);
        const startDay = getDay(monthStart); // 0=Sun
        const days: (Date | null)[] = [];
        // Pad start
        for (let i = 0; i < startDay; i++) days.push(null);
        // Fill days
        for (let d = 1; d <= daysInMonth; d++) {
            days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
        }
        return days;
    }, [currentMonth]);

    // Month stats
    const monthStats = useMemo(() => {
        const totalDays = getDaysInMonth(currentMonth);
        const monthBookedDates = bookedDates.filter(d => isSameMonth(d.date, currentMonth));
        const bookedCount = monthBookedDates.filter(d => d.status === "booked" || d.status === "partial").length;
        const blockedCount = monthBookedDates.filter(d => d.status === "blocked").length;
        const availableCount = totalDays - bookedCount - blockedCount;
        return { totalDays, bookedCount, availableCount, blockedCount };
    }, [currentMonth, bookedDates]);

    // Bookings for the selected date (slot rows)
    const selectedDateBookings = useMemo(() => {
        if (!date) return [];
        const match = bookedDates.find(d => isSameDay(d.date, date));
        if (!match) return [];
        if (match.status === "blocked") return [
            { time: "06:00 – 08:00", customer: "— Blocked —", status: "Blocked", amount: "—" },
            { time: "08:00 – 10:00", customer: "— Blocked —", status: "Blocked", amount: "—" },
            { time: "10:00 – 12:00", customer: "— Blocked —", status: "Blocked", amount: "—" },
            { time: "12:00 – 14:00", customer: "— Blocked —", status: "Blocked", amount: "—" },
            { time: "14:00 – 16:00", customer: "— Blocked —", status: "Blocked", amount: "—" },
            { time: "16:00 – 18:00", customer: "— Blocked —", status: "Blocked", amount: "—" },
            { time: "18:00 – 20:00", customer: "— Blocked —", status: "Blocked", amount: "—" },
            { time: "20:00 – 22:00", customer: "— Blocked —", status: "Blocked", amount: "—" },
        ];
        if (match.status === "partial") return [
            { time: "06:00 – 08:00", customer: "Morning Slot", status: "Available", amount: "₹ 1,200" },
            { time: "08:00 – 10:00", customer: "Vikram R.", status: "Confirmed", amount: "₹ 2,400" },
            { time: "10:00 – 12:00", customer: "Sneha M.", status: "Confirmed", amount: "₹ 2,400" },
            { time: "12:00 – 14:00", customer: "Lunch Break", status: "Available", amount: "₹ 1,200" },
            { time: "14:00 – 16:00", customer: "Arjun P.", status: "Pending", amount: "₹ 3,000" },
            { time: "16:00 – 18:00", customer: "Evening Slot", status: "Available", amount: "₹ 1,800" },
            { time: "18:00 – 20:00", customer: "Karan S.", status: "Confirmed", amount: "₹ 3,600" },
            { time: "20:00 – 22:00", customer: "Night Slot", status: "Available", amount: "₹ 2,000" },
        ];
        return [
            { time: "06:00 – 08:00", customer: "Deepak T.", status: "Confirmed", amount: "₹ 2,400" },
            { time: "08:00 – 10:00", customer: "Rahul Sharma", status: "Confirmed", amount: "₹ 2,400" },
            { time: "10:00 – 12:00", customer: "Priya Patel", status: "Pending", amount: "₹ 3,000" },
            { time: "12:00 – 14:00", customer: "Lunch Break", status: "Available", amount: "₹ 1,200" },
            { time: "14:00 – 16:00", customer: "Amit Kumar", status: "Confirmed", amount: "₹ 3,600" },
            { time: "16:00 – 18:00", customer: "Suresh K.", status: "Confirmed", amount: "₹ 3,000" },
            { time: "18:00 – 20:00", customer: "Neha Singh", status: "Cancelled", amount: "₹ 4,000" },
            { time: "20:00 – 22:00", customer: "Ravi M.", status: "Confirmed", amount: "₹ 3,600" },
        ];
    }, [date, bookedDates]);

    // Selected date summary
    const selectedDateSummary = useMemo(() => {
        if (!date) return { booked: 0, available: 0 };
        const match = bookedDates.find(d => isSameDay(d.date, date));
        if (!match) return { booked: 0, available: 8 };
        if (match.status === "blocked") return { booked: 8, available: 0 };
        return { booked: match.booked, available: match.available };
    }, [date, bookedDates]);

    const getSlotColor = (status: string) => {
        switch (status) {
            case "Available": return { bg: "rgba(20,83,45,.45)", text: "#4ade80" };
            case "Confirmed": return { bg: "rgba(127,29,29,.45)", text: "#fb7185" };
            case "Pending": return { bg: "rgba(161,98,7,.35)", text: "#fbbf24" };
            case "Cancelled": return { bg: "rgba(127,29,29,.35)", text: "#f87171" };
            case "Blocked": return { bg: "rgba(127,29,29,.45)", text: "#f5886a" };
            default: return { bg: "#1a1a2e", text: "#666" };
        }
    };

    const getBookingStatusIcon = (status: string) => {
        switch (status) {
            case "Confirmed": return <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#4ade80" }} />;
            case "Pending": return <AlertCircle className="h-3.5 w-3.5" style={{ color: "#f5b942" }} />;
            case "Cancelled": return <XCircle className="h-3.5 w-3.5" style={{ color: "#f87171" }} />;
            case "Available": return <Clock className="h-3.5 w-3.5" style={{ color: "#4ade80" }} />;
            case "Blocked": return <Shield className="h-3.5 w-3.5" style={{ color: "#f5886a" }} />;
            default: return null;
        }
    };

    const prevMonth = () => setCurrentMonth(m => subMonths(m, 1));
    const nextMonth = () => setCurrentMonth(m => addMonths(m, 1));
    const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const handleLogout = async () => {
        localStorage.removeItem("client_token");
        localStorage.removeItem("client_id");
        // Also sign out from the auth store
        const { signOut } = await import("@/lib/auth");
        await signOut();
        toast.success("Logged out successfully");
        navigate("/more");
    };

    const handleNavigate = useCallback((path: string) => {
        navigate(path);
    }, [navigate]);

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

        // Debounced loading indicator to batch rapid WS updates
        const debouncedLoadingFlash = debounce(() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1000);
        }, 300);

        const unsubscribeBookingUpdated = ws.on("booking_updated", (data) => {
            React.startTransition(() => {
                setRealTimeUpdates(prev => [...prev.slice(-4), {
                    type: "booking",
                    message: `Booking updated: ${data.booking?.customer_name || "Unknown"}`,
                    timestamp: new Date().toLocaleTimeString(),
                    data
                }]);
            });

            toast.info("New booking update received", {
                description: `Booking status: ${data.booking?.status || "updated"}`
            });

            debouncedLoadingFlash();
        });

        const unsubscribeSlotUpdated = ws.on("slot_updated", (data) => {
            React.startTransition(() => {
                setRealTimeUpdates(prev => [...prev.slice(-4), {
                    type: "slot",
                    message: `Slot ${data.slot?.status || "updated"}: ${data.slot?.time || "Unknown time"}`,
                    timestamp: new Date().toLocaleTimeString(),
                    data
                }]);
            });

            toast.info("Slot availability changed", {
                description: `Slot ${data.slot?.time} is now ${data.slot?.status}`
            });

            debouncedLoadingFlash();
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
                                <div
                                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                                    style={wsConnected ? { backgroundColor: "#0d2e1a", color: "#4ade80" } : { backgroundColor: "#3d1a1a", color: "#f87171" }}
                                >
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
                        {summaryCards.map((card, idx) => {
                            const Icon = card.icon;
                            const isPositive = card.change.startsWith("+");
                            const isNegative = card.change.startsWith("-");
                            const DeltaIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
                            const deltaColor = isPositive ? "#4ade80" : isNegative ? "#f87171" : "#888888";
                            return (
                                <div
                                    key={idx}
                                    className="relative overflow-hidden"
                                    style={{ backgroundColor: card.bg, borderRadius: "14px", padding: "12px 14px" }}
                                >
                                    <Icon
                                        className="absolute right-2.5 top-2.5"
                                        style={{ width: "22px", height: "22px", color: card.labelColor, opacity: 0.25 }}
                                    />
                                    <p className="text-sm" style={{ color: card.labelColor }}>{card.title}</p>
                                    <p className="text-2xl font-bold mt-1" style={{ color: card.valueColor }}>{card.value}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <DeltaIcon className="h-3 w-3" style={{ color: deltaColor }} />
                                        <span className="text-xs" style={{ color: deltaColor }}>{card.change}</span>
                                    </div>
                                </div>
                            );
                        })}
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
                            <div className="flex flex-col gap-4">
                                {/* Calendar */}
                                <Card className="bg-gray-800/60 border-gray-700/50 overflow-hidden">
                                    <CardContent className="p-4 space-y-4">
                                        {/* Header with title + month nav */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h2 className="text-xl font-extrabold tracking-tight">Booking Calendar</h2>
                                                <p className="text-sm text-gray-400 mt-1">View and manage your turf bookings</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={prevMonth}
                                                    className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 bg-[#0f172a] text-white hover:bg-[#1e293b] hover:-translate-y-0.5 transition-all"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </button>
                                                <div
                                                    className="flex items-center gap-2 h-9 px-4 rounded-xl font-bold text-sm"
                                                    style={{
                                                        background: "linear-gradient(145deg, #27145f, #312e81)",
                                                        border: "1px solid rgba(167,139,250,.25)",
                                                        color: "#a78bfa",
                                                    }}
                                                >
                                                    <CalendarDays className="h-4 w-4" />
                                                    {format(currentMonth, "MMM yyyy")}
                                                </div>
                                                <button
                                                    onClick={nextMonth}
                                                    className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 bg-[#0f172a] text-white hover:bg-[#1e293b] hover:-translate-y-0.5 transition-all"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Stats row */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div
                                                className="flex items-center gap-3 rounded-2xl p-3 transition-transform hover:-translate-y-0.5"
                                                style={{ background: "rgba(91,33,182,.18)", border: "1px solid rgba(139,92,246,.3)" }}
                                            >
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full text-lg" style={{ background: "rgba(139,92,246,.18)", color: "#c4b5fd" }}>
                                                    📅
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-extrabold" style={{ color: "#a78bfa" }}>{monthStats.totalDays}</p>
                                                    <p className="text-[0.65rem] tracking-wider text-gray-400 font-semibold">TOTAL DAYS</p>
                                                </div>
                                            </div>
                                            <div
                                                className="flex items-center gap-3 rounded-2xl p-3 transition-transform hover:-translate-y-0.5"
                                                style={{ background: "rgba(127,29,29,.25)", border: "1px solid rgba(239,68,68,.3)" }}
                                            >
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full text-lg" style={{ background: "rgba(239,68,68,.18)", color: "#fb7185" }}>
                                                    🎟️
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-extrabold" style={{ color: "#fb7185" }}>{monthStats.bookedCount}</p>
                                                    <p className="text-[0.65rem] tracking-wider text-gray-400 font-semibold">BOOKED</p>
                                                </div>
                                            </div>
                                            <div
                                                className="flex items-center gap-3 rounded-2xl p-3 transition-transform hover:-translate-y-0.5"
                                                style={{ background: "rgba(20,83,45,.28)", border: "1px solid rgba(34,197,94,.28)" }}
                                            >
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full text-lg" style={{ background: "rgba(34,197,94,.18)", color: "#4ade80" }}>
                                                    ✔
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-extrabold" style={{ color: "#4ade80" }}>{monthStats.availableCount}</p>
                                                    <p className="text-[0.65rem] tracking-wider text-gray-400 font-semibold">AVAILABLE</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Calendar grid */}
                                        <div className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)" }}>
                                            {/* Week header */}
                                            <div className="grid grid-cols-7 mb-3">
                                                {weekDays.map(d => (
                                                    <span key={d} className="text-center text-xs font-semibold text-gray-400">{d}</span>
                                                ))}
                                            </div>
                                            {/* Day grid */}
                                            <div className="grid grid-cols-7 gap-1.5">
                                                {calendarDays.map((dayDate, i) => {
                                                    if (!dayDate) return <div key={`empty-${i}`} className="min-h-[4.5rem]" />;
                                                    const match = bookedDates.find(d => isSameDay(d.date, dayDate));
                                                    const isSelected = date && isSameDay(dayDate, date);
                                                    const isTodays = isToday(dayDate);
                                                    const isCurrentMonth = isSameMonth(dayDate, currentMonth);

                                                    let dayBg = "transparent";
                                                    let dayBorder = "1px solid transparent";
                                                    let dayShadow = "none";
                                                    if (isSelected) {
                                                        dayBg = "linear-gradient(145deg, #312e81, #1d4ed8)";
                                                        dayBorder = "2px solid #8b5cf6";
                                                        dayShadow = "0 0 20px rgba(139,92,246,.4)";
                                                    } else if (isTodays) {
                                                        dayBorder = "1px solid rgba(167,139,250,.4)";
                                                    }

                                                    return (
                                                        <button
                                                            key={dayDate.toISOString()}
                                                            onClick={() => setDate(dayDate)}
                                                            className="flex flex-col items-center justify-center min-h-[4.5rem] rounded-2xl p-1.5 transition-all hover:bg-white/[.03] text-center"
                                                            style={{ background: dayBg, border: dayBorder, boxShadow: dayShadow }}
                                                        >
                                                            <span className={`text-lg font-bold leading-none ${isSelected ? "text-white" : isTodays ? "text-[#a78bfa]" : "text-gray-200"}`}>
                                                                {format(dayDate, "d")}
                                                            </span>
                                                            {match && match.status !== "available" && (
                                                                <div className="mt-1 space-y-0.5">
                                                                    {match.booked > 0 && (
                                                                        <p className="text-[0.6rem] font-semibold leading-none" style={{ color: "#fb7185" }}>
                                                                            {match.booked} Bkd
                                                                        </p>
                                                                    )}
                                                                    {match.available > 0 && (
                                                                        <p className="text-[0.6rem] font-semibold leading-none" style={{ color: "#4ade80" }}>
                                                                            {match.available} Avl
                                                                        </p>
                                                                    )}
                                                                    {match.status === "blocked" && (
                                                                        <p className="text-[0.6rem] font-semibold leading-none" style={{ color: "#f5886a" }}>
                                                                            Blocked
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {match && match.status === "available" && (
                                                                <p className="text-[0.6rem] font-semibold leading-none mt-1" style={{ color: "#4ade80" }}>
                                                                    {match.available} Avl
                                                                </p>
                                                            )}
                                                            {!match && isCurrentMonth && (
                                                                <p className="text-[0.6rem] font-semibold leading-none mt-1 text-gray-600">8 Avl</p>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Legend */}
                                            <div className="flex flex-wrap gap-4 mt-3 px-2 py-2 rounded-xl" style={{ background: "rgba(255,255,255,.03)" }}>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#fb7185" }} />
                                                    <span className="text-xs text-gray-400">Booked</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#4ade80" }} />
                                                    <span className="text-xs text-gray-400">Available</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#fbbf24" }} />
                                                    <span className="text-xs text-gray-400">Blocked</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#a78bfa" }} />
                                                    <span className="text-xs text-gray-400">Today</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Booking Details for selected date */}
                                        <AnimatePresence mode="wait">
                                            {date && (
                                                <motion.div
                                                    key={date.toISOString()}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="rounded-2xl p-4 space-y-3"
                                                    style={{
                                                        background: "rgba(255,255,255,.02)",
                                                        border: "1px solid rgba(139,92,246,.2)",
                                                        boxShadow: "0 0 20px rgba(91,33,182,.12)",
                                                    }}
                                                >
                                                    {/* Details header */}
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-base font-extrabold">{format(date, "EEEE, MMM d")}</h3>
                                                        <div className="flex gap-3 text-sm font-bold">
                                                            <span style={{ color: "#fb7185" }}>{selectedDateSummary.booked} Booked</span>
                                                            <span style={{ color: "#4ade80" }}>{selectedDateSummary.available} Available</span>
                                                        </div>
                                                    </div>

                                                    {/* Slot rows */}
                                                    <div className="space-y-0">
                                                        {selectedDateBookings.length > 0 ? selectedDateBookings.map((booking, i) => {
                                                            const slotColors = getSlotColor(booking.status);
                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-b-0"
                                                                >
                                                                    <div className="flex items-center gap-2.5">
                                                                        <div
                                                                            className="flex items-center justify-center w-8 h-8 rounded-full"
                                                                            style={{ background: "rgba(139,92,246,.12)", color: "#a78bfa" }}
                                                                        >
                                                                            <Clock className="h-3.5 w-3.5" />
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-sm text-gray-200">{booking.time}</span>
                                                                            {booking.customer && booking.customer !== "— Blocked —" && booking.customer !== "Lunch Break" && booking.customer !== "Morning Slot" && booking.customer !== "Evening Slot" && booking.customer !== "Night Slot" && (
                                                                                <p className="text-[0.65rem] text-gray-500">{booking.customer}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <span
                                                                        className="text-xs font-bold px-3 py-1.5 rounded-full"
                                                                        style={{ background: slotColors.bg, color: slotColors.text }}
                                                                    >
                                                                        {booking.status}
                                                                    </span>
                                                                </div>
                                                            );
                                                        }) : (
                                                            <div className="py-6 text-center text-sm text-gray-500">
                                                                No bookings for this date
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </CardContent>
                                </Card>

                                {/* Real-time Updates */}
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Real-time Updates</CardTitle>
                                            <div
                                                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                                                style={wsConnected ? { backgroundColor: "#0d2e1a", color: "#4ade80" } : { backgroundColor: "#3d1a1a", color: "#f87171" }}
                                            >
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
                                            {recentBookings.map((booking) => {
                                                const avatar = getAvatarStyle(booking.customer);
                                                const initials = getInitials(booking.customer);
                                                const pill = statusPillMap[booking.status] || { bg: "#1e1040", color: "#b39dfa" };
                                                return (
                                                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="h-9 w-9 rounded-full grid place-items-center text-xs font-bold shrink-0"
                                                                style={{ backgroundColor: avatar.bg, color: avatar.color }}
                                                            >
                                                                {initials}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{booking.customer}</p>
                                                                <p className="text-sm text-gray-400">{booking.time}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <Badge
                                                                style={{ backgroundColor: pill.bg, color: pill.color }}
                                                            >
                                                                {booking.status}
                                                            </Badge>
                                                            <p className="text-sm font-semibold mt-1">{booking.amount}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
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
                                        <Button className="h-auto py-4 flex flex-col gap-2 border-0" style={{ backgroundColor: "#0d2a4a", color: "#7fb8f5" }} onClick={() => handleNavigate("/client/slots")}>
                                            <Clock className="h-6 w-6" />
                                            <span>Manage Slots</span>
                                        </Button>
                                        <Button className="h-auto py-4 flex flex-col gap-2 border-0" style={{ backgroundColor: "#0d2e1a", color: "#4ade80" }} onClick={() => handleNavigate("/client/photos")}>
                                            <Image className="h-6 w-6" />
                                            <span>Upload Photos</span>
                                        </Button>
                                        <Button className="h-auto py-4 flex flex-col gap-2 border-0" style={{ backgroundColor: "#2d1e00", color: "#f5b942" }} onClick={() => handleNavigate("/client/pricing")}>
                                            <DollarSign className="h-6 w-6" />
                                            <span>Update Pricing</span>
                                        </Button>
                                        <Button className="h-auto py-4 flex flex-col gap-2 border-0" style={{ backgroundColor: "#1e1040", color: "#b39dfa" }} onClick={() => handleNavigate("/client/settings")}>
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
