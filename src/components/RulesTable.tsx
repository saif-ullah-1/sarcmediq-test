import React, { useState, useEffect } from "react";
import { Comparator, Rule } from "../redux/types";
import DraggableRow from "./DraggableRow";
import { RulesTableProps } from "../types/components";

const RulesTable: React.FC<RulesTableProps> = ({
  rules,
  onDelete,
  onUpdateRule,
  onReorder,
  readOnly,
  newlyAddedRuleId,
  showValidation,
  resetAllEditsCounter,
  onCommitNewRule,
  dragDisabled,
}) => {
  const [focusedRuleId, setFocusedRuleId] = useState<string | null>(null);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [draftRule, setDraftRule] = useState<Rule | null>(null);
  const [draggedRules, setDraggedRules] = useState(rules);

  useEffect(() => {
    if (newlyAddedRuleId) {
      setFocusedRuleId(newlyAddedRuleId);
      setEditingRuleId(newlyAddedRuleId);
      const newRule = rules.find((r) => r.id === newlyAddedRuleId);
      if (newRule) {
        setDraftRule(newRule);
      }
    }
  }, [newlyAddedRuleId, rules]);

  useEffect(() => {
    setDraggedRules(rules);
  }, [rules]);

  useEffect(() => {
    if (resetAllEditsCounter) {
      setEditingRuleId(null);
      setDraftRule(null);
      setFocusedRuleId(null);
    }
  }, [resetAllEditsCounter]);

  const handleFieldUpdate = (
    ruleId: string,
    field: keyof Rule,
    value: string
  ) => {
    if (editingRuleId === ruleId && draftRule) {
      setDraftRule({
        ...draftRule,
        [field]: value,
      });
    } else if (onUpdateRule) {
      onUpdateRule(ruleId, { [field]: value });
    }
  };

  const handleComparatorChange = (ruleId: string, comparator: string) => {
    if (editingRuleId === ruleId && draftRule) {
      const updates: Partial<Rule> = { comparator: comparator as Comparator };
      if (comparator === "is") {
        updates.comparedValue = "Not Present";
        updates.unitName = "";
      } else {
        updates.comparedValue = "500";
        updates.unitName = "ms";
      }
      setDraftRule({
        ...draftRule,
        ...updates,
      });
    } else {
      const updates: Partial<Rule> = { comparator: comparator as Comparator };
      if (comparator === "is") {
        updates.comparedValue = "Not Present";
        updates.unitName = "";
      } else {
        updates.comparedValue = "500";
        updates.unitName = "ms";
      }
      if (onUpdateRule) {
        onUpdateRule(ruleId, updates);
      }
    }
  };

  const isNewRule = (ruleId: string) =>
    ruleId === focusedRuleId || ruleId === newlyAddedRuleId;

  const handleStartEdit = (ruleId: string) => {
    const ruleToEdit = rules.find((r) => r.id === ruleId);
    if (ruleToEdit) {
      setEditingRuleId(ruleId);
      setDraftRule({ ...ruleToEdit });
    }
  };

  const handleSaveEdit = (ruleId: string) => {
    if (draftRule) {
      if (ruleId === newlyAddedRuleId && onCommitNewRule) {
        onCommitNewRule(ruleId, draftRule);
      } else if (onUpdateRule) {
        onUpdateRule(ruleId, draftRule);
      }
    }
    setEditingRuleId(null);
    setDraftRule(null);
    if (ruleId === newlyAddedRuleId) {
      setFocusedRuleId(null);
    }
  };

  const handleCancelEdit = (ruleId: string) => {
    setEditingRuleId(null);
    setDraftRule(null);
    setFocusedRuleId(null);
    if (ruleId === newlyAddedRuleId && onDelete) {
      onDelete(ruleId);
    }
  };

  const getCurrentRuleData = (rule: Rule): Rule => {
    if (editingRuleId === rule.id && draftRule) {
      return draftRule;
    }
    return rule;
  };

  const moveRow = (dragIndex: number, hoverIndex: number) => {
    const newRules = [...draggedRules];
    const draggedRule = newRules[dragIndex];
    newRules.splice(dragIndex, 1);
    newRules.splice(hoverIndex, 0, draggedRule);
    setDraggedRules(newRules);

    if (onReorder && dragIndex !== hoverIndex) {
      onReorder(dragIndex, hoverIndex);
    }
  };

  return (
    <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              {!readOnly && (
                <th className="w-8 sm:w-12 py-2 sm:py-3 px-1 sm:px-2"></th>
              )}
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 text-xs uppercase tracking-wider min-w-[80px]">
                RULE #
              </th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 text-xs uppercase tracking-wider min-w-[200px]">
                MEASUREMENT CONDITION
              </th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 text-xs uppercase tracking-wider min-w-[180px]">
                FINDING ITEM
              </th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 text-xs uppercase tracking-wider min-w-[120px]">
                ACTION
              </th>
              {!readOnly && (
                <>
                  <th className="w-12 sm:w-16"></th>
                  <th className="w-12 sm:w-16"></th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white">
            {draggedRules.map((rule, idx) => (
              <DraggableRow
                key={rule.id}
                rule={getCurrentRuleData(rule)}
                index={idx}
                moveRow={moveRow}
                readOnly={readOnly || dragDisabled}
                isNewRule={isNewRule(rule.id)}
                isEditing={editingRuleId === rule.id}
                showValidation={showValidation}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                handleFieldUpdate={handleFieldUpdate}
                handleComparatorChange={handleComparatorChange}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RulesTable;
