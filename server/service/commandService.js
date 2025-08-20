import { Elevator } from "../models/elevator.js";
import { Audit } from "../models/audit.js";
import { emitToElevator } from "../config/socket.js";
import { Telemetry } from "../models/Telemetry.js";

export const CommandService = {


  async emergencyStop(elevatorId, user) {
    // 1. Update telemetry to reflect emergency stop
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

    // 2. Emit command to physical/simulated elevator
    emitToElevator(elevatorId, "command:stop", {});

    // 3. Log in Audit
    await Audit.create({
      action: "COMMAND_STOP",
      elevatorId,
      payload: { reason: "Emergency stop triggered" },
      ...user,
    });

    return { accepted: true, msg: "Emergency stop applied, brakes engaged" };
  },


async startElevator(elevatorId, user) {
  // 1. Reset safety state in Telemetry
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
    {
      $set: {
        "status.mode": "NORMAL",
        "status.travel_direction": "IDLE",
      },
    }
  );

  // 3. Emit command (socket or MQTT)
  emitToElevator(elevatorId, "command:start", {});

  // 4. Audit log
  await Audit.create({
    action: "COMMAND_START",
    elevatorId,
    payload: {},
    ...user,
  });

  return { accepted: true, message: "Elevator started and ready" };
},

  async moveToFloor(elevatorId, targetFloor, occupancy_count, user) {
    const elevator = await Elevator.findOne({ elevatorId });
    if (!elevator) throw new Error("Elevator not found");

    const last = await Telemetry.findOne({ elevatorId })
      .sort({ ts: -1 })
      .lean();
    if (
      !last ||
      last.door_state !== "CLOSED" ||
      !last?.safety?.door_interlock_ok ||
      last?.safety?.e_stop
    ) 
    {
      throw new Error("Safety interlock prevents motion");
    }

    // 2. Decide direction
    const currentFloor = elevator.status.floor_index || 0;
    let direction = "IDLE";
    if (targetFloor > currentFloor) direction = "UP";
    else if (targetFloor < currentFloor) direction = "DOWN";

    await Elevator.updateOne(
      { elevatorId },
      {
        $set: {
          "status.floor_index": targetFloor,
          "status.mode": "NORMAL",
          "status.door_state": "CLOSED",
          "status.travel_direction": direction,
          "status.occupancy_count": occupancy_count || 0,
        },
      }
    );

    // 2. Update telemetry → simulate brake release
    await Telemetry.updateOne(
      { elevatorId },
      { $set: { "safety.brake_status": "RELEASED" } }
    );

    // 3. Emit command
    emitToElevator(elevatorId, "command:move", { targetFloor });

    // 4. Audit log
    await Audit.create({
      action: "COMMAND_MOVE",
      elevatorId,
      payload: { targetFloor },
      ...user,
    });

    return { Accepted: true };
  },


  async doorCommand(elevatorId, action, actor) {
    if (!["open", "close"].includes(action))
      throw new Error("Invalid door action");

    // 1. Update telemetry immediately
    await Telemetry.updateOne(
      { elevatorId },
      {
        $set: {
         door_state: action === "open" ? "OPEN" : "CLOSED",
        },
      }
    );

    // 2. Emit door command
    emitToElevator(elevatorId, "command:door", { action });

    // 3. Audit log
    await Audit.create({
      action: "COMMAND_DOOR",
      elevatorId,
      payload: { action },
      ...actor,
    });

    return { accepted: true, msg: `Door is ${action}` };
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
    const audit = await Audit.create({
      action: "SETTINGS_UPDATED",
      elevatorId,
      payload: patch,
      ...user,
    });
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
