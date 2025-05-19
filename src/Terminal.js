import React, { useRef, useEffect } from "react";

function Terminal({
  input,
  setInput,
  output,
  error,
  showInput,
  execTime,
  theme,
  minimized,
  setMinimized,
  promptText,
  waitingForInput,
  onInputSubmit,
  onClear,
  textColor 
}) {
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output, error]);

  // Handle Enter key for input submission
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (onInputSubmit) onInputSubmit();
    }
  };

  if (minimized) {
    return (
      <div style={{
        background: theme === "dark" ? "#222" : "#f5f5f5",
        color: theme === "dark" ? "#0f0" : "#222",
        borderRadius: 4,
        border: "1px solid #333",
        marginBottom: 16,
        padding: 8,
        fontFamily: "monospace",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <span>Terminal (minimized)</span>
        <button onClick={() => setMinimized(false)} style={{
          background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer"
        }}>🔼</button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: theme === "dark" ? "#181c1f" : "#f5f5f5",
        color: theme === "dark" ? "#d1fa99" : "#222",
        padding: 0,
        borderRadius: 4,
        fontFamily: "monospace",
        minHeight: 180,
        marginBottom: 16,
        border: "1px solid #333",
        position: "relative",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
      }}
    >
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: theme === "dark" ? "#222" : "#e0e0e0",
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        padding: "6px 12px"
      }}>
        <span style={{ fontWeight: 600 }}>Output</span>
        <div>
          <button
            onClick={onClear}
            title="Clear terminal"
            style={{
              background: "none",
              border: "none",
              color: "#ff5555",
              fontSize: 18,
              cursor: "pointer",
              marginRight: 8
            }}
          >🗑️</button>
          <button onClick={() => setMinimized(true)} style={{
            background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer"
          }}>✂</button>
        </div>
      </div>
      <div
        ref={terminalRef}
        style={{
          minHeight: 100,
          maxHeight: 220,
          overflowY: "auto",
          padding: 16,
          background: theme === "dark" ? "#181c1f" : "#fff",
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4
        }}
      >
        {/* Show prompt and input box if input is needed */}
        {showInput && (
          <>
            <span style={{ color: "#fff" }}>{promptText}</span>
            <textarea
              rows={2}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              style={{
                width: "100%",
                background: theme === "dark" ? "#111" : "#fff",
                color: theme === "dark" ? "#fff" : "#222",
                border: "none",
                borderRadius: 4,
                marginTop: 8,
                marginBottom: 8,
                resize: "vertical",
                fontFamily: "monospace"
              }}
              placeholder="Type your input here and press Enter..."
            />
          </>
        )}
        {/* Show input and output after run */}
        {!showInput && input && (
          <>
            <span style={{ color: "#fff" }}>&gt;&gt;&gt; </span>
            <span style={{ color: "#fff" }}>
              {input.split("\n").join("\n>>> ")}
            </span>
            <br />
          </>
        )}
        {output && (
          <pre style={{
  color: textColor || (theme === "dark" ? "#d1fa99" : "#222"),
  margin: 0,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word"
}}>
  {output}
</pre>
        )}
        {error && (
          <pre style={{
            color: "#ff5555",
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word"
          }}>{error}</pre>
        )}
      </div>
      {execTime !== null && (
        <span style={{
          marginLeft: 16,
          color: "#888",
          fontSize: 12,
          position: "absolute",
          bottom: 6,
          right: 16
        }}>
          Execution time: {execTime} ms
        </span>
      )}
    </div>
  );
}

export default Terminal;