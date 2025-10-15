import React from "react";

const Loading = ({ rows = 5 }) => {
  return (
    <div className="space-y-4 p-6">
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="h-6 bg-gray-300 rounded w-1/4"></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[...Array(6)].map((_, index) => (
                    <th key={index} className="px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(rows)].map((_, rowIndex) => (
                  <tr key={rowIndex} className="border-t">
                    {[...Array(6)].map((_, colIndex) => (
                      <td key={colIndex} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;