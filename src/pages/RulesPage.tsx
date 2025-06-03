import React, { useState, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { RootState } from "../redux/store";
import { Rule } from "../redux/types";
import {
  setActiveRuleset,
  copyRuleset,
  deleteRuleset,
  editRulesetName,
  addRuleset,
  addRule,
  editRule,
  deleteRule,
  reorderRules,
} from "../redux/rulesSlice";
import Dropdown from "../components/Dropdown";
import RulesTable from "../components/RulesTable";
import ConfirmationModal from "../components/ConfirmationModal";
import AddRulesetModal from "../components/AddRulesetModal";

const RulesPage: React.FC = () => {
  const dispatch = useDispatch();
  const { rulesets, activeRulesetId } = useSelector(
    (state: RootState) => state.rules
  );
  const activeRuleset = rulesets.find((r) => r.id === activeRulesetId);

  const [mode, setMode] = useState<"view" | "edit">("view");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAddRulesetModal, setShowAddRulesetModal] = useState(false);
  const [newlyAddedRuleId, setNewlyAddedRuleId] = useState<string | null>(null);
  const [tempNewRule, setTempNewRule] = useState<Rule | null>(null);
  const [resetAllEditsCounter, setResetAllEditsCounter] = useState(0);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [dragDisabled, setDragDisabled] = useState(false);

  const dropdownOptions = useMemo(
    () => rulesets.map((r) => ({ label: r.name, value: r.id })),
    [rulesets]
  );

  const handleDropdownChange = useCallback(
    (value: string) => {
      if (value === "__add_new__") {
        setShowAddRulesetModal(true);
      } else {
        dispatch(setActiveRuleset(value));
      }
    },
    [dispatch]
  );

  const handleAddRulesetConfirm = useCallback(
    (name: string) => {
      dispatch(addRuleset({ name }));
      setShowAddRulesetModal(false);
    },
    [dispatch]
  );

  const handleAddRulesetCancel = useCallback(() => {
    setShowAddRulesetModal(false);
  }, []);

  const handleCopy = useCallback(() => {
    if (activeRulesetId) {
      setDragDisabled(true);
      dispatch(copyRuleset(activeRulesetId));
      setTimeout(() => setDragDisabled(false), 100);
    }
  }, [dispatch, activeRulesetId]);

  const handleEdit = useCallback(() => setMode("edit"), []);

  const handleCancel = useCallback(() => setShowCancelModal(true), []);

  const confirmCancel = useCallback(() => {
    setMode("view");
    setShowCancelModal(false);
    setTempNewRule(null);
    setNewlyAddedRuleId(null);
    setResetAllEditsCounter((prev) => prev + 1);
    setShowValidationErrors(false);
  }, []);

  const cancelCancel = useCallback(() => setShowCancelModal(false), []);

  const handleDeleteRuleset = useCallback(() => setShowDeleteModal(true), []);

  const confirmDelete = useCallback(() => {
    if (activeRulesetId) dispatch(deleteRuleset(activeRulesetId));
    setShowDeleteModal(false);
    setMode("view");
    setTempNewRule(null);
    setNewlyAddedRuleId(null);
    setShowValidationErrors(false);
  }, [dispatch, activeRulesetId]);

  const cancelDelete = useCallback(() => setShowDeleteModal(false), []);

  const isRuleComplete = useCallback((rule: Rule): boolean => {
    const requiredFields = [
      rule.measurement?.trim(),
      rule.findingName?.trim(),
      rule.action,
    ];

    const hasRequiredFields = requiredFields.every(
      (field) => field && field !== ""
    );

    if (rule.comparator !== "is") {
      return hasRequiredFields && rule.unitName?.trim() !== "";
    }

    return hasRequiredFields;
  }, []);

  const hasIncompleteRule = useCallback(() => {
    if (!activeRuleset) return false;

    const allRules = [...activeRuleset.rules];
    if (tempNewRule) {
      allRules.push(tempNewRule);
    }

    return allRules.some((rule) => !isRuleComplete(rule));
  }, [activeRuleset, tempNewRule, isRuleComplete]);

  const handleSave = useCallback(() => {
    if (hasIncompleteRule()) {
      setShowValidationErrors(true);
      alert("Please complete all required fields before saving.");
      return;
    }

    const currentName = activeRuleset?.name?.trim();
    const isDuplicateName =
      currentName &&
      rulesets.some(
        (r) =>
          r.id !== activeRulesetId &&
          r.name.toLowerCase() === currentName.toLowerCase()
      );

    if (isDuplicateName) {
      alert(
        "A ruleset with this name already exists. Please choose a different name."
      );
      return;
    }

    if (tempNewRule && activeRulesetId) {
      dispatch(
        addRule({
          rulesetId: activeRulesetId,
          rule: tempNewRule,
        })
      );
    }
    setMode("view");
    setTempNewRule(null);
    setNewlyAddedRuleId(null);
    setShowValidationErrors(false);
  }, [
    hasIncompleteRule,
    tempNewRule,
    activeRulesetId,
    dispatch,
    activeRuleset,
    rulesets,
  ]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (activeRulesetId) {
        dispatch(
          editRulesetName({ id: activeRulesetId, name: e.target.value })
        );
      }
    },
    [dispatch, activeRulesetId]
  );

  const handleDeleteRule = useCallback(
    (ruleId: string) => {
      if (ruleId === newlyAddedRuleId) {
        setTempNewRule(null);
        setNewlyAddedRuleId(null);
      } else if (activeRulesetId) {
        dispatch(
          deleteRule({
            rulesetId: activeRulesetId,
            ruleId,
          })
        );
      }
    },
    [newlyAddedRuleId, activeRulesetId, dispatch]
  );

  const handleAddNewRule = useCallback(() => {
    if (activeRulesetId) {
      if (hasIncompleteRule()) {
        alert(
          "Please complete all required fields in the existing rules before adding a new rule."
        );
        return;
      }

      const newRuleId = `rule-${Date.now()}`;
      const newRule: Rule = {
        id: newRuleId,
        measurement: "",
        comparator: "is",
        comparedValue: "Not Present",
        findingName: "",
        action: undefined,
        unitName: "",
      };

      setTempNewRule(newRule);
      setNewlyAddedRuleId(newRuleId);

      setTimeout(() => {
        const tableContainer = document.querySelector("table");
        if (tableContainer) {
          tableContainer.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }, 100);
    }
  }, [activeRulesetId, hasIncompleteRule]);

  const handleUpdateRule = useCallback(
    (ruleId: string, updatedRule: Partial<Rule>) => {
      if (ruleId === newlyAddedRuleId && tempNewRule) {
        setTempNewRule({ ...tempNewRule, ...updatedRule });
      } else if (activeRulesetId) {
        dispatch(
          editRule({
            rulesetId: activeRulesetId,
            ruleId,
            rule: updatedRule,
          })
        );
      }
    },
    [newlyAddedRuleId, tempNewRule, activeRulesetId, dispatch]
  );

  const handleCommitNewRule = useCallback(
    (ruleId: string, rule: Rule) => {
      if (ruleId === newlyAddedRuleId && activeRulesetId) {
        if (!isRuleComplete(rule)) {
          alert("Please complete all required fields before saving.");
          return;
        }

        dispatch(
          addRule({
            rulesetId: activeRulesetId,
            rule: rule,
          })
        );
        setTempNewRule(null);
        setNewlyAddedRuleId(null);
      }
    },
    [newlyAddedRuleId, activeRulesetId, isRuleComplete, dispatch]
  );

  const handleReorderRules = useCallback(
    (startIndex: number, endIndex: number) => {
      if (activeRulesetId && startIndex !== endIndex) {
        dispatch(
          reorderRules({
            rulesetId: activeRulesetId,
            startIndex,
            endIndex,
          })
        );
      }
    },
    [activeRulesetId, dispatch]
  );

  const getAllRules = useMemo((): Rule[] => {
    if (!activeRuleset) return [];
    const rules = [...activeRuleset.rules];
    if (tempNewRule) {
      rules.push(tempNewRule);
    }
    return rules;
  }, [activeRuleset, tempNewRule]);

  return (
    <DndProvider backend={HTML5Backend} key={activeRulesetId}>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            {mode === "view" ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                <div className="flex items-center gap-4">
                  {rulesets.length > 0 ? (
                    <Dropdown
                      options={dropdownOptions}
                      value={activeRulesetId || ""}
                      onChange={handleDropdownChange}
                      addNewLabel="+Add New Ruleset"
                    />
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="text-gray-600 font-medium text-sm sm:text-base">
                        No Rulesets Available
                      </div>
                      <button
                        onClick={() => setShowAddRulesetModal(true)}
                        className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors cursor-pointer text-sm sm:text-base"
                      >
                        Add Ruleset
                      </button>
                    </div>
                  )}
                </div>
                {activeRuleset && (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={handleEdit}
                      className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md transition-colors cursor-pointer text-sm sm:text-base"
                    >
                      Edit Rules
                    </button>
                    <button
                      onClick={handleCopy}
                      className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors cursor-pointer text-sm sm:text-base"
                    >
                      Copy Ruleset
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 sm:mb-6 gap-4">
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={activeRuleset?.name || ""}
                    onChange={handleNameChange}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 font-medium w-full sm:min-w-[300px] lg:min-w-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={handleSave}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors cursor-pointer text-sm sm:text-base"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md transition-colors cursor-pointer text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNewRule}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-md transition-colors cursor-pointer text-sm sm:text-base"
                  >
                    Add New Rule
                  </button>
                  <button
                    onClick={handleDeleteRuleset}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors cursor-pointer text-sm sm:text-base"
                  >
                    Delete RuleSet
                  </button>
                </div>
              </div>
            )}

            {activeRuleset ? (
              <RulesTable
                key={activeRulesetId}
                rules={getAllRules}
                readOnly={mode === "view"}
                onUpdateRule={handleUpdateRule}
                onDelete={handleDeleteRule}
                onReorder={handleReorderRules}
                newlyAddedRuleId={newlyAddedRuleId || undefined}
                showValidation={showValidationErrors}
                resetAllEditsCounter={resetAllEditsCounter}
                onCommitNewRule={handleCommitNewRule}
                dragDisabled={dragDisabled}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    No Ruleset Selected
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 max-w-md">
                    {rulesets.length === 0
                      ? "You don't have any rulesets yet. Create your first ruleset to get started."
                      : "Please select a ruleset from the dropdown above to view and manage rules."}
                  </p>
                  {rulesets.length === 0 && (
                    <button
                      onClick={() => setShowAddRulesetModal(true)}
                      className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors cursor-pointer text-sm sm:text-base"
                    >
                      Create Your First Ruleset
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <ConfirmationModal
          open={showDeleteModal}
          message="Are you sure you want to delete this ruleset?"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
        <ConfirmationModal
          open={showCancelModal}
          message="Are you sure you want to cancel your changes?"
          onConfirm={confirmCancel}
          onCancel={cancelCancel}
        />
        <AddRulesetModal
          open={showAddRulesetModal}
          onConfirm={handleAddRulesetConfirm}
          onCancel={handleAddRulesetCancel}
          existingNames={rulesets.map((r) => r.name)}
        />
      </div>
    </DndProvider>
  );
};

export default RulesPage;
