import React from "react";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const StatusBadge = ({ status, quantity, minStockLevel }) => {
  let variant, icon, text;
  
  if (quantity <= 0) {
    variant = "error";
    icon = "XCircle";
    text = "Out of Stock";
  } else if (quantity <= minStockLevel) {
    variant = "warning";
    icon = "AlertTriangle";
    text = "Low Stock";
  } else {
    variant = "success";
    icon = "CheckCircle";
    text = "In Stock";
  }

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <ApperIcon name={icon} className="h-3 w-3" />
      {text}
    </Badge>
  );
};

export default StatusBadge;