// import React from "react";

// export default function Faults() {
//   const faults = [
//     { id: 1, elevator: "A1", type: "Overspeed", severity: "CRITICAL", time: "10:20 AM" },
//     { id: 2, elevator: "B2", type: "Door Obstruction", severity: "WARNING", time: "9:50 AM" },
//   ];

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-4">Faults</h1>
//       <table className="w-full bg-white shadow rounded text-sm">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="p-2">Elevator</th>
//             <th>Fault</th>
//             <th>Severity</th>
//             <th>Time</th>
//           </tr>
//         </thead>
//         <tbody>
//           {faults.map(f => (
//             <tr key={f.id} className="border-b">
//               <td className="p-2">{f.elevator}</td>
//               <td>{f.type}</td>
//               <td>
//                 <span className={`px-2 py-1 rounded text-xs ${
//                   f.severity === "CRITICAL" ? "bg-red-200" : "bg-yellow-200"
//                 }`}>
//                   {f.severity}
//                 </span>
//               </td>
//               <td>{f.time}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
