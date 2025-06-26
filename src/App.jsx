import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import "katex/dist/katex.min.css";
import katex from "katex";
import latexjs from "latex.js";

const defaultLatex = `
\\documentclass{article}
\\begin{document}
\\title{A Research Paper}
\\author{Your Name}
\\maketitle

\\begin{abstract}
This is the abstract.
\\end{abstract}

\\section{Introduction}
This is a sample LaTeX document with math: $E = mc^2$.

\\section{Method}
You can write equations like this:
\\[
    \\int_0^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
\\]

\\end{document}
`;

const mathSymbols = [
  { symbol: "\\alpha", label: "α" },
  { symbol: "\\beta", label: "β" },
  { symbol: "\\gamma", label: "γ" },
  { symbol: "\\sum", label: "∑" },
  { symbol: "\\int", label: "∫" },
  { symbol: "\\sqrt{}", label: "√" },
  { symbol: "\\frac{}{}", label: "a/b" },
  { symbol: "\\infty", label: "∞" }
];

function extractMath(latex) {
  // Extract all $...$ and \[...\] blocks for preview
  const inline = [...latex.matchAll(/\$(.*?)\$/g)].map((m) => m[1]);
  const block = [...latex.matchAll(/\\\[(.*?)\\\]/gs)].map((m) => m[1]);
  return [...inline, ...block];
}

function App() {
  const [code, setCode] = useState(defaultLatex);

  // Live math preview
  const mathBlocks = extractMath(code);
  const renderMath = (math, i) => {
    try {
      return (
        <div
          key={i}
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(math, { displayMode: true })
          }}
          style={{ margin: "0.5em 0", background: "#f9f9f9", padding: "6px" }}
        />
      );
    } catch (e) {
      return (
        <div key={i} style={{ color: "red" }}>
          Error in math: {e.message}
        </div>
      );
    }
  };

  // Insert symbol at cursor
  function handleInsert(symbol) {
    setCode((prev) => prev + symbol);
  }

  // LaTeX to HTML (for preview)
  function getLatexHtml() {
    try {
      const latex = latexjs.parse(code).htmlDocument();
      return { __html: latex.outerHTML };
    } catch (e) {
      return { __html: `<pre>${e.message}</pre>` };
    }
  }

  // Download LaTeX
  function downloadLatex() {
    const blob = new Blob([code], { type: "text/x-tex" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.tex";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>
      <div style={{ flex: 1, padding: 16, borderRight: "1px solid #ddd" }}>
        <h2>LaTeX Editor</h2>
        <div>
          {mathSymbols.map((s) => (
            <button
              key={s.symbol}
              style={{ margin: 2 }}
              onClick={() => handleInsert(s.symbol)}
              title={s.symbol}
            >
              {s.label}
            </button>
          ))}
        </div>
        <CodeMirror
          value={code}
          height="70vh"
          onChange={(value) => setCode(value)}
          theme="light"
          extensions={[]}
        />
        <button onClick={downloadLatex} style={{ marginTop: 8 }}>
          Download .tex
        </button>
      </div>
      <div style={{ flex: 1.2, padding: 16, overflowY: "auto" }}>
        <h2>Live Math Preview</h2>
        {mathBlocks.length === 0 && <i>No math blocks found.</i>}
        {mathBlocks.map(renderMath)}

        <h2>Full Document Preview (HTML)</h2>
        <div
          style={{ background: "#fff", padding: 12, border: "1px solid #eee" }}
          dangerouslySetInnerHTML={getLatexHtml()}
        />
      </div>
    </div>
  );
}

export default App;