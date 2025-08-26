// server/service/commandService.js
import { Elevator } from "../models/elevator.js";

export async function getElevatorList() {
  return Elevator.find(
    {},
    {
      elevatorId: 1,
      "building.floors_total": 1,
      "status.floor_index": 1,
      "status.mode": 1,
      "status.travel_direction": 1,
      "status.occupancy_count": 1,
      "status.overload_Kg": 1,
      updatedAt: 1,
    }
  ).sort({ elevatorId: 1 });
}

