import { Transaction } from "./solana-transactions";

export function generateCSV(transactions: Transaction[], walletAddress: string): string {
  // CSV Headers
  const headers = [
    "Date",
    "Type",
    "Direction",
    "Token",
    "Amount",
    "Fee (SOL)",
    "From",
    "To",
    "Description",
    "Transaction Signature",
  ];

  // Convert transactions to CSV rows
  const rows = transactions.map(tx => {
    const date = new Date(tx.timestamp).toISOString();
    const type = tx.type === "swap" ? "trade" : tx.type;
    const direction = tx.direction === "in" ? "IN" : tx.direction === "out" ? "OUT" : "SWAP";
    const token = tx.token || "SOL";
    const amount = tx.amount.toFixed(4);
    const fee = tx.fee.toFixed(6);
    const from = tx.from || "";
    const to = tx.to || "";
    const description = (tx.description || "").replace(/"/g, '""'); // Escape quotes
    const signature = tx.signature;

    return [
      date,
      type,
      direction,
      token,
      amount,
      fee,
      from,
      to,
      `"${description}"`, // Wrap description in quotes
      signature,
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(",")),
  ].join("\n");

  return csvContent;
}

export function downloadCSV(csvContent: string, filename: string) {
  // Create blob
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Create download link
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Cleanup
  URL.revokeObjectURL(url);
}

export function exportTransactionsToCSV(
  transactions: Transaction[],
  walletAddress: string
) {
  const csv = generateCSV(transactions, walletAddress);
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const shortAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
  const filename = `trace-report-${shortAddress}-${timestamp}.csv`;

  downloadCSV(csv, filename);
}
