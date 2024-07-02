import { Expense } from "./expense.interface";

export interface Profile {
    PIN: number;
    name: string;
    role: string;
    categories: {content: string, color: string}[];
    expenses: Expense[];
}