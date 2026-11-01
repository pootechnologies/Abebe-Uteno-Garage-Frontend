export const formatCurrency = (num:number) => {
    return new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
};

export const formatCompact = (num: number): string => {
    if (!num && num !== 0) return "0";
    if (num >= 1_000_000_000) return `${+(num / 1_000_000_000).toFixed(1)}B`;
    if (num >= 1_000_000)     return `${+(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000)         return `${+(num / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
    return String(num);
};