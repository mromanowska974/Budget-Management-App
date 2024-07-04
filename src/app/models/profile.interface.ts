import { Expense } from "./expense.interface";

export interface Profile {
    PIN: string;
    name: string;
    role: string;
    categories: {content: string, color: string}[];
    expenses: Expense[];
}