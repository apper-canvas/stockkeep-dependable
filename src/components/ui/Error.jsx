import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Error = ({ message = "Something went wrong", onRetry, showRetry = true }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="bg-red-50 rounded-full p-4 mb-4">
        <ApperIcon name="AlertCircle" className="h-12 w-12 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
      <p className="text-gray-600 mb-6 max-w-md">{message}</p>
      {showRetry && onRetry && (
        <Button onClick={onRetry} variant="primary">
          <ApperIcon name="RotateCcw" className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default Error;