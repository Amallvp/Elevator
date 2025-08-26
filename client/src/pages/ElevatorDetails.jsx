import React from "react";
import adminApi from "../config/adminApi";
import { BASE_URL } from "../utils/constant";
import socket from "../config/socketClient";
import { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useState } from "react";
import "react-toastify/dist/ReactToastify.css";

export default function ElevatorDetail({ id, elevator }) {
  const [history, setHistory] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [weight, setWeight] = useState(null);
  const [occupancy, setOccupancy] = useState(null);

  console.log("weight", weight);
  console.log("occupancy", occupancy);

  console.log("resssssss", history);
  console.log("yyt", elevator);

  const handleMove = async () => {
    if (selectedFloor === null) return;
    try {
      const res = await adminApi.post(`${BASE_URL}/elevators/${id}/move`, {
        targetFloor: selectedFloor,
        occupancy_count: occupancy,
        load: weight,
      });
      console.log("Move command sent:", res.data);
    } catch (error) {
      toast.error(error.response.data.error);
    }
  };

  const handleStop = async () => {
    try {
      const res = await adminApi.post(`${BASE_URL}/elevators/${id}/stop`);

      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSart = async () => {
    try {
      const res = await adminApi.post(`${BASE_URL}/elevators/${id}/start`);

      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDoor = async () => {
    try {
      // decide next action based on current door_state
      const action =
        history?.door_state?.toUpperCase() === "CLOSED" ? "OPEN" : "CLOSED";

      const res = await adminApi.post(
        `${BASE_URL}/elevators/${id}/door`,
        { action } // send action in payload
      );

      console.log("Door command sent:", res.data);
    } catch (error) {
      console.error("Door command error:", error);
    }
  };

  useEffect(() => {
    // subscribe once when component mounts
    socket.emit("subscribe:elevator", id);

    socket.emit("get:elevatorHistory", { id, limit: 1 }, (res) => {
      if (res.success) setHistory(res.data[0]);
    });

    socket.on("update:elevator", (data) => {
      setHistory((prev) => ({ ...prev, ...data }));
    });

    return () => {
      socket.off("update:elevator");
    };
  }, [id]);

  useEffect(() => {
    socket.emit("subscribe:elevator", id);

    // Load initial audit logs
    adminApi.get(`${BASE_URL}/audit/${id}/log`).then((res) => {
      setAuditLogs(res.data);
    });

    // Listen for real-time updates
    socket.on("new:audit", (data) => {
      setAuditLogs((prev) => [data, ...prev]); // prepend new log
    });

    return () => {
      socket.off("new:audit");
    };
  }, [id]);

  return (
    <div className="h-full">
      <h1 className="text-2xl font-bold mb-3">Elevator {id} Detail</h1>
      <ToastContainer
        position="top-center"
        autoClose={1000} // Closes after 3 seconds
      />
      {/* Status */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="bg-white shadow p-4 rounded">
          <h2 className="font-bold mb-2">Status</h2>

          <div className="grid grid-cols-2 gap-x-2">
            <span className="font-medium">Floor </span>
            <span>: {history?.floor_index}</span>

            <span className="font-medium">Direction</span>
            <span>: {history?.travel_direction}</span>

            <span className="font-medium">Door</span>
            <span>: {history?.door_state}</span>

            <span className="font-medium">E-Stop</span>
            <span>: {history?.safety?.e_stop ? "Yes" : "No"}</span>

            <span className="font-medium">Brake</span>
            <span>: {history?.safety?.brake_status}</span>
          </div>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <h2 className="font-bold mb-2">Occupancy</h2>
          <p>{history?.occupancy_count} passengers</p>
          <p>
            Load:{" "}
            {(() => {
              // Find current elevator by ID
              const currentElevator = elevator.find(
                (el) => el.elevatorId === id
              );

              console.log("yes", currentElevator);

              // Get overload_kg and current load_kg
              const overloadKg = currentElevator?.status?.overload_Kg || 0;
              const loadKg = history?.load_kg || 0; 
               if (overloadKg === 0 || loadKg === 0) return "0%";
              // Calculate percentage
              const percentage = ((loadKg / overloadKg) * 100).toFixed(2) ?((loadKg / overloadKg) * 100).toFixed(2) : 0 ;
              return `${percentage}%`;
            })()}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white shadow p-3 rounded mb-4">
        <h2 className="font-bold mb-2">Controls</h2>

        {/* Floor Selector */}
        <div className="flex items-center gap-4 mb-3">
          <label className="font-medium">Select Floor:</label>
          <select
            value={selectedFloor ?? ""}
            onChange={(e) => setSelectedFloor(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value="" disabled>
              -- Select Floor --
            </option>
            {Array.from(
              { length: elevator[0]?.building?.floors_total || 0 },
              (_, i) => i
            ).map((floor) => (
              <option key={floor} value={floor}>
                {floor}
              </option>
            ))}
          </select>
        </div>

        {/* Occupancy & Weight Inputs */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="font-medium">Occupancy:</label>
            <input
              type="number"
              value={occupancy}
              onChange={(e) => setOccupancy(Number(e.target.value))}
              className="border rounded px-2 py-1 w-20"
              min={0}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-medium">Weight (kg):</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="border rounded px-2 py-1 w-24"
              min={0}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleMove}
            disabled={selectedFloor === null}
          >
            {selectedFloor !== null
              ? `Move to Floor ${selectedFloor}`
              : "Select a Floor"}
          </button>

          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={handleStop}
          >
            Emergency Stop
          </button>

          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={handleSart}
          >
            Start Elevator
          </button>

          <button
            className="bg-gray-600 text-white px-4 py-2 rounded"
            onClick={handleDoor}
          >
            Door
          </button>
        </div>
      </div>

      {/* audit */}
      <div className="bg-white shadow p-3 rounded mb-2">
        <h2 className="font-bold mb-2 text-md">Audit / History</h2>
        <div className="h-64 overflow-y-auto border border-gray-200 rounded p-2">
          <ul className="space-y-1">
            {auditLogs.map((log) => {
              if (!log.ts) return null; // skip if timestamp missing
              const time = new Date(log.ts);
              return (
                <li
                  key={log._id}
                  className="p-2 rounded hover:bg-gray-100 transition-colors flex gap-5"
                >
                  <span className="text-gray-500 text-md">
                    {time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  <span className="text-sm font-medium">{log.action}</span>
                  {log.payload && (
                    <span className="text-gray-600 text-sm">
                      → {JSON.stringify(log.payload)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
