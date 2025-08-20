export const SafetyInterlocks = {
  canMove(current) {
    const s = current?.safety || {};
    const doorClosed = current?.door_state === 'CLOSED' && current?.door_interlock_ok !== false;
    const overspeedOk = s?.overspeed_trip === false || s?.overspeed_trip === undefined;
    const brakeReleased = s?.brake_status === 'RELEASED' || s?.brake_status === undefined;
    const estopInactive = s?.e_stop === false || s?.e_stop === undefined;
    return doorClosed && overspeedOk && brakeReleased && estopInactive;
  }
};