import React from "react";

type MarkdownBlock =
  | { type: "heading1"; text: string }
  | { type: "heading2"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "blockquote"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "image"; src: string; alt: string };

function renderInline(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-extrabold text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function normalizeMarkdown(markdown: string) {
  return markdown
    .replace(/\r\n/g, "\n")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .trim();
}

function isTableRow(line: string) {
  return line.includes("|");
}

function isTableDivider(line: string) {
  const normalized = line.replace(/\|/g, "").replace(/\s/g, "");
  return normalized.length > 0 && /^:?-{3,}:?$/.test(normalized);
}

function parseTableCells(line: string) {
  return line
    .split("|")
    .map((cell) => cell.trim())
    .filter((cell, index, cells) => {
      if (index === 0 && cell === "") return false;
      if (index === cells.length - 1 && cell === "") return false;
      return true;
    });
}

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const lines = normalizeMarkdown(markdown).split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imageMatch) {
      blocks.push({
        type: "image",
        alt: imageMatch[1],
        src: imageMatch[2],
      });
      index += 1;
      continue;
    }

    if (
      isTableRow(line) &&
      index + 1 < lines.length &&
      isTableDivider(lines[index + 1].trim())
    ) {
      const headers = parseTableCells(line);
      const rows: string[][] = [];
      index += 2;

      while (index < lines.length) {
        const currentLine = lines[index].trim();

        if (!currentLine || !isTableRow(currentLine)) {
          break;
        }

        rows.push(parseTableCells(currentLine));
        index += 1;
      }

      blocks.push({ type: "table", headers, rows });
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push({ type: "heading1", text: line.slice(2).trim() });
      index += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "heading2", text: line.slice(3).trim() });
      index += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];

      while (index < lines.length && lines[index].trim().startsWith("> ")) {
        quoteLines.push(lines[index].trim().slice(2).trim());
        index += 1;
      }

      blocks.push({ type: "blockquote", text: quoteLines.join(" ") });
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];

      while (index < lines.length && lines[index].trim().startsWith("- ")) {
        items.push(lines[index].trim().slice(2).trim());
        index += 1;
      }

      blocks.push({ type: "unordered-list", items });
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];

      while (index < lines.length && /^\d+\.\s/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s/, ""));
        index += 1;
      }

      blocks.push({ type: "ordered-list", items });
      continue;
    }

    const paragraphLines: string[] = [];

    while (index < lines.length) {
      const currentLine = lines[index].trim();

      if (
        !currentLine ||
        currentLine.startsWith("# ") ||
        currentLine.startsWith("## ") ||
        currentLine.startsWith("> ") ||
        currentLine.startsWith("- ") ||
        (
          isTableRow(currentLine) &&
          index + 1 < lines.length &&
          isTableDivider(lines[index + 1].trim())
        ) ||
        /^\d+\.\s/.test(currentLine) ||
        /^!\[(.*?)\]\((.*?)\)$/.test(currentLine)
      ) {
        break;
      }

      paragraphLines.push(currentLine);
      index += 1;
    }

    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

export default function MarkdownContent({ markdown }: { markdown: string }) {
  const blocks = parseMarkdown(markdown);

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading1":
            return (
              <h1 key={index} className="text-3xl font-extrabold text-primary">
                {renderInline(block.text)}
              </h1>
            );
          case "heading2":
            return (
              <h2 key={index} className="pt-2 text-2xl font-bold text-text-primary">
                {renderInline(block.text)}
              </h2>
            );
          case "blockquote":
            return (
              <blockquote
                key={index}
                className="border-l-[3px] border-primary pl-4 text-base leading-8 text-text-primary"
              >
                {renderInline(block.text)}
              </blockquote>
            );
          case "unordered-list":
            return (
              <ul key={index} className="list-disc space-y-2 pl-6 text-base leading-8 text-text-primary">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "ordered-list":
            return (
              <ol key={index} className="list-decimal space-y-2 pl-6 text-base leading-8 text-text-primary">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          case "image":
            return (
              <div key={index} className="overflow-hidden rounded-xl border border-primary-darker bg-black/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={block.src}
                  alt={block.alt}
                  className="h-auto max-h-[22rem] w-full object-cover"
                />
              </div>
            );
          case "table":
            return (
              <div key={index} className="overflow-hidden rounded-xl border border-primary-darker">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse bg-surface text-left">
                    <thead className="bg-primary/10">
                      <tr>
                        {block.headers.map((header, headerIndex) => (
                          <th
                            key={headerIndex}
                            className="border-b border-primary-darker px-4 py-3 text-sm font-extrabold text-primary"
                          >
                            {renderInline(header)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-primary-darker/40 last:border-b-0">
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-4 py-3 text-sm leading-6 text-text-primary align-top"
                            >
                              {renderInline(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          case "paragraph":
            return (
              <p key={index} className="text-base leading-8 text-text-primary">
                {renderInline(block.text)}
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
