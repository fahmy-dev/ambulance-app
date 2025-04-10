import React from "react";

function Requests() {
  // Sample data - you'd normally fetch this from an API
  const myRequests = [
    { id: 1, status: "Pending", date: "2025-04-09", location: "Downtown" },
    { id: 2, status: "Completed", date: "2025-04-08", location: "West Side" },
  ];

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">My Ambulance Requests</h1>
      <p className="text-gray-600 text-center mb-6">
        Here you can view the status of your recent ambulance requests.
      </p>

      {myRequests.length > 0 ? (
        <ul className="space-y-4">
          {myRequests.map((req) => (
            <li key={req.id} className="border p-4 rounded shadow">
              <div className="flex justify-between">
                <span className="font-semibold">Date:</span> <span>{req.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Location:</span> <span>{req.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Status:</span>
                <span
                  className={`font-bold ${
                    req.status === "Completed" ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {req.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">You haven't made any requests yet.</p>
      )}
    </div>
  );
}

export default Requests;
