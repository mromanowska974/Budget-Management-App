export interface Expense {
    id?;
    price: number;
    category: string;
    date: string;
    isPeriodic: boolean;
    renewalTime?: number | null;
    description: string;
}