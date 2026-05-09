import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/layout/MobileShell";
import { BackButton } from "@/layout/BackButton";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Badge } from "@/ui/badge";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Switch } from "@/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Clock, Calendar, Plus, Trash2, Edit, Save, X, CheckCircle, XCircle } from "lucide-react";

const ClientSlotManagement = () => {
    const navigate = useNavigate();
    const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [slots, setSlots] = useState<any[]>([
        { id: 1, time: "06:00", duration: 2, status: "available", price: 1200, isBlocked: false },
        { id: 2, time: "08:00", duration: 2, status: "booked", price: 1200, isBlocked: false },
        { id: 3, time: "10:00", duration: 2, status: "available", price: 1500, isBlocked: false },
        { id: 4, time: "12:00", duration: 2, status: "available", price: 1500, isBlocked: true },
        { id: 5, time: "14:00", duration: 2, status: "booked", price: 1800, isBlocked: false },
        { id: 6, time: "16:00", duration: 2, status: "available", price: 1800, isBlocked: false },
        { id: 7, time: "18:00", duration: 2, status: "available", price: 2000, isBlocked: false },
        { id: 8, time: "20:00", duration: 2, status: "booked", price: 2000, isBlocked: false },
    ]);
    const [newSlotTime, setNewSlotTime] = useState("");
    const [newSlotDuration, setNewSlotDuration] = useState(2);
    const [newSlotPrice, setNewSlotPrice] = useState(1200);

    const handleAddSlot = () => {
        if (!newSlotTime) {
            toast.error("Please select a time");
            return;
        }
        const newSlot = {
            id: slots.length + 1,
            time: newSlotTime,
            duration: newSlotDuration,
            status: "available",
            price: newSlotPrice,
            isBlocked: false,
        };
        setSlots([...slots, newSlot]);
        setNewSlotTime("");
        toast.success("Slot added");
    };

    const handleToggleBlock = (id: number) => {
        setSlots(slots.map(slot => slot.id === id ? { ...slot, isBlocked: !slot.isBlocked } : slot));
        toast.success("Slot status updated");
    };

    const handleDeleteSlot = (id: number) => {
        setSlots(slots.filter(slot => slot.id !== id));
        toast.success("Slot removed");
    };

    const handleUpdatePrice = (id: number, newPrice: number) => {
        setSlots(slots.map(slot => slot.id === id ? { ...slot, price: newPrice } : slot));
        toast.success("Price updated");
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "available": return "bg-[#3fd6a8]";
            case "booked": return "bg-[#7fb8f5]";
            case "blocked": return "bg-[#f5886a]";
            default: return "bg-gray-500";
        }
    };

    return (
        <MobileShell>
            <div className="min-h-screen bg-gray-950 text-white">
                <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BackButton />
                        <div>
                            <h1 className="text-xl font-bold">Slot Management</h1>
                            <p className="text-sm text-gray-400">Manage time slots for your turf</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate("/client/dashboard")}>
                        Back to Dashboard
                    </Button>
                </div>

                <div className="p-4 space-y-6">
                    {/* Date Selector */}
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle>Select Date</CardTitle>
                            <CardDescription>Choose a date to manage slots</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="bg-gray-900 border-gray-700 text-white"
                                />
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Load Slots
                                </Button>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">
                                Showing slots for <span className="font-semibold">{new Date(date).toLocaleDateString("en-IN")}</span>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Add New Slot */}
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle>Create New Slot</CardTitle>
                            <CardDescription>Add a new time slot for bookings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <Label>Start Time</Label>
                                    <Input
                                        type="time"
                                        value={newSlotTime}
                                        onChange={(e) => setNewSlotTime(e.target.value)}
                                        className="bg-gray-900 border-gray-700"
                                    />
                                </div>
                                <div>
                                    <Label>Duration (hours)</Label>
                                    <Select value={newSlotDuration.toString()} onValueChange={(v) => setNewSlotDuration(parseInt(v))}>
                                        <SelectTrigger className="bg-gray-900 border-gray-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5].map(h => (
                                                <SelectItem key={h} value={h.toString()}>{h} hour{h > 1 ? "s" : ""}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Price (₹)</Label>
                                    <Input
                                        type="number"
                                        value={newSlotPrice}
                                        onChange={(e) => setNewSlotPrice(parseInt(e.target.value) || 0)}
                                        className="bg-gray-900 border-gray-700"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button onClick={handleAddSlot} className="w-full bg-green-600 hover:bg-green-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Slot
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Slot List */}
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid grid-cols-4 bg-gray-800">
                            <TabsTrigger value="all">All Slots</TabsTrigger>
                            <TabsTrigger value="available">Available</TabsTrigger>
                            <TabsTrigger value="booked">Booked</TabsTrigger>
                            <TabsTrigger value="blocked">Blocked</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {slots.map((slot) => (
                                    <Card key={slot.id} className="bg-gray-800 border-gray-700">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(slot.status)}`} />
                                                    <span className="font-bold text-lg">{slot.time}</span>
                                                    <Badge variant="outline" className="ml-2">{slot.duration}h</Badge>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => handleToggleBlock(slot.id)}
                                                        className={slot.isBlocked ? "text-red-400" : "text-gray-400"}
                                                    >
                                                        {slot.isBlocked ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteSlot(slot.id)}
                                                        className="text-red-400"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-400">Status</span>
                                                    <Badge
                                                        style={
                                                            slot.status === "available"
                                                                ? { backgroundColor: "#062920", color: "#3fd6a8" }
                                                                : slot.status === "booked"
                                                                    ? { backgroundColor: "#0d2a4a", color: "#7fb8f5" }
                                                                    : { backgroundColor: "#2d1008", color: "#f5886a" }
                                                        }
                                                    >
                                                        {slot.status.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-400">Price</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold">₹ {slot.price}</span>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                const newPrice = prompt("Enter new price", slot.price.toString());
                                                                if (newPrice) handleUpdatePrice(slot.id, parseInt(newPrice));
                                                            }}
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-400">Blocked</span>
                                                    <Switch
                                                        checked={slot.isBlocked}
                                                        onCheckedChange={() => handleToggleBlock(slot.id)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    disabled={slot.status === "booked"}
                                                    onClick={() => {
                                                        if (slot.status === "booked") {
                                                            toast.error("Cannot modify a booked slot");
                                                        } else {
                                                            handleToggleBlock(slot.id);
                                                        }
                                                    }}
                                                >
                                                    {slot.isBlocked ? "Unblock Slot" : "Block Slot"}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => navigate(`/client/booking/${slot.id}`)}
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="available">
                            <p className="text-gray-400">Available slots will be listed here.</p>
                        </TabsContent>
                        <TabsContent value="booked">
                            <p className="text-gray-400">Booked slots will be listed here.</p>
                        </TabsContent>
                        <TabsContent value="blocked">
                            <p className="text-gray-400">Blocked slots will be listed here.</p>
                        </TabsContent>
                    </Tabs>

                    {/* Bulk Actions */}
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle>Bulk Actions</CardTitle>
                            <CardDescription>Apply changes to multiple slots at once</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="outline" className="border-green-600 text-green-400">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark Selected as Available
                                </Button>
                                <Button variant="outline" className="border-red-600 text-red-400">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Block Selected
                                </Button>
                                <Button variant="outline" className="border-blue-600 text-blue-400">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Update Price for Selected
                                </Button>
                                <Button variant="outline" className="border-amber-600 text-amber-400">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Set Peak Hours
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MobileShell>
    );
};

export default ClientSlotManagement;