// import React from "react";

// export default function Maintenance() {
//   const tasks = [
//     { id: 1, elevator: "A1", task: "Brake Inspection", status: "PENDING", due: "Tomorrow" },
//     { id: 2, elevator: "B2", task: "Rope Tension Check", status: "IN PROGRESS", due: "Today" },
//     { id: 3, elevator: "A1", task: "Door Alignment", status: "COMPLETED", due: "Yesterday" },
//   ];

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-4">Maintenance</h1>
//       <table className="w-full bg-white shadow rounded text-sm">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="p-2">Elevator</th>
//             <th>Task</th>
//             <th>Status</th>
//             <th>Due</th>
//           </tr>
//         </thead>
//         <tbody>
//           {tasks.map(t => (
//             <tr key={t.id} className="border-b">
//               <td className="p-2">{t.elevator}</td>
//               <td>{t.task}</td>
//               <td>
//                 <span className={`px-2 py-1 rounded text-xs ${
//                   t.status === "COMPLETED"
//                     ? "bg-green-200"
//                     : t.status === "IN PROGRESS"
//                     ? "bg-yellow-200"
//                     : "bg-red-200"
//                 }`}>
//                   {t.status}
//                 </span>
//               </td>
//               <td>{t.due}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Maintenance Mode Toggle (static) */}
//       <div className="bg-white shadow p-4 rounded mt-6">
//         <h2 className="font-bold mb-2">Set Maintenance Mode</h2>
//         <p>Elevator A1 is currently in: <strong>Normal Mode</strong></p>
//         <button className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
//           Switch to Maintenance Mode
//         </button>
//       </div>
//     </div>
//   );
// }
