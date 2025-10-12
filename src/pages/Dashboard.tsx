import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Bell, Phone, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [patrolActive, setPatrolActive] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);

  const tickets = [
    { title: "BSA", color: "bg-blue-500" },
    { title: "FTTH", color: "bg-blue-400" },
    { title: "Installation", color: "bg-blue-600" },
    { title: "Maintenance", color: "bg-sky-500" },
    { title: "Civil Works", color: "bg-blue-300" },
    { title: "Patrol", color: "bg-indigo-500" },
    { title: "Network", color: "bg-cyan-500" },
    { title: "Cyber", color: "bg-blue-700" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ======= Header ======= */}
      <div className="flex justify-between items-center bg-white shadow-md p-3">
        <div className="flex items-center gap-3 text-blue-600">
          <Phone size={22} className="cursor-pointer hover:scale-110 transition" />
          <Bell size={22} className="cursor-pointer hover:scale-110 transition" />
          <RefreshCw size={22} className="cursor-pointer hover:scale-110 transition" />
        </div>

        <h1 className="text-xl font-semibold text-gray-800">PoliceSmart</h1>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-blue-600">
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-white w-[250px] p-4">
            <h2 className="font-semibold mb-3 text-gray-700">Main Menu</h2>
            <ul className="space-y-2 text-gray-600">
              <li>Dashboard</li>
              <li>Reports</li>
              <li>Patrol</li>
              <li>Operations</li>
              <li>Cyber Unit</li>
              <li>Settings</li>
            </ul>
          </SheetContent>
        </Sheet>
      </div>

      {/* ======= Tickets Section ======= */}
      <div className="grid grid-cols-4 gap-3 p-4">
        {tickets.map((item, i) => (
          <Card
            key={i}
            className={`${item.color} text-white text-center shadow-md rounded-xl py-3 cursor-pointer hover:opacity-90 transition`}
          >
            <CardContent className="p-0">
              <p className="font-semibold text-sm">{item.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ======= Patrol Activation ======= */}
      <div className="px-4">
        <Button
          onClick={() => setPatrolActive(!patrolActive)}
          className={`w-full py-4 text-lg font-semibold rounded-xl shadow ${
            patrolActive ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
          } text-white transition`}
        >
          {patrolActive ? "إيقاف تفعيل الدورية" : "تفعيل الدورية"}
        </Button>
      </div>

      {/* ======= Map Placeholder ======= */}
      <div className="flex-1 bg-gray-200 mx-4 my-4 rounded-2xl flex items-center justify-center text-gray-500 text-sm shadow-inner">
        <span>Google Map Placeholder</span>
      </div>

      {/* ======= News Drawer ======= */}
      <div
        className={`fixed bottom-0 left-0 w-full bg-blue-600 text-white rounded-t-2xl shadow-xl transition-all duration-500 ${
          newsOpen ? "h-[280px]" : "h-[50px]"
        }`}
      >
        {/* handle line */}
        <div className="flex justify-center items-center py-2 cursor-pointer" onClick={() => setNewsOpen(!newsOpen)}>
          <div className="w-10 h-1.5 bg-white rounded-full" />
        </div>

        <div className="px-4 overflow-y-auto h-full">
          {newsOpen ? (
            <>
              <h2 className="font-bold text-lg mb-2">Police News & Alerts</h2>
              <ul className="space-y-2 text-sm">
                <li>🔹 New patrol unit deployed in Ramallah sector.</li>
                <li>🔹 Cybercrime report #425 closed successfully.</li>
                <li>🔹 Emergency alert resolved at Station 12.</li>
                <li>🔹 System update scheduled at 03:00 AM.</li>
              </ul>
            </>
          ) : (
            <p className="text-center text-sm font-semibold">News & Alerts</p>
          )}
        </div>
      </div>
    </div>
  );
}
