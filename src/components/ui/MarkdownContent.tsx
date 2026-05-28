import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

function normalizeMarkdown(markdown: string) {
  return markdown
    .replace(/\r\n/g, "\n")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .trim();
}

function omitNode<T extends { node?: unknown }>(props: T): Omit<T, "node"> {
  const nextProps = { ...props };
  delete nextProps.node;
  return nextProps;
}

const markdownComponents: Components = {
  h1: (props) => <h1 className="text-3xl font-extrabold text-primary" {...omitNode(props)} />,
  h2: (props) => <h2 className="pt-2 text-2xl font-bold text-text-primary" {...omitNode(props)} />,
  h3: (props) => <h3 className="pt-2 text-xl font-extrabold text-primary" {...omitNode(props)} />,
  h4: (props) => <h4 className="text-lg font-bold text-text-primary" {...omitNode(props)} />,
  h5: (props) => (
    <h5 className="text-base font-bold uppercase tracking-wide text-primary-dark" {...omitNode(props)} />
  ),
  h6: (props) => (
    <h6 className="text-sm font-bold uppercase tracking-wide text-primary-dark" {...omitNode(props)} />
  ),
  p: (props) => <p className="text-base leading-8 text-text-primary" {...omitNode(props)} />,
  blockquote: (props) => (
    <blockquote
      className="border-l-[3px] border-primary pl-4 text-base leading-8 text-text-primary"
      {...omitNode(props)}
    />
  ),
  ul: (props) => (
    <ul className="list-disc space-y-2 pl-6 text-base leading-8 text-text-primary" {...omitNode(props)} />
  ),
  ol: (props) => (
    <ol className="list-decimal space-y-2 pl-6 text-base leading-8 text-text-primary" {...omitNode(props)} />
  ),
  li: (props) => <li className="pl-1" {...omitNode(props)} />,
  hr: (props) => <hr className="border-primary-darker/70" {...omitNode(props)} />,
  strong: (props) => <strong className="font-extrabold text-primary" {...omitNode(props)} />,
  em: (props) => <em className="italic text-text-primary" {...omitNode(props)} />,
  a: (props) => (
    <a
      className="font-semibold text-primary underline underline-offset-4 transition-colors hover:text-primary-dark"
      target="_blank"
      rel="noreferrer"
      {...omitNode(props)}
    />
  ),
  img: (props) => {
    const { src = "", alt = "", ...imageProps } = omitNode(props);

    return (
    <div className="overflow-hidden rounded-xl border border-primary-darker bg-black/30">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-auto max-h-[22rem] w-full object-cover"
        {...imageProps}
      />
    </div>
    );
  },
  table: (props) => (
    <div className="overflow-hidden rounded-xl border border-primary-darker">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse bg-surface text-left" {...omitNode(props)} />
      </div>
    </div>
  ),
  thead: (props) => <thead className="bg-primary/10" {...omitNode(props)} />,
  tr: (props) => (
    <tr className="border-b border-primary-darker/40 last:border-b-0" {...omitNode(props)} />
  ),
  th: (props) => (
    <th
      className="border-b border-primary-darker px-4 py-3 text-sm font-extrabold text-primary"
      {...omitNode(props)}
    />
  ),
  td: (props) => (
    <td className="px-4 py-3 align-top text-sm leading-6 text-text-primary" {...omitNode(props)} />
  ),
  pre: (props) => (
    <pre
      className="overflow-x-auto rounded-xl border border-primary-darker bg-background p-4 text-sm leading-6 text-text-primary"
      {...omitNode(props)}
    />
  ),
  code: (props) => {
    const { className, ...codeProps } = omitNode(props);

    return (
      <code
        className={[
          "rounded bg-background px-1.5 py-0.5 font-mono text-sm text-primary",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...codeProps}
      />
    );
  },
};

export default function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <div className="space-y-4">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {normalizeMarkdown(markdown)}
      </ReactMarkdown>
    </div>
  );
}
