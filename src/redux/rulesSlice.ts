import { createSlice, nanoid } from '@reduxjs/toolkit';
import { PayloadAction } from '@reduxjs/toolkit';
import { Ruleset, Rule, Comparator, ActionType } from './types';
import mockData from '../../mock_data.json';

interface RulesState {
    rulesets: Ruleset[];
    activeRulesetId: string | null;
}

const transformMockData = (): Ruleset[] => {
    return mockData.rule_sets.map(ruleSet => ({
        id: ruleSet.id.toString(),
        name: ruleSet.name,
        rules: ruleSet.rules.map(rule => ({
            id: rule.id.toString(),
            unitName: rule.unitName,
            findingName: rule.findingName,
            comparator: rule.comparator === 'not present' ? 'is' as Comparator : rule.comparator as Comparator,
            measurement: rule.measurement,
            comparedValue: rule.comparator === 'not present' ? 'Not Present' : rule.comparedValue.toString(),
            action: rule.action as ActionType,
        }))
    }));
};

const initialState: RulesState = {
    rulesets: transformMockData(),
    activeRulesetId: '1',
};

const rulesSlice = createSlice({
    name: 'rules',
    initialState,
    reducers: {
        setActiveRuleset(state, action: PayloadAction<string>) {
            state.activeRulesetId = action.payload;
        },
        addRuleset(state, action: PayloadAction<{ name: string }>) {
            const newId = nanoid();
            state.rulesets.push({ id: newId, name: action.payload.name, rules: [] });
            state.activeRulesetId = newId;
        },
        editRulesetName(state, action: PayloadAction<{ id: string; name: string }>) {
            const ruleset = state.rulesets.find(r => r.id === action.payload.id);
            if (ruleset) ruleset.name = action.payload.name;
        },
        deleteRuleset(state, action: PayloadAction<string>) {
            state.rulesets = state.rulesets.filter(r => r.id !== action.payload);
            if (state.activeRulesetId === action.payload) {
                state.activeRulesetId = state.rulesets.length ? state.rulesets[0].id : null;
            }
        },
        copyRuleset(state, action: PayloadAction<string>) {
            const ruleset = state.rulesets.find(r => r.id === action.payload);
            if (ruleset) {
                const newId = nanoid();
                let newName = `${ruleset.name}_(1)`;
                let count = 1;
                while (state.rulesets.some(r => r.name === newName)) {
                    count++;
                    newName = `${ruleset.name}_(${count})`;
                }
                state.rulesets.push({
                    id: newId,
                    name: newName,
                    rules: ruleset.rules.map(rule => ({ ...rule, id: nanoid() })),
                });
                state.activeRulesetId = newId;
            }
        },
        addRule(state, action: PayloadAction<{ rulesetId: string; rule: Partial<Rule> }>) {
            const ruleset = state.rulesets.find(r => r.id === action.payload.rulesetId);
            if (ruleset) {
                const newRule: Rule = {
                    id: action.payload.rule.id || nanoid(),
                    unitName: action.payload.rule.unitName || '',
                    findingName: action.payload.rule.findingName || '',
                    comparator: action.payload.rule.comparator || 'is',
                    measurement: action.payload.rule.measurement || '',
                    comparedValue: action.payload.rule.comparedValue || 'Not Present',
                    action: action.payload.rule.action || undefined,
                };
                ruleset.rules.push(newRule);
            }
        },
        editRule(state, action: PayloadAction<{ rulesetId: string; ruleId: string; rule: Partial<Rule> }>) {
            const ruleset = state.rulesets.find(r => r.id === action.payload.rulesetId);
            if (ruleset) {
                const rule = ruleset.rules.find(rule => rule.id === action.payload.ruleId);
                if (rule) {
                    Object.assign(rule, action.payload.rule);
                }
            }
        },
        deleteRule(state, action: PayloadAction<{ rulesetId: string; ruleId: string }>) {
            const ruleset = state.rulesets.find(r => r.id === action.payload.rulesetId);
            if (ruleset) {
                ruleset.rules = ruleset.rules.filter(rule => rule.id !== action.payload.ruleId);
            }
        },
        setRulesetRules(state, action: PayloadAction<{ rulesetId: string; rules: Rule[] }>) {
            const ruleset = state.rulesets.find(r => r.id === action.payload.rulesetId);
            if (ruleset) {
                ruleset.rules = action.payload.rules;
            }
        },
        reorderRules(state, action: PayloadAction<{ rulesetId: string; startIndex: number; endIndex: number }>) {
            const ruleset = state.rulesets.find(r => r.id === action.payload.rulesetId);
            if (ruleset) {
                const { startIndex, endIndex } = action.payload;
                const rules = Array.from(ruleset.rules);
                const [removed] = rules.splice(startIndex, 1);
                rules.splice(endIndex, 0, removed);
                ruleset.rules = rules;
            }
        },
    },
});

export const {
    setActiveRuleset,
    addRuleset,
    editRulesetName,
    deleteRuleset,
    copyRuleset,
    addRule,
    editRule,
    deleteRule,
    setRulesetRules,
    reorderRules,
} = rulesSlice.actions;

export default rulesSlice.reducer; 