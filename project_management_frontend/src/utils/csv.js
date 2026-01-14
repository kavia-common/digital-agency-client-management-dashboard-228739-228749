// PUBLIC_INTERFACE
export function downloadCsv(filename, rows, columns) {
  /**
   * Downloads CSV given rows and column definitions.
   * columns: [{ key, header, value?: (row)=>any }]
   */
  const header = columns.map((c) => c.header).join(",");
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const raw = c.value ? c.value(row) : row[c.key];
        const str = raw === null || raw === undefined ? "" : String(raw);
        const escaped = str.replaceAll('"', '""');
        return `"${escaped}"`;
      })
      .join(",")
  );

  const csv = [header, ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
