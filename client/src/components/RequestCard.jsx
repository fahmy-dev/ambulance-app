import React from "react";

function RequestCard({ request, onClick }) {
  const getStatusIcon = (status) => {
    if (status === "Pending") {
      return <span className="inline-flex items-center justify-center w-6 h-6 text-yellow-500">⊙</span>;
    } else if (status === "Done") {
      return <span className="inline-flex items-center justify-center w-6 h-6 text-green-500">✓</span>;
    } else if (status === "Rejected") {
      return <span className="inline-flex items-center justify-center w-6 h-6 text-red-500">✕</span>;
    }
    return null;
  };

  const getStatusClass = (status) => {
    if (status === "Pending") return "bg-yellow-50 text-yellow-800";
    if (status === "Done") return "bg-green-50 text-green-800";
    if (status === "Rejected") return "bg-red-50 text-red-800";
    return "bg-gray-50 text-gray-800";
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div 
      className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer"
      onClick={() => onClick && onClick(request)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-medium text-gray-900">#{request.id}</h3>
          <p className="text-sm text-gray-600">{request.hospital}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(request.status)}`}>
          <div className="flex items-center">
            {getStatusIcon(request.status)}
            <span className="ml-1">{request.status}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-500">Requested:</p>
          <p className="font-medium">{formatDate(request.date)}</p>
        </div>
        
        {request.type && (
          <div>
            <p className="text-gray-500">Type:</p>
            <p className="font-medium">{request.type}</p>
          </div>
        )}
        
        {request.status === "Pending" && request.eta && (
          <div className="col-span-2 mt-2">
            <p className="text-gray-500">Estimated completion:</p>
            <p className="font-medium">{request.eta}</p>
          </div>
        )}
        
        {request.status === "Done" && request.completedDate && (
          <div className="col-span-2 mt-2">
            <p className="text-gray-500">Completed on:</p>
            <p className="font-medium">{formatDate(request.completedDate)}</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
        <button 
          className="text-sm text-blue-600 hover:text-blue-800"
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/requests/${request.id}`;
          }}
        >
          View details →
        </button>
      </div>
    </div>
  );
}

export default RequestCard;