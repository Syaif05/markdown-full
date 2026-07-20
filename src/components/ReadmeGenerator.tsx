import React, { useState } from "react";
import Button3D from "./Button3D";

interface ReadmeGeneratorProps {
  onInsert: (markdown: string) => void;
  onClose: () => void;
}

const BADGES = [
  { id: "build", label: "Build Status", url: "![Build Status](https://img.shields.io/badge/build-passing-brightgreen)" },
  { id: "npm", label: "NPM Version", url: "![NPM Version](https://img.shields.io/badge/npm-v1.0.0-blue)" },
  { id: "license", label: "License", url: "![License](https://img.shields.io/badge/license-MIT-green)" },
  { id: "stars", label: "Stars", url: "![Stars](https://img.shields.io/github/stars/user/repo?style=social)" },
];

export default function ReadmeGenerator({ onInsert, onClose }: ReadmeGeneratorProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    installation: "npm install",
    usage: "npm start",
    contributing: "Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.",
    license: "MIT",
  });
  const [selectedBadges, setSelectedBadges] = useState<Set<string>>(new Set(["license"]));

  const toggleBadge = (id: string) => {
    const next = new Set(selectedBadges);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedBadges(next);
  };

  const generateMarkdown = () => {
    const badgesMd = BADGES.filter(b => selectedBadges.has(b.id)).map(b => b.url).join(" ");
    
    return `# ${formData.title || "Project Name"}
${badgesMd ? `\n${badgesMd}\n` : ""}
> ${formData.description || "A brief description of what this project does and who it's for"}

## Installation

\`\`\`bash
${formData.installation}
\`\`\`

## Usage

\`\`\`bash
${formData.usage}
\`\`\`

## Contributing

${formData.contributing}

## License

[${formData.license}](https://choosealicense.com/licenses/${formData.license.toLowerCase()}/)
`;
  };

  const handleInsert = () => {
    onInsert(generateMarkdown());
    onClose();
  };

  const handleDownload = () => {
    const blob = new Blob([generateMarkdown()], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const Input = ({ label, field, multiline = false }: { label: string, field: keyof typeof formData, multiline?: boolean }) => (
    <div className="mb-4">
      <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--text-2)" }}>{label}</label>
      {multiline ? (
        <textarea 
          value={formData[field]}
          onChange={e => setFormData({ ...formData, [field]: e.target.value })}
          className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none transition-colors"
          style={{ 
            background: "var(--bg)", 
            color: "var(--text-1)", 
            borderColor: "var(--border-subtle)" 
          }}
          rows={3}
        />
      ) : (
        <input 
          type="text"
          value={formData[field]}
          onChange={e => setFormData({ ...formData, [field]: e.target.value })}
          className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none transition-colors"
          style={{ 
            background: "var(--bg)", 
            color: "var(--text-1)", 
            borderColor: "var(--border-subtle)" 
          }}
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-200 p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
        style={{ 
          background: "var(--glass-bg)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid var(--border-subtle)"
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="font-display font-bold text-xl" style={{ color: "var(--text-1)" }}>README Generator</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-3)] transition-colors"
            style={{ color: "var(--text-3)" }}
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div className="col-span-1 md:col-span-2">
              <Input label="Project Name" field="title" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <Input label="Description" field="description" multiline />
            </div>
            
            <div className="col-span-1 md:col-span-2 mb-4">
              <label className="block text-xs font-bold mb-2" style={{ color: "var(--text-2)" }}>Badges</label>
              <div className="flex flex-wrap gap-2">
                {BADGES.map(b => (
                  <button
                    key={b.id}
                    onClick={() => toggleBadge(b.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                    style={{
                      borderColor: selectedBadges.has(b.id) ? "var(--accent)" : "var(--border-subtle)",
                      background: selectedBadges.has(b.id) ? "var(--accent)" : "transparent",
                      color: selectedBadges.has(b.id) ? "#fff" : "var(--text-2)"
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <Input label="Installation Command" field="installation" />
            <Input label="Usage Command" field="usage" />
            <div className="col-span-1 md:col-span-2">
              <Input label="Contributing Guidelines" field="contributing" multiline />
            </div>
            <Input label="License" field="license" />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[var(--border-subtle)] flex justify-end gap-3 bg-[var(--bg-2)]/50 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-[var(--bg-3)]"
            style={{ color: "var(--text-2)" }}
          >
            Cancel
          </button>
          <button 
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-[var(--bg-3)] border border-[var(--border)]"
            style={{ color: "var(--text-1)" }}
          >
            Download .md
          </button>
          <Button3D variant="accent" size="sm" onClick={handleInsert}>
            Insert to Editor
          </Button3D>
        </div>
      </div>
    </div>
  );
}
