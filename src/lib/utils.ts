export const formatBRL = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d || 1);
}

export function getMonthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}
