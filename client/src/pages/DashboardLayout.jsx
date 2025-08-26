import React, { useState } from "react";
import Sidebar from "../component/Sidebar";
import Dashboard from "./Dashboard";
import Elevators from "./Elevator";
import ElevatorDetails from "./ElevatorDetails";
import Trips from "./Trips";
import { useEffect } from "react";
// import adminApi from "../config/adminApi";
import { BASE_URL } from "../utils/constant";
import socket from "../config/socketClient";
import adminApi from "../config/adminApi";

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedElevatorId, setSelectedElevatorId] = useState(null);
  const [elevators, setElevators] = useState([]);
 const [trips, setTrips] = useState([]);

console.log("data",elevators);

    useEffect(() => {
    // fetch once on connect
    socket.emit("get:elevators", (response) => {
      if (response.success) {
        setElevators(response.data);
      }
    });

    // listen for live updates
    socket.on("elevators:update", (data) => {
      setElevators(data);
    });

    return () => {
      socket.off("elevators:update");
    };
  }, []);

 

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await adminApi.get(`${BASE_URL}/api/trips`);

        if (res.data) {
          setTrips(res.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchTrips();
  }, []);



  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard  elevators={elevators}  trips={trips}/>;
      case "elevators":
        return (
          <Elevators
            onSelectElevator={(id) => {
              setSelectedElevatorId(id);
              setActiveTab("elevatorDetail");
            } }
            elevators={elevators}
          />
        );
      case "elevatorDetail":
        return <ElevatorDetails id={selectedElevatorId} elevator={elevators} />;
      case "trips":
        return <Trips trips={trips} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 p-6 overflow-y-auto">{renderContent()}</div>
    </div>
  );
}
