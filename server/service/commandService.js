import { Elevator } from "../models/elevator.js";
import { Audit } from "../models/audit.js";
import { emitElevatorListUpdate, emitToElevator } from "../config/socket.js";
import { Telemetry } from "../models/Telemetry.js";
import { auditLog } from "../utils/auditLogger.js";
import { Trip } from "../models/trip.js";
import { parse } from "dotenv";

export const CommandService = {
  async emergencyStop(elevatorId, user) {
    await Telemetry.updateOne(
      { elevatorId },
      {
        $set: {
          velocity_mps: 0,
          acceleration_mps2: 0,
          travel_direction: "IDLE",
          "safety.e_stop": true,
          "safety.brake_status": "APPLIED",
        },
      }
    );

    const newss = await Elevator.updateOne(
      { elevatorId },
      {
        $set: {
          "status.travel_direction": "IDLE",
          "status.mode": "EMERGENCY_POWER",
        },
      }
    );
    emitElevatorListUpdate();
    const audit = await auditLog({
      action: "COMMAND_STOP",
      elevatorId,
      payload: { reason: "Emergency stop triggered" },
      user,
    });
    emitToElevator(elevatorId, "new:audit", audit);
    return {
      accepted: true,
      msg: "Emergency stop applied, brakes engaged",
      auditId: audit._id,
    };
  },

  async startElevator(elevatorId, user) {
    await Telemetry.updateOne(
      { elevatorId },
      {
        $set: {
          velocity_mps: 0,
          acceleration_mps2: 0,
          travel_direction: "IDLE",
          "safety.e_stop": false,
          "safety.brake_status": "RELEASED",
        },
      }
    );

    // 2. Update Elevator snapshot
    await Elevator.updateOne(
      { elevatorId },
      { $set: { "status.mode": "NORMAL", "status.travel_direction": "IDLE" } }
    );
    emitElevatorListUpdate();
    const audit = await auditLog({
      action: "COMMAND_START",
      elevatorId,
      payload: { reason: "Elevator Started Running" },
      user,
    });
    emitToElevator(elevatorId, "new:audit", audit);
    return {
      accepted: true,
      message: "Elevator started and ready",
      auditId: audit._id,
    };
  },

  async moveToFloor(elevatorId, targetFloor, occupancy_count, load, user) {
    const elevator = await Elevator.findOne({ elevatorId });
    if (!elevator) throw new Error("Elevator not found");
    console.log("elevator", elevator);
    const last = await Telemetry.findOne({ elevatorId })
      .sort({ ts: -1 })
      .lean();
    if (!last) {
      throw new Error("No telemetry data found for elevator");
    }

    if (last.door_state !== "CLOSED") {
      throw new Error("Door is not closed", { cause: last });
    }

    if (!last?.safety?.door_interlock_ok) {
      throw new Error("Door interlock not OK", { cause: last });
    }

    if (last?.safety?.e_stop) {
      throw new Error("Emergency stop is active", { cause: last });
    }

    // 2. Decide direction
    const currentFloor = elevator.status.floor_index || 0;
    let direction = "IDLE";
    if (targetFloor > currentFloor) direction = "UP";
    else if (targetFloor < currentFloor) direction = "DOWN";

    // check oveload

    console.log("elevator", elevator);

    if (load > elevator.status.overload_Kg) {
      throw new Error("Overload detected", { cause: last });
    }

    const result = await Elevator.updateOne(
      { elevatorId },
      {
        $set: {
          "status.floor_index": targetFloor,
          "status.mode": "NORMAL",
          "status.door_state": "CLOSED",
          "status.travel_direction": direction,
          "status.occupancy_count": occupancy_count,
          "status.load_kg": load,
        },
      }
    );

    await Telemetry.updateOne(
      { elevatorId },
      {
        $set: {
          floor_index: targetFloor,
          travel_direction: direction,
          occupancy_count: occupancy_count ?? 0,
          load_kg: load ?? 0,
        },
      }
    );

    emitToElevator(elevatorId, "update:elevator", {
      floor_index: targetFloor,
      travel_direction: targetFloor > last.floor_index ? "UP" : "DOWN",
      occupancy_count: occupancy_count ?? 0,
      load_kg: load ?? 0,
    });
    emitElevatorListUpdate();
    const audit = await auditLog({
      action: "COMMAND_MOVE",
      elevatorId,
      payload: {
        fromFloor: last.floor_index,
        toFloor: targetFloor,
      },
      user,
    });
    emitToElevator(elevatorId, "new:audit", audit);

    const passengerOut = occupancy_count - elevator.status.occupancy_count;

  await Trip.create({
      elevatorId,
      start_ts: new Date(),
      stops: [currentFloor, targetFloor], // initial stop and target
      passengers_in: occupancy_count ?? 0,
      passengers_out: Math.abs(passengerOut)
    });

    return {
      Accepted: true,
      message: `Elevator moving to floor ${targetFloor}`,
      auditId: audit._id,
    };
  },

  async doorCommand(elevatorId, action, actor) {
    if (!["OPEN", "CLOSED"].includes(action))
      throw new Error("Invalid door action");

    await Telemetry.updateOne(
      { elevatorId },
      { $set: { door_state: action === "OPEN" ? "OPEN" : "CLOSED" } }
    );
    await Elevator.updateOne(
      { elevatorId },
      {
        $set: {
          "status.door_state": action === "OPEN" ? "OPEN" : "CLOSED",
          "status.travel_direction": "IDLE",
        },
      }
    );
    emitToElevator(elevatorId, "update:elevator", {
      door_state: action,
      travel_direction: "IDLE",
    });
    const audit = await auditLog({
      action: "COMMAND_DOOR",
      elevatorId,
      payload: { action },
      user: actor,
    });
    emitToElevator(elevatorId, "new:audit", audit);
    return { accepted: true, msg: `Door is ${action}`, auditId: audit._id };
  },

  async updateSettings(elevatorId, patch, user) {
    // Only allow RC fields (settings.*)
    const $set = {};
    if (patch.setpoints) $set["settings.setpoints"] = patch.setpoints;
    if (patch.doors) $set["settings.doors"] = patch.doors;
    if (patch.ui) $set["settings.ui"] = patch.ui;
    if (patch.power_mode) $set["settings.power_mode"] = patch.power_mode;
    if (Object.keys($set).length === 0)
      throw new Error("No RC fields provided");
    const result = await Elevator.updateOne({ elevatorId }, { $set });
    const audit = await auditLog({
      action: "SETTINGS_UPDATED",
      elevatorId,
      payload: patch,
      user,
    });
    emitToElevator(elevatorId, "new:audit", audit);
    emitToElevator(elevatorId, "settings:updated", patch);
    return { updated: true, result, audit };
  },
  async currentSafetySnapshot(elevatorId) {
    // In a real system, consult the last Telemetry row
    const last = await Telemetry.findOne({ elevatorId })
      .sort({ ts: -1 })
      .lean();
    const okToMove = !!(
      last &&
      last.door_state === "CLOSED" &&
      last?.safety?.door_interlock_ok &&
      !last?.safety?.overspeed_trip &&
      last?.safety?.brake_status === "RELEASED" &&
      !last?.safety?.e_stop
    );
    return { okToMove, last };
  },
};
