export interface Expense {
    id?;
    price: number;
    category: string;
    date: Date;
    isPeriodic: boolean;
    renewalTime?: number | null;
    description: string;
}