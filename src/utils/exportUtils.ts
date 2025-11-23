import type { Transaction } from '../types';

/**
 * Generate CSV content for transactions
 */
export const generateTransactionCSV = (transactions: Transaction[]): string => {
  if (transactions.length === 0) {
    return 'No transactions to export';
  }

  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Recurring', 'Pattern'];
  const rows = transactions.map((t) => [
    new Date(t.date).toLocaleDateString('en-US'),
    t.description,
    t.category,
    t.type === 'income' ? 'Income' : 'Expense',
    t.amount.toFixed(2),
    t.isRecurring ? 'Yes' : 'No',
    t.recurringPattern ? t.recurringPattern.charAt(0).toUpperCase() + t.recurringPattern.slice(1) : 'N/A',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma or quotes
          const escaped = String(cell).replace(/"/g, '""');
          return escaped.includes(',') || escaped.includes('"') ? `"${escaped}"` : escaped;
        })
        .join(',')
    ),
  ].join('\n');

  return csvContent;
};

/**
 * Generate CSV content for budgets
 */
export const generateBudgetCSV = (budgets: { category: string; budgetLimit: number; spent: number; remaining: number; percentageUsed: number; status: string }[]): string => {
  if (budgets.length === 0) {
    return 'No budgets to export';
  }

  const headers = ['Category', 'Budget Limit', 'Spent', 'Remaining', 'Percentage Used', 'Status'];
  const rows = budgets.map((b) => [
    b.category,
    b.budgetLimit.toFixed(2),
    b.spent.toFixed(2),
    b.remaining.toFixed(2),
    b.percentageUsed.toFixed(1) + '%',
    b.status,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const escaped = String(cell).replace(/"/g, '""');
          return escaped.includes(',') || escaped.includes('"') ? `"${escaped}"` : escaped;
        })
        .join(',')
    ),
  ].join('\n');

  return csvContent;
};

/**
 * Download CSV file
 */
export const downloadCSV = (content: string, filename: string): void => {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/csv;charset=utf-8' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(element.href);
};

/**
 * Generate PDF content for transactions
 * Uses a simple HTML-to-PDF approach with canvas/print
 */
export const generateTransactionPDF = (transactions: Transaction[]): void => {
  if (transactions.length === 0) {
    alert('No transactions to export');
    return;
  }

  const date = new Date().toLocaleDateString('en-US');
  const rows = transactions
    .map(
      (t) =>
        `
    <tr>
      <td>${new Date(t.date).toLocaleDateString('en-US')}</td>
      <td>${t.description}</td>
      <td>${t.category}</td>
      <td>${t.type === 'income' ? 'Income' : 'Expense'}</td>
      <td style="text-align: right;">${t.amount.toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Transaction Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          .meta { color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f5f5f5; font-weight: bold; }
          tr:hover { background-color: #f9f9f9; }
          .total { font-weight: bold; background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        <h1>Transaction Report</h1>
        <div class="meta">
          <p>Generated on: ${date}</p>
          <p>Total Transactions: ${transactions.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const printWindow = window.open('', '', 'height=400,width=800');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
};

/**
 * Generate PDF content for budgets
 */
export const generateBudgetPDF = (budgets: { category: string; budgetLimit: number; spent: number; remaining: number; percentageUsed: number; status: string }[]): void => {
  if (budgets.length === 0) {
    alert('No budgets to export');
    return;
  }

  const date = new Date().toLocaleDateString('en-US');
  const rows = budgets
    .map(
      (b) =>
        `
    <tr>
      <td>${b.category}</td>
      <td style="text-align: right;">$${b.budgetLimit.toFixed(2)}</td>
      <td style="text-align: right;">$${b.spent.toFixed(2)}</td>
      <td style="text-align: right;">$${b.remaining.toFixed(2)}</td>
      <td style="text-align: center;">${b.percentageUsed.toFixed(1)}%</td>
      <td style="text-align: center; font-weight: bold;">${b.status}</td>
    </tr>
  `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Budget Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          .meta { color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f5f5f5; font-weight: bold; }
          tr:hover { background-color: #f9f9f9; }
          .status-on-track { color: #10b981; }
          .status-warning { color: #f59e0b; }
          .status-exceeded { color: #ef4444; }
        </style>
      </head>
      <body>
        <h1>Budget Report</h1>
        <div class="meta">
          <p>Generated on: ${date}</p>
          <p>Total Budgets: ${budgets.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Budget Limit</th>
              <th>Spent</th>
              <th>Remaining</th>
              <th>Used %</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const printWindow = window.open('', '', 'height=400,width=800');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
};
