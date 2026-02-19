import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
  height?: string;
}

const languageMap: Record<string, string> = {
  python: "python",
  java: "java",
  cpp: "cpp",
  javascript: "javascript",
  typescript: "typescript",
};

const CodeEditor = ({ value, onChange, language, readOnly = false, height = "400px" }: CodeEditorProps) => {
  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <Editor
        height={height}
        language={languageMap[language] || "plaintext"}
        value={value}
        onChange={(v) => onChange(v || "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 1.6,
          padding: { top: 16, bottom: 16 },
          readOnly,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          automaticLayout: true,
          renderLineHighlight: "gutter",
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
      />
    </div>
  );
};

export default CodeEditor;
