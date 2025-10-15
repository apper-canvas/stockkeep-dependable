import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className={`rounded-full p-2 ${
                variant === "danger" ? "bg-red-100" : "bg-yellow-100"
              }`}>
                <ApperIcon 
                  name={variant === "danger" ? "AlertTriangle" : "HelpCircle"} 
                  className={`h-6 w-6 ${
                    variant === "danger" ? "text-red-600" : "text-yellow-600"
                  }`} 
                />
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              {cancelText}
            </Button>
            <Button variant={variant} onClick={onConfirm}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;