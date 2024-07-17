import { Expense } from "./expense.interface";
import { Message } from "./message.interface";

export interface Profile {
    id?;
    PIN: string;
    name: string;
    role: string;
    categories?: {id, content: string, color: string}[];
    expenses?: Expense[],
    messages?: Message[], 
    monthlyLimit: number,
    notificationTime: number
}