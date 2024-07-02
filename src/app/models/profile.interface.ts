import { Expense } from "./expense.interface";

export interface Profile {
    PIN: number;
    name: string;
    role: string;
    categories: string[];
    expenses: Expense[];
}