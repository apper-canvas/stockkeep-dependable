import React from "react";
import Label from "@/components/atoms/Label";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";

const FormField = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  error, 
  placeholder,
  required = false,
  options = [],
  className
}) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {type === "select" ? (
        <Select value={value} onChange={handleChange} error={error}>
          <option value="">Select {label}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
        </Select>
      ) : type === "textarea" ? (
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-vertical"
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          error={error}
        />
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FormField;