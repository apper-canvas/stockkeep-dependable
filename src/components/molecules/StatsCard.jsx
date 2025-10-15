import React from "react";
import { Card, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const StatsCard = ({ title, value, icon, trend, trendValue, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-500 text-blue-50",
    green: "bg-green-500 text-green-50",
    yellow: "bg-yellow-500 text-yellow-50",
    red: "bg-red-500 text-red-50"
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {trend && (
              <div className={`flex items-center mt-2 text-sm ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}>
                <ApperIcon 
                  name={trend === "up" ? "TrendingUp" : "TrendingDown"} 
                  className="h-4 w-4 mr-1" 
                />
                {trendValue}
              </div>
            )}
          </div>
          <div className={`rounded-full p-3 ${colors[color]}`}>
            <ApperIcon name={icon} className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;