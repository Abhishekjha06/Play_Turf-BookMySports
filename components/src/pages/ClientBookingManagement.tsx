import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/layout/MobileShell";
import { BackButton } from "@/layout/BackButton";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Badge } from "@/ui/badge";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Calendar, Filter, Search, CheckCircle, XCircle, Clock, User, DollarSign, MoreVertical } from "lucide-react";

const ClientBookingManagement = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Mock booking data
    const bookings = [
        { id: 1, customer: "Rahul Sharma", phone: "+91 9876543210", date: "2026-05-10", time: "10:00 - 12:00", turf: "Arena 7", amount: 2400, status: "confirmed", payment: "paid" },
        { id: 2, customer: "Priya Patel", phone: "+91 9876543211", date: "2026-05-10", time: "14:00 - 16:00", turf: "Night Strikers", amount: 3000, status: "pending", payment: "pending" },
        { id: 3, customer: "Amit Kumar", phone: "+91 9876543212", date: "2026-05-11", time: "18:00 - 20:00", turf: "Arena 7", amount: 3600, status: "confirmed", payment: "paid" },
        { id: 4, customer: "Neha Singh", phone: "+91 9876543213", date: "2026-05-11", time: "20:00 - 22:00", turf: "Night Strikers", amount: 4000, status: "cancelled", payment: "refunded" },
        { id: 5, customer: "Vikram Roy", phone: "+91 9876543214", date: "2026-05-12", time: "08:00 - 10:00", turf: "Arena 7", amount: 2000, status: "pending", payment: "pending" },
        { id: 6, customer: "Sonia Mehta", phone: "+91 9876543215", date: "2026-05-12", time: "12:00 - 14:00", turf: "Night Strikers", amount: 3000, status: "confirmed", payment: "paid" },
        { id: 7, customer: "Rajesh Nair", phone: "+91 9876543216", date: "2026-05-13", time: "16:00 - 18:00", turf: "Arena 7", amount: 3600, status: "confirmed", payment: "paid" },
        { id: 8, customer: "Anjali Desai", phone: "+91 9876543217", date: "2026-05-13", time: "20:00 - 22:00", turf: "Night Strikers", amount: 4000, status: "pending", payment: "pending" },
    ];

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = booking.customer.toLowerCase().includes(search.toLowerCase()) ||
            booking.phone.includes(search) ||
            booking.turf.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleAccept = (id: number) => {
        toast.success(`Booking #${id} accepted`);
        // In a real app, update booking status via API
    };

    const handleCancel = (id: number) => {
        toast.error(`Booking #${id} cancelled`);
        // In a real app, update booking status via API
    };

    const handleReschedule = (id: number) => {
        const newDate = prompt("Enter new date (YYYY-MM-DD):", "2026-05-15");
        const newTime = prompt("Enter new time (HH:MM - HH:MM):", "14:00 - 16:00");
        if (newDate && newTime) {
            toast.success(`Booking #${id} rescheduled to ${newDate} ${newTime}`);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "confirmed":
                return <Badge className="bg-green-900/30 text-green-400">Confirmed</Badge>;
            case "pending":
                return <Badge className="bg-yellow-900/30 text-yellow-400">Pending</Badge>;
            case "cancelled":
                return <Badge className="bg-red-900/30 text-red-400">Cancelled</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const getPaymentBadge = (payment: string) => {
        switch (payment) {
            case "paid":
                return <Badge className="bg-blue-900/30 text-blue-400">Paid</Badge>;
            case "pending":
                return <Badge className="bg-amber-900/30 text-amber-400">Pending</Badge>;
            case "refunded":
                return <Badge className="bg-purple-900/30 text-purple-400">Refunded</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    return (
        <MobileShell>
            <div className="min-h-screen bg-gray-950 text-white">
                <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BackButton />
                        <div>
                            <h1 className="text-xl font-bold">Booking Management</h1>
                            <p className="text-sm text-gray-400">Manage customer bookings</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate("/client/dashboard")}>
                        Back to Dashboard
                    </Button>
                </div>

                <div className="p-4 space-y-6">
                    {/* Filters & Search */}
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle>Filters & Search</CardTitle>
                            <CardDescription>Find and manage bookings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label>Search</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                        <Input
                                            placeholder="Customer, phone, turf..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10 bg-gray-900 border-gray-700"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="bg-gray-900 border-gray-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Date Range</Label>
                                    <Input type="date" className="bg-gray-900 border-gray-700" />
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-4">
                                <Button variant="outline" className="border-blue-600 text-blue-400">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Apply Filters
                                </Button>
                                <Button variant="outline" className="border-green-600 text-green-400">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Export to CSV
                                </Button>
                                <Button variant="outline" className="border-purple-600 text-purple-400">
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Generate Invoice
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Booking List */}
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid grid-cols-4 bg-gray-800">
                            <TabsTrigger value="all">All Bookings</TabsTrigger>
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all" className="space-y-4">
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <CardTitle>Booking List</CardTitle>
                                    <CardDescription>{filteredBookings.length} bookings found</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>ID</TableHead>
                                                    <TableHead>Customer</TableHead>
                                                    <TableHead>Date & Time</TableHead>
                                                    <TableHead>Turf</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Payment</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredBookings.map((booking) => (
                                                    <TableRow key={booking.id}>
                                                        <TableCell className="font-mono">#{booking.id}</TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">{booking.customer}</div>
                                                            <div className="text-sm text-gray-400">{booking.phone}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">{booking.date}</div>
                                                            <div className="text-sm text-gray-400">{booking.time}</div>
                                                        </TableCell>
                                                        <TableCell>{booking.turf}</TableCell>
                                                        <TableCell className="font-bold">₹ {booking.amount}</TableCell>
                                                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                                        <TableCell>{getPaymentBadge(booking.payment)}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {booking.status === "pending" && (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            className="bg-green-600 hover:bg-green-700 h-8 px-3"
                                                                            onClick={() => handleAccept(booking.id)}
                                                                        >
                                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                                            Accept
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            className="h-8 px-3"
                                                                            onClick={() => handleCancel(booking.id)}
                                                                        >
                                                                            <XCircle className="h-3 w-3 mr-1" />
                                                                            Cancel
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-8 px-3"
                                                                    onClick={() => handleReschedule(booking.id)}
                                                                >
                                                                    <Clock className="h-3 w-3 mr-1" />
                                                                    Reschedule
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="pending">
                            <p className="text-gray-400">Pending bookings will be listed here.</p>
                        </TabsContent>
                        <TabsContent value="confirmed">
                            <p className="text-gray-400">Confirmed bookings will be listed here.</p>
                        </TabsContent>
                        <TabsContent value="cancelled">
                            <p className="text-gray-400">Cancelled bookings will be listed here.</p>
                        </TabsContent>
                    </Tabs>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-gray-800 border-gray-700">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400">Total Bookings</p>
                                        <p className="text-2xl font-bold">142</p>
                                    </div>
                                    <div className="bg-blue-500/20 p-3 rounded-full">
                                        <Calendar className="h-6 w-6 text-blue-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gray-800 border-gray-700">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400">Pending Approval</p>
                                        <p className="text-2xl font-bold">8</p>
                                    </div>
                                    <div className="bg-yellow-500/20 p-3 rounded-full">
                                        <Clock className="h-6 w-6 text-yellow-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gray-800 border-gray-700">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400">Revenue Today</p>
                                        <p className="text-2xl font-bold">₹ 24,500</p>
                                    </div>
                                    <div className="bg-green-500/20 p-3 rounded-full">
                                        <DollarSign className="h-6 w-6 text-green-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gray-800 border-gray-700">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400">Cancellations</p>
                                        <p className="text-2xl font-bold">3</p>
                                    </div>
                                    <div className="bg-red-500/20 p-3 rounded-full">
                                        <XCircle className="h-6 w-6 text-red-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions */}
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle>Booking Actions</CardTitle>
                            <CardDescription>Manage offers, holidays, and peak hours</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Button className="bg-purple-600 hover:bg-purple-700 h-auto py-4 flex flex-col gap-2">
                                    <DollarSign className="h-6 w-6" />
                                    <span>Add Promo Code</span>
                                    <span className="text-xs text-gray-300">Create discount offers</span>
                                </Button>
                                <Button className="bg-amber-600 hover:bg-amber-700 h-auto py-4 flex flex-col gap-2">
                                    <Calendar className="h-6 w-6" />
                                    <span>Manage Holidays</span>
                                    <span className="text-xs text-gray-300">Set non‑working days</span>
                                </Button>
                                <Button className="bg-teal-600 hover:bg-teal-700 h-auto py-4 flex flex-col gap-2">
                                    <Clock className="h-6 w-6" />
                                    <span>Peak Hours Pricing</span>
                                    <span className="text-xs text-gray-300">Adjust rates for peak times</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MobileShell>
    );
};

export default ClientBookingManagement;