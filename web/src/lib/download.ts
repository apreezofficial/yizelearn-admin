export function downloadCsv(name: string, content: string) {
  const url = URL.createObjectURL(
    new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
// A self-contained printable document; the browser's print dialog can save it as a PDF.
export function printDocument(title: string, rows: [string, string][]) {
  const popup = window.open('', '_blank', 'width=800,height=650');
  if (!popup) return false;
  const escape = (v: string) =>
    v.replace(
      /[&<>"']/g,
      c =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        }[c]!),
    );
  popup.document.write(
    `<!doctype html><html><head><title>${escape(
      title,
    )}</title><style>body{font:16px system-ui;padding:48px;color:#242a36}h1{color:#17335a}table{width:100%;border-collapse:collapse}td{padding:16px 0;border-bottom:1px solid #ddd}td:last-child{text-align:right}</style></head><body><h1>${escape(
      title,
    )}</h1><table>${rows
      .map(([k, v]) => `<tr><td>${escape(k)}</td><td>${escape(v)}</td></tr>`)
      .join('')}</table></body></html>`,
  );
  popup.document.close();
  popup.focus();
  popup.print();
  return true;
}
