import {
  Children,
  cloneElement,
  isValidElement,
  ReactElement,
  ReactNode,
} from "react";

const PARTS_REGEX = /([\s\p{P}]+)/u;
const NON_WORD_REGEX = /[^\p{L}\p{Nd}]/gu;
const SKIP_INTERACTIVE_TAGS = new Set(["a", "code", "pre"]);

export function normalizeInteractiveWord(word: string) {
  return word.trim().toLowerCase().replace(NON_WORD_REGEX, "");
}

export function extractSentence(fullText: string, targetWord: string) {
  const sentences = fullText.split(/(?<=[.!?])\s+/);
  const normalizedTarget = normalizeInteractiveWord(targetWord);

  for (const sentence of sentences) {
    const sentenceWords = sentence.split(PARTS_REGEX);

    if (sentenceWords.some((word) => normalizeInteractiveWord(word) === normalizedTarget)) {
      return sentence.trim();
    }
  }

  return fullText.trim();
}

export function getNodeTextContent(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }

      if (isValidElement<{ children?: ReactNode }>(child)) {
        return getNodeTextContent(child.props.children);
      }

      return "";
    })
    .join("");
}

function renderInteractiveString(
  text: string,
  wordsSet: Set<string>,
  onWordClick: (word: string) => void,
  keyPrefix: string
) {
  return text.split(PARTS_REGEX).map((part, index) => {
    const normalizedWord = normalizeInteractiveWord(part);

    if (!normalizedWord) {
      return <span key={`${keyPrefix}-${index}`}>{part}</span>;
    }

    const isSaved = wordsSet.has(normalizedWord);

    return (
      <span
        key={`${keyPrefix}-${index}`}
        onClick={() => onWordClick(part)}
        className={`cursor-pointer rounded-sm transition-colors duration-200 ${
          isSaved
            ? "bg-primary/20 font-semibold text-[#EDAA12] hover:bg-primary/40"
            : "hover:bg-surface hover:text-[#EDAA12]"
        }`}
      >
        {part}
      </span>
    );
  });
}

export function renderInteractiveChildren(
  children: ReactNode,
  wordsSet: Set<string>,
  onWordClick: (word: string) => void,
  keyPrefix = "interactive"
): ReactNode {
  return Children.map(children, (child, index) => {
    const childKey = `${keyPrefix}-${index}`;

    if (typeof child === "string" || typeof child === "number") {
      return renderInteractiveString(String(child), wordsSet, onWordClick, childKey);
    }

    if (!isValidElement<{ children?: ReactNode }>(child)) {
      return child;
    }

    if (typeof child.type === "string" && SKIP_INTERACTIVE_TAGS.has(child.type)) {
      return child;
    }

    if (child.props.children == null) {
      return child;
    }

    return cloneElement(
      child as ReactElement<{ children?: ReactNode }>,
      undefined,
      renderInteractiveChildren(child.props.children, wordsSet, onWordClick, childKey)
    );
  });
}
