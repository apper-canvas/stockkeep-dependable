import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", to: "", icon: "LayoutDashboard" },
    { name: "Products", to: "products", icon: "Package" },
    { name: "Categories", to: "categories", icon: "Tag" },
    { name: "Suppliers", to: "suppliers", icon: "Building2" }
  ];

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-primary rounded-lg p-2">
                  <ApperIcon name="Package" className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">StockKeep</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to === "" ? "/" : `/${item.to}`}
                  className={({ isActive }) =>
                    `inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? "bg-blue-50 text-primary border-b-2 border-primary"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`
                  }
                >
                  <ApperIcon name={item.icon} className="h-4 w-4 mr-2" />
                  {item.name}
                </NavLink>
              ))}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <ApperIcon name={mobileMenuOpen ? "X" : "Menu"} className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg">
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold">Menu</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ApperIcon name="X" className="h-5 w-5" />
                </Button>
              </div>
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to === "" ? "/" : `/${item.to}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive
                          ? "bg-blue-50 text-primary"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`
                    }
                  >
                    <ApperIcon name={item.icon} className="h-4 w-4 mr-3" />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;