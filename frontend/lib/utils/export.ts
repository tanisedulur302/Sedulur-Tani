// Export utility functions for generating CSV and PDF files

/**
 * Export data to CSV format
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  headers?: { key: string; label: string }[],
) {
  if (!data || data.length === 0) {
    throw new Error("No data to export");
  }

  // Get headers from first object if not provided
  const keys = headers ? headers.map((h) => h.key) : Object.keys(data[0]);
  const labels = headers ? headers.map((h) => h.label) : Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    // Header row
    labels.join(","),
    // Data rows
    ...data.map((row) =>
      keys
        .map((key) => {
          const value = row[key];
          // Handle different types
          if (value === null || value === undefined) return "";
          if (typeof value === "string") {
            // Escape quotes and wrap in quotes if contains comma or newline
            const escaped = value.replace(/"/g, '""');
            return escaped.includes(",") || escaped.includes("\n")
              ? `"${escaped}"`
              : escaped;
          }
          if (typeof value === "number") return value.toString();
          if (typeof value === "boolean") return value ? "Ya" : "Tidak";
          if (value instanceof Date) return value.toLocaleDateString("id-ID");
          return String(value);
        })
        .join(","),
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Export data to PDF format using browser print
 */
export function exportToPDF(
  title: string,
  data: Record<string, unknown>[],
  headers?: { key: string; label: string }[],
  summary?: { label: string; value: string }[],
) {
  if (!data || data.length === 0) {
    throw new Error("No data to export");
  }

  const keys = headers ? headers.map((h) => h.key) : Object.keys(data[0]);
  const labels = headers ? headers.map((h) => h.label) : Object.keys(data[0]);

  // Create print window
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("Popup blocked. Please allow popups for this site.");
  }

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "number") {
      // Check if it looks like currency (large number)
      if (value > 1000) {
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(value);
      }
      return value.toLocaleString("id-ID");
    }
    if (typeof value === "boolean") return value ? "Ya" : "Tidak";
    if (value instanceof Date) return value.toLocaleDateString("id-ID");
    return String(value);
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          padding: 40px;
          color: #333;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #10b981;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-icon {
          width: 50px;
          height: 50px;
          background: linear-linear(135deg, #10b981 0%, #059669 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 20px;
        }
        .company-name {
          font-size: 24px;
          font-weight: 700;
          color: #064e3b;
        }
        .company-tagline {
          font-size: 12px;
          color: #6b7280;
        }
        .report-info {
          text-align: right;
        }
        .report-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }
        .report-date {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }
        .summary-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 30px;
        }
        .summary-card {
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .summary-label {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
        }
        .summary-value {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }
        table { 
          width: 100%; 
          border-collapse: collapse;
          font-size: 12px;
        }
        th, td { 
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th { 
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        tr:hover { background: #f9fafb; }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 11px;
          color: #9ca3af;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">
          <div class="logo-icon">ST</div>
          <div>
            <div class="company-name">Sedulur Tani</div>
            <div class="company-tagline">Marketplace Pupuk Terpercaya</div>
          </div>
        </div>
        <div class="report-info">
          <div class="report-title">${title}</div>
          <div class="report-date">Dicetak: ${new Date().toLocaleDateString(
            "id-ID",
            {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            },
          )}</div>
        </div>
      </div>
      
      ${
        summary
          ? `
        <div class="summary-section">
          ${summary
            .map(
              (s) => `
            <div class="summary-card">
              <div class="summary-label">${s.label}</div>
              <div class="summary-value">${s.value}</div>
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }

      <table>
        <thead>
          <tr>
            <th>No</th>
            ${labels.map((label) => `<th>${label}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (row, index) => `
            <tr>
              <td>${index + 1}</td>
              ${keys.map((key) => `<td>${formatValue(row[key])}</td>`).join("")}
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <div class="footer">
        <p>Laporan ini dihasilkan secara otomatis oleh sistem Sedulur Tani</p>
        <p>© ${new Date().getFullYear()} Sedulur Tani - Semua hak dilindungi</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Export simple report (for quick exports without table)
 */
export function exportSimpleReport(
  title: string,
  sections: { title: string; items: { label: string; value: string }[] }[],
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("Popup blocked. Please allow popups for this site.");
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          padding: 40px;
          color: #333;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #10b981;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-icon {
          width: 50px;
          height: 50px;
          background: linear-linear(135deg, #10b981 0%, #059669 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 20px;
        }
        .company-name {
          font-size: 24px;
          font-weight: 700;
          color: #064e3b;
        }
        .company-tagline {
          font-size: 12px;
          color: #6b7280;
        }
        .report-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }
        .report-date {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        .item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .item-label {
          color: #6b7280;
        }
        .item-value {
          font-weight: 600;
          color: #111827;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 11px;
          color: #9ca3af;
        }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">
          <div class="logo-icon">ST</div>
          <div>
            <div class="company-name">Sedulur Tani</div>
            <div class="company-tagline">Marketplace Pupuk Terpercaya</div>
          </div>
        </div>
        <div>
          <div class="report-title">${title}</div>
          <div class="report-date">Dicetak: ${new Date().toLocaleDateString(
            "id-ID",
            {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            },
          )}</div>
        </div>
      </div>

      ${sections
        .map(
          (section) => `
        <div class="section">
          <div class="section-title">${section.title}</div>
          ${section.items
            .map(
              (item) => `
            <div class="item">
              <span class="item-label">${item.label}</span>
              <span class="item-value">${item.value}</span>
            </div>
          `,
            )
            .join("")}
        </div>
      `,
        )
        .join("")}

      <div class="footer">
        <p>Laporan ini dihasilkan secara otomatis oleh sistem Sedulur Tani</p>
        <p>© ${new Date().getFullYear()} Sedulur Tani - Semua hak dilindungi</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Helper to download blob
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
