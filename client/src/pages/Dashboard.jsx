import React from "react";

export default function Dashboard({ elevators ,trips}) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white shadow p-4 rounded text-center">
          <p className="text-3xl font-bold">{elevators.length}</p>
          <p>Elevators</p>
        </div>
        <div className="bg-white shadow p-4 rounded text-center">
          <p className="text-3xl font-bold">{trips.length}</p>
          <p>Total Trips</p>
        </div>
      </div>

      {/* Faults */}
      <div className="bg-white shadow p-4 rounded mb-6">
        <h2 className="font-bold mb-2">Recent Faults</h2>
        <ul className="space-y-1">
          <li className="flex justify-between">
            <span>Door Obstructed</span>
            <span>-</span>
          </li>
          <li className="flex justify-between">
            <span>Overspeed</span>
            <span>-</span>
          </li>
          <li className="flex justify-between">
            <span>E-Stop Engaged</span>
            <span>-</span>
          </li>
        </ul>
      </div>

      {/* Map */}
      <div className="bg-white shadow p-4 rounded">
        <h2 className="font-bold mb-2">Map (Static)</h2>
        <div className="bg-gray-200 h-48 flex items-center justify-center">
          Map Placeholder
        </div>
      </div>
    </div>
  );
}
