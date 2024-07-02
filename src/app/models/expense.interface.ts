export interface Expense {
    price: number;
    category: string;
    date: Date;
    isPeriodic: boolean;
    renewalTime?: number;
    description: string;
}