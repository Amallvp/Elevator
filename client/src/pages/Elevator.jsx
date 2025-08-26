import React from "react";


export default function Elevators({ onSelectElevator, elevators }) {


console.log("new",elevators);


  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Elevators</h1>
      <table className="w-full bg-white shadow rounded text-sm">
        <thead>
          <tr className="bg-gray-200 text-center">
            <th className="p-3">ID</th>
            <th className="p-3">Total Floor</th>
            <th className="p-3">Current Floor</th>
            <th className="p-3">Mode</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y text-center">
          {elevators.map((e) => (
            <tr
              key={e._id}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="p-3">{e.elevatorId}</td>
              <td className="p-3">{e.building?.floors_total}</td>
              <td className="p-3">{e.status?.floor_index}</td>
              <td className="p-3">{e.status?.mode}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    e.status?.mode === "NORMAL"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {e.status?.mode === "NORMAL" ? "ONLINE" : "OFFLINE"}
                </span>
              </td>
              <td
                className="p-3 text-blue-600 cursor-pointer font-semibold text-center"
                onClick={() => onSelectElevator(e.elevatorId)}
              >
                View
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
