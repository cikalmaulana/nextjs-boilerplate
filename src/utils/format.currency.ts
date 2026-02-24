export function formatCurrency(amount: number, currency: string = "IDR"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(amount);
}