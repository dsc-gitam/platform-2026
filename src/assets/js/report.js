/* Event report page: print / save as PDF */
(function () {
  'use strict';
  const btn = document.getElementById('rpt-print');
  if (btn) btn.addEventListener('click', () => window.print());
  // ?print=1 opens the print dialog straight away (after fonts are ready so the PDF looks right).
  if (/[?&]print=1/.test(location.search)) {
    const go = () => setTimeout(() => window.print(), 250);
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go);
  }
})();
