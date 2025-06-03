import { Rule } from "../redux/types";

export interface DragItem {
    index: number;
    id: string;
    type: string;
}

export interface RulesTableProps {
    rules: Rule[];
    onDelete?: (ruleId: string) => void;
    onUpdateRule?: (ruleId: string, updatedRule: Partial<Rule>) => void;
    onReorder?: (startIndex: number, endIndex: number) => void;
    readOnly?: boolean;
    newlyAddedRuleId?: string;
    showValidation?: boolean;
    resetAllEditsCounter?: number;
    onCommitNewRule?: (ruleId: string, rule: Rule) => void;
    dragDisabled?: boolean;
}

export interface DraggableRowProps {
    rule: Rule;
    index: number;
    moveRow: (dragIndex: number, hoverIndex: number) => void;
    readOnly?: boolean;
    isNewRule: boolean;
    isEditing: boolean;
    showValidation?: boolean;
    onStartEdit: (ruleId: string) => void;
    onSaveEdit: (ruleId: string) => void;
    onCancelEdit: (ruleId: string) => void;
    onDelete?: (ruleId: string) => void;
    handleFieldUpdate: (ruleId: string, field: keyof Rule, value: string) => void;
    handleComparatorChange: (ruleId: string, comparator: string) => void;
}

export interface DropdownOption {
    label: string;
    value: string;
}

export interface DropdownProps {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    addNewLabel?: string;
}

export interface ConfirmationModalProps {
    open: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export interface AddRulesetModalProps {
    open: boolean;
    onConfirm: (name: string) => void;
    onCancel: () => void;
    existingNames: string[];
} 