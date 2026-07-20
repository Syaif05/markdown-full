import React, { useState } from "react";
import Button3D from "./Button3D";

interface TableGeneratorProps {
  onInsert: (markdown: string) => void;
  onClose: () => void;
}

export default function TableGenerator({ onInsert, onClose }: TableGeneratorProps) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [hoverRows, setHoverRows] = useState(0);
  const [hoverCols, setHoverCols] = useState(0);

  const maxRows = 10;
  const maxCols = 10;

  const handleGenerate = () => {
    let md = "\n";
    // Header
    for (let c = 0; c < cols; c++) {
      md += `| Header ${c + 1} `;
    }
    md += "|\n";
    // Divider
    for (let c = 0; c < cols; c++) {
      md += "|---";
    }
    md += "|\n";
    // Rows
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        md += `| Row ${r + 1} Col ${c + 1} `;
      }
      md += "|\n";
    }
    md += "\n";
    onInsert(md);
    onClose();
  };

  const activeR = hoverRows > 0 ? hoverRows : rows;
  const activeC = hoverCols > 0 ? hoverCols : cols;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div 
        className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-300"
        style={{ 
          background: "var(--glass-bg)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid var(--border-subtle)"
        }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-3)] transition-colors"
          style={{ color: "var(--text-3)" }}
        >
          ×
        </button>

        <h2 className="font-display font-bold text-xl mb-1" style={{ color: "var(--text-1)" }}>
          Table Generator
        </h2>
        <p className="text-xs mb-6" style={{ color: "var(--text-3)" }}>
          Select the grid size to generate a Markdown table.
        </p>

        <div className="flex flex-col items-center mb-6">
          <div className="font-mono text-sm font-bold mb-3" style={{ color: "var(--accent)" }}>
            {activeR} x {activeC}
          </div>
          
          <div 
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${maxCols}, minmax(0, 1fr))` }}
            onMouseLeave={() => { setHoverRows(0); setHoverCols(0); }}
          >
            {Array.from({ length: maxRows }).map((_, r) => (
              Array.from({ length: maxCols }).map((_, c) => {
                const isActive = r < activeR && c < activeC;
                return (
                  <div
                    key={`${r}-${c}`}
                    className="w-6 h-6 rounded-sm cursor-pointer transition-colors duration-75"
                    style={{
                      border: "1px solid var(--border)",
                      background: isActive ? "var(--accent)" : "var(--bg-2)",
                      opacity: isActive ? 1 : 0.5
                    }}
                    onMouseEnter={() => { setHoverRows(r + 1); setHoverCols(c + 1); }}
                    onClick={() => { setRows(r + 1); setCols(c + 1); }}
                  />
                );
              })
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-[var(--bg-3)]"
            style={{ color: "var(--text-2)" }}
          >
            Cancel
          </button>
          <Button3D variant="accent" size="sm" onClick={handleGenerate}>
            Insert Table
          </Button3D>
        </div>
      </div>
    </div>
  );
}
