import React from "react";
import MonacoEditor from "@monaco-editor/react";

function CodeEditor({ code, setCode, language, theme, editorRef }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 4, marginBottom: 16 }}>
      <MonacoEditor
        height="250px"
        language={language}
        theme={theme}
        value={code}
        onChange={value => setCode(value)}
        options={{
          fontSize: 16,
          minimap: { enabled: false },
        }}
        editorRef={editorRef}
      />
    </div>
  );
}

export default CodeEditor;