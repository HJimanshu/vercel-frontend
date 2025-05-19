import React, { useState, useRef } from "react";
import CodeEditor from "./CodeEditor";
import Terminal from "./Terminal";
import axios from "axios";

const LANGUAGES = [
  { label: "Python", value: "python" },
  { label: "JavaScript", value: "javascript" },
];

// const codeTemplates = {
//   python: 'print(input())',
//   javascript: 'console.log("Hello world!")',
// };

const codeTemplates = {
  python: 'print(input())',
  javascript: `const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.question('Enter something: ', answer => {
  console.log(answer);
  rl.close();
});`
};

function extractPrompt(code, language) {
  if (language === "python") {
    const match = code.match(/input\(["'](.+?)["']\)/);
    return match ? match[1] : "";
  }
  if (language === "javascript") {
    const match = code.match(/prompt\(["'](.+?)["']\)/);
    return match ? match[1] : "";
  }
  return "";
}

function codeNeedsInput(code, language) {
  if (language === "python") return code.includes("input(");
  if (language === "javascript") return code.includes("prompt(");
  return false;
}

const defaultTab = () => ({
  name: "Untitled",
  code: codeTemplates["python"],
  input: "",
  output: "",
  error: "",
  language: "python",
  showInput: true,
  execTime: null,
  minimized: false,
  waitingForInput: false,
  textcolor: "#222222",
});

function App() {
  const [tabs, setTabs] = useState([defaultTab()]);
  const [activeTab, setActiveTab] = useState(0);

  // Helper to update current tab
  const updateTab = (changes) => {
    setTabs(tabs =>
      tabs.map((tab, idx) =>
        idx === activeTab ? { ...tab, ...changes } : tab
      )
    );
  };

  // Tab actions
  const handleNewTab = () => {
    setTabs(tabs => [...tabs, defaultTab()]);
    setActiveTab(tabs.length);
  };

  const handleCloseTab = (idx) => {
    if (tabs.length === 1) return; // Always keep at least one tab
    const newTabs = tabs.filter((_, i) => i !== idx);
    setTabs(newTabs);
    setActiveTab(idx === 0 ? 0 : idx - 1);
  };

  // All handlers below use/update the current tab
  const handleRun = () => {
    const tab = tabs[activeTab];
     if (tab.language === "javascript" && tab.code.includes("prompt(")) {
    alert("prompt() is not available in Node.js. Use readline for input. Example:\n\nconst readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin, output: process.stdout });\nrl.question('Enter something: ', answer => { console.log(answer); rl.close(); });");
    return;
  }
    if (codeNeedsInput(tab.code, tab.language)) {
      updateTab({
        showInput: true,
        waitingForInput: true,
        output: "",
        error: "",
        minimized: false,
      });
    } else {
      runCodeOnBackend(tab.input);
    }
  };

  const runCodeOnBackend = async (inputValue) => {
    updateTab({
      showInput: false,
      waitingForInput: false,
      output: "",
      error: "",
      minimized: false,
    });
    const tab = tabs[activeTab];
    const start = Date.now();
    try {
      const res = await axios.post("http://127.0.0.1:8000/editor/execute/", {
        code: tab.code,
        input: inputValue,
        language: tab.language,
      });
      updateTab({
        output: res.data.output,
        error: res.data.error,
        execTime: Date.now() - start,
      });
    } catch (err) {
      updateTab({
        error: "Server error: " + err.message,
        execTime: null,
      });
    }
  };

  const handleInputSubmit = () => {
    runCodeOnBackend(tabs[activeTab].input);
  };

  const handleSaveAsFile = () => {
    const tab = tabs[activeTab];
    const ext = tab.language === "python" ? "py" : tab.language === "javascript" ? "js" : "txt";
    const filename = prompt("Enter filename:", `mycode.${ext}`);
    if (!filename) return;
    const blob = new Blob([tab.code], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const handleSave = () => {
    localStorage.setItem("savedCode", tabs[activeTab].code);
    alert("Code saved!");
  };

  const handleLoad = () => {
    const saved = localStorage.getItem("savedCode");
    if (saved) updateTab({ code: saved });
  };

  const handleClearTerminal = () => {
    updateTab({
      input: "",
      output: "",
      error: "",
      showInput: codeNeedsInput(tabs[activeTab].code, tabs[activeTab].language),
      execTime: null,
    });
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    updateTab({
      language: lang,
      code: codeTemplates[lang] || "",
    });
  };

  // Keyboard shortcut: Ctrl+Enter to run
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleRun();
    }
  };

  // Current tab data
  const tab = tabs[activeTab];

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "auto",
        padding: 24,
        background: tab.theme === "dark" ? "#181818" : "#fff",
        color: tab.theme === "dark" ? "#fff" : "#222",
        minHeight: "100vh",
        fontFamily: "Segoe UI, Arial, sans-serif",
        boxSizing: "border-box"
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Tabs Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid #bbb",
        marginBottom: 8,
        gap: 2,
        background: "#222"
      }}>
        {tabs.map((t, idx) => (
          <div
            key={idx}
            style={{
              padding: "6px 16px",
              background: idx === activeTab ? "#fff" : "#333",
              color: idx === activeTab ? "#222" : "#fff",
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              marginRight: 2,
              cursor: "pointer",
              position: "relative",
              fontWeight: idx === activeTab ? 700 : 400,
              display: "flex",
              alignItems: "center"
            }}
            onClick={() => setActiveTab(idx)}
          >
            {t.name || `Untitled ${idx + 1}`}
            {tabs.length > 1 && (
              <span
                onClick={e => { e.stopPropagation(); handleCloseTab(idx); }}
                style={{
                  marginLeft: 8,
                  color: "#ff5555",
                  fontWeight: 900,
                  cursor: "pointer"
                }}
                title="Close tab"
              >×</span>
            )}
          </div>
        ))}
        <button
          onClick={handleNewTab}
          title="New File"
          style={{
            background: "none",
            border: "none",
            color: "#1976d2",
            fontSize: 22,
            marginLeft: 8,
            cursor: "pointer"
          }}
        >＋</button>
      </div>

      {/* Toolbar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 12,
        flexWrap: "wrap",
        gap: 10
      }}>
        <button
          onClick={handleRun}
          title="Run your code (Ctrl+Enter)"
          style={{
            background: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "8px 20px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
          }}
        >
          <span role="img" aria-label="run">▶</span> Run Code
        </button>
        <select
          value={tab.language}
          onChange={handleLanguageChange}
          title="Select Language"
          style={{
            padding: "8px 12px",
            borderRadius: 4,
            border: "1px solid #bbb",
            fontSize: 15,
            background: tab.theme === "dark" ? "#222" : "#fff",
            color: tab.theme === "dark" ? "#fff" : "#222"
          }}
        >
          {LANGUAGES.map(lang => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
        <button
          onClick={() => updateTab({ theme: tab.theme === "dark" ? "light" : "dark" })}
          title={tab.theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
          style={{
            background: "#222",
            color: "#ffd600",
            border: "1px solid #bbb",
            borderRadius: 4,
            padding: "8px 12px",
            cursor: "pointer",
            fontSize: 16
          }}
        >
          {tab.theme === "dark" ? "🌞" : "🌙"}
        </button>
        <button
          onClick={handleSave}
          title="Save code to browser"
          style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "8px 12px",
            cursor: "pointer",
            fontSize: 16
          }}
        >
          💾 Save
        </button>
        <button
          onClick={handleSaveAsFile}
          title="Download code as file"
          style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "8px 12px",
            cursor: "pointer",
            fontSize: 16
          }}
        >
          💾 Save as File
        </button>
        <button
          onClick={handleLoad}
          title="Load last saved code from browser"
          style={{
            background: "#fff",
            color: "#1976d2",
            border: "1px solid #1976d2",
            borderRadius: 4,
            padding: "8px 12px",
            cursor: "pointer",
            fontSize: 16,
            marginBottom: 0
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Editor */}
      <CodeEditor
        code={tab.code}
        setCode={code => updateTab({ code })}
        language={tab.language}
        theme={tab.theme === "dark" ? "vs-dark" : "light"}
        editorRef={useRef(null)}
      />

      {/* Terminal */}
      <Terminal
        input={tab.input}
        setInput={input => updateTab({ input })}
        output={tab.output}
        error={tab.error}
        showInput={tab.showInput}
        execTime={tab.execTime}
        theme={tab.theme}
        minimized={tab.minimized}
        setMinimized={minimized => updateTab({ minimized })}
        promptText={extractPrompt(tab.code, tab.language)}
        waitingForInput={tab.waitingForInput}
        onInputSubmit={handleInputSubmit}
        onClear={handleClearTerminal}
      />

      <div style={{
        marginTop: 16,
        fontSize: 13,
        color: "#888",
        textAlign: "center"
      }}>
        Powered by Docker backend. Try: <code>print("Hello, World!")</code>
      </div>
    </div>
  );
}

export default App;