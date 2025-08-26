import React from "react";


export default function Trips({trips}) {


  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Trips</h1>
      <table className="w-full bg-white shadow rounded text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Trip ID</th>
            <th className="text-left">Elevator</th>
            <th className="text-left">Start Floor</th>
            <th className="text-left">End Floor</th>
            <th className="text-left">Start Time</th>
            <th className="text-left">End Time</th>
          </tr>
        </thead>
        <tbody>
          {trips.map((t) => {
            const startTime = t.start_ts ? new Date(t.start_ts) : null;
            const endTime = t.updatedAt
              ? new Date(new Date(t.updatedAt).getTime() + 5 * 60 * 1000) // +5 minutes
              : null;

            return (
              <tr key={t._id} className="border-b">
                {/* Trip ID last 4 chars */}
                <td className="p-2">{t._id.slice(-4)}</td>

                {/* Elevator ID */}
                <td>{t.elevatorId || "-"}</td>

                {/* Start Floor */}
                <td>{t.stops?.[0] ?? "-"}</td>

                {/* End Floor */}
                <td>{t.stops?.[t.stops.length - 1] ?? "-"}</td>

                {/* Start Time */}
                <td>{startTime ? startTime.toLocaleString() : "-"}</td>

                {/* End Time */}
                <td>{endTime ? endTime.toLocaleString() : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
