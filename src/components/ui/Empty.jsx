import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Empty = ({ 
  title = "No items found", 
  description = "Get started by adding your first item.",
  icon = "Package",
  actionLabel = "Add Item",
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="bg-blue-50 rounded-full p-4 mb-4">
        <ApperIcon name={icon} className="h-12 w-12 text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      {onAction && (
        <Button onClick={onAction} variant="primary">
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default Empty;