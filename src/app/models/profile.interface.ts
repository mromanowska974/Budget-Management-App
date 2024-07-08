import { Expense } from "./expense.interface";
import { v4 as uuidv4 } from 'uuid';

export interface Profile {
    id?;
    PIN: string;
    name: string;
    role: string;
    categories: {id, content: string, color: string}[];
    expenses: Expense[],
    monthlyLimit: number,
    notificationTime: number
}