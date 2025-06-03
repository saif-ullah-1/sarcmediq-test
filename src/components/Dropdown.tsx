import React from "react";
import { DropdownProps } from "../types/components";

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  addNewLabel,
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded px-3 py-2 sm:px-4 sm:py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:min-w-[260px] text-sm sm:text-base"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
      {addNewLabel && <option value="__add_new__">{addNewLabel}</option>}
    </select>
  );
};

export default Dropdown;
