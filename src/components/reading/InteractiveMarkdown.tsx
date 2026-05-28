"use client";

import { CSSProperties, ReactNode, useState } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { useFlashcardContext } from "@/store/FlashcardContext";
import WordModal from "./WordModal";
import {
  extractSentence,
  getNodeTextContent,
  normalizeInteractiveWord,
  renderInteractiveChildren,
} from "./interactiveTextUtils";

interface Props {
  markdown: string;
  fontSize?: number;
  lineHeight?: number | string;
  contentStyle?: CSSProperties;
}

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

export default function InteractiveMarkdown({ markdown, fontSize, lineHeight, contentStyle }: Props) {
  const { wordsSet } = useFlashcardContext();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [contextSentence, setContextSentence] = useState("");

  function handleWordClick(word: string, contextText: string) {
    const normalizedWord = normalizeInteractiveWord(word);

    if (!normalizedWord) {
      return;
    }

    const normalizedContext = contextText.trim();

    setSelectedWord(normalizedWord);
    setContextSentence(
      extractSentence(normalizedContext || normalizeMarkdown(markdown), normalizedWord)
    );
  }

  function renderInteractiveBlock(children: ReactNode, keyPrefix: string) {
    const contextText = getNodeTextContent(children);

    return renderInteractiveChildren(
      children,
      wordsSet,
      (word) => handleWordClick(word, contextText),
      keyPrefix
    );
  }

  const components: Components = {
    h1: (props) => (
      <h1 className="text-3xl font-extrabold text-primary" {...omitNode(props)}>
        {renderInteractiveBlock(props.children, "h1")}
      </h1>
    ),
    h2: (props) => (
      <h2 className="pt-2 text-2xl font-bold text-text-primary" {...omitNode(props)}>
        {renderInteractiveBlock(props.children, "h2")}
      </h2>
    ),
    h3: (props) => (
      <h3 className="pt-2 text-xl font-extrabold text-primary" {...omitNode(props)}>
        {renderInteractiveBlock(props.children, "h3")}
      </h3>
    ),
    h4: (props) => (
      <h4 className="text-lg font-bold text-text-primary" {...omitNode(props)}>
        {renderInteractiveBlock(props.children, "h4")}
      </h4>
    ),
    h5: (props) => (
      <h5
        className="text-base font-bold uppercase tracking-wide text-primary-dark"
        {...omitNode(props)}
      >
        {renderInteractiveBlock(props.children, "h5")}
      </h5>
    ),
    h6: (props) => (
      <h6
        className="text-sm font-bold uppercase tracking-wide text-primary-dark"
        {...omitNode(props)}
      >
        {renderInteractiveBlock(props.children, "h6")}
      </h6>
    ),
    p: (props) => (
      <p className="text-text-primary" {...omitNode(props)}>
        {renderInteractiveBlock(props.children, "p")}
      </p>
    ),
    blockquote: (props) => (
      <blockquote
        className="border-l-[3px] border-primary pl-4 text-text-primary"
        {...omitNode(props)}
      >
        {renderInteractiveBlock(props.children, "blockquote")}
      </blockquote>
    ),
    ul: (props) => (
      <ul className="list-disc space-y-2 pl-6 text-text-primary" {...omitNode(props)} />
    ),
    ol: (props) => (
      <ol className="list-decimal space-y-2 pl-6 text-text-primary" {...omitNode(props)} />
    ),
    li: (props) => (
      <li className="pl-1" {...omitNode(props)}>
        {renderInteractiveBlock(props.children, "li")}
      </li>
    ),
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
    tr: (props) => <tr className="border-b border-primary-darker/40 last:border-b-0" {...omitNode(props)} />,
    th: (props) => (
      <th
        className="border-b border-primary-darker px-4 py-3 text-sm font-extrabold text-primary"
        {...omitNode(props)}
      >
        {renderInteractiveBlock(props.children, "th")}
      </th>
    ),
    td: (props) => (
      <td className="px-4 py-3 align-top text-text-primary" {...omitNode(props)}>
        {renderInteractiveBlock(props.children, "td")}
      </td>
    ),
    pre: (props) => (
      <pre
        className="overflow-x-auto rounded-xl border border-primary-darker bg-background p-4 text-text-primary"
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

  return (
    <>
      <div
        className="space-y-4 text-text-primary"
        style={{
          fontSize: fontSize ? `${fontSize}px` : "17px",
          lineHeight: lineHeight ? (typeof lineHeight === "number" ? `${lineHeight}px` : lineHeight) : "28px",
          ...contentStyle,
        }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {normalizeMarkdown(markdown)}
        </ReactMarkdown>
      </div>

      {selectedWord && (
        <WordModal
          word={selectedWord}
          contextSentence={contextSentence}
          onClose={() => {
            setSelectedWord(null);
            setContextSentence("");
          }}
        />
      )}
    </>
  );
}
