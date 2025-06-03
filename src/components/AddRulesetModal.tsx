import React, { useState, useEffect } from "react";
import { AddRulesetModalProps } from "../types/components";

const AddRulesetModal: React.FC<AddRulesetModalProps> = ({
  open,
  onConfirm,
  onCancel,
  existingNames,
}) => {
  const [rulesetName, setRulesetName] = useState("");

  useEffect(() => {
    if (open) {
      setRulesetName("");
    }
  }, [open]);

  const isDuplicate = Boolean(
    rulesetName.trim() &&
      existingNames &&
      existingNames.some(
        (name) => name.toLowerCase() === rulesetName.trim().toLowerCase()
      )
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rulesetName.trim() && !isDuplicate) {
      onConfirm(rulesetName.trim());
      setRulesetName("");
    }
  };

  const handleCancel = () => {
    setRulesetName("");
    onCancel();
  };

  const isCreateDisabled = !rulesetName.trim() || isDuplicate;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div
        className="absolute inset-0 bg-white bg-opacity-50"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(1px)",
          WebkitBackdropFilter: "blur(1px)",
        }}
        onClick={handleCancel}
      ></div>

      <div className="relative bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md mx-2 sm:mx-4">
        <div className="flex items-center mb-3 sm:mb-4">
          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
            <svg
              className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Add New Ruleset
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Enter a name for your new ruleset
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3 sm:mb-4">
            <label
              htmlFor="rulesetName"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
            >
              Ruleset Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="rulesetName"
              value={rulesetName}
              onChange={(e) => setRulesetName(e.target.value)}
              placeholder="Enter ruleset name..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm sm:text-base ${
                isDuplicate
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              autoFocus
            />
            {isDuplicate && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">
                A ruleset with this name already exists
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-2 sm:px-4 sm:py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md font-medium transition-colors cursor-pointer text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreateDisabled}
              className={`px-3 py-2 sm:px-4 sm:py-2 font-medium rounded-md transition-colors text-sm sm:text-base ${
                isCreateDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
              }`}
            >
              Create Ruleset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRulesetModal;
