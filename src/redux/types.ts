export type Comparator = "is" | ">=" | "<";
export type ActionType = "Normal" | "Reflux";

export interface Rule {
    id: string;
    unitName: string;
    findingName: string;
    comparator: Comparator;
    measurement: string;
    comparedValue: string | number;
    action?: ActionType;
}

export interface Ruleset {
    id: string;
    name: string;
    rules: Rule[];
} 