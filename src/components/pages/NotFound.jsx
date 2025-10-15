import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <ApperIcon name="FileQuestion" className="h-12 w-12 text-gray-500" />
        </div>
        
        <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => navigate("/")} 
            variant="primary"
            className="w-full"
          >
            <ApperIcon name="Home" className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Button 
            onClick={() => navigate("/products")} 
            variant="outline"
            className="w-full"
          >
            <ApperIcon name="Package" className="h-4 w-4 mr-2" />
            View Products
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;