// A small Markdown renderer for the docs (headings, paragraphs, lists, tables, code, quotes, links, bold/italic).
import { esc } from './lib.mjs';

const slugify = (s) => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const inline = (src) => {
  const codes = [];
  let t = String(src).replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  t = esc(t)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\s][^*]*)\*(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, url) => `<a href="${url}"${/^https?:/.test(url) ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`);
  return t.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[+i])}</code>`);
};

export function renderMarkdown(md, { startLevel = 1, idPrefix = '' } = {}) {
  const lines = md.replace(/\r/g, '').split('\n');
  const out = []; const headings = [];
  let i = 0;
  const flushPara = (buf) => { if (buf.length) out.push(`<p>${inline(buf.join(' '))}</p>`); buf.length = 0; };
  const para = [];

  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) { // fenced code
      flushPara(para); const lang = line.slice(3).trim(); const code = [];
      i++; while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
      i++; out.push(`<pre class="code"${lang ? ` data-lang="${esc(lang)}"` : ''}><code>${esc(code.join('\n'))}</code></pre>`); continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      flushPara(para); const level = Math.min(6, h[1].length + startLevel - 1); const text = h[2];
      const id = idPrefix + slugify(text); headings.push({ level, text, id });
      out.push(`<h${level} id="${id}"><a class="anchor" href="#${id}" aria-label="Link to this section">#</a>${inline(text)}</h${level}>`); i++; continue;
    }
    if (/^\s*$/.test(line)) { flushPara(para); i++; continue; }
    if (/^---+\s*$/.test(line)) { flushPara(para); out.push('<hr>'); i++; continue; }
    if (/^>\s?/.test(line)) { flushPara(para); const q = []; while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, '')); out.push(`<blockquote>${inline(q.join(' '))}</blockquote>`); continue; }
    if (/^\|.*\|\s*$/.test(line) && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) { // table
      flushPara(para);
      const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(line); i += 2; const rows = [];
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
      out.push(`<div class="doc-table"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`); continue;
    }
    const li = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(line);
    if (li) { // lists (items may continue on indented lines or contain a fenced block)
      flushPara(para); const ordered = /\d/.test(li[2]); const items = [];
      while (i < lines.length && (/^(\s*)([-*]|\d+\.)\s+/.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length) || (/^\s*$/.test(lines[i]) && /^(\s*)([-*]|\d+\.)\s+|^\s{2,}\S/.test(lines[i + 1] || '') && items.length))) {
        const m = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(lines[i]);
        if (m && m[1].length < 2) items.push({ text: m[3], extra: [] });
        else if (/^\s*$/.test(lines[i])) items[items.length - 1].extra.push('');
        else items[items.length - 1].extra.push(lines[i].replace(/^\s{2,4}/, ''));
        i++;
      }
      out.push(`<${ordered ? 'ol' : 'ul'}>${items.map((it) => {
        const extra = it.extra.join('\n').trim();
        return `<li>${inline(it.text)}${extra ? renderMarkdown(extra, { startLevel: 4 }).html : ''}</li>`;
      }).join('')}</${ordered ? 'ol' : 'ul'}>`); continue;
    }
    para.push(line.trim()); i++;
  }
  flushPara(para);
  return { html: out.join('\n'), headings };
}
