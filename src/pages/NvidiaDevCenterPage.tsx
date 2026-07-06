import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Check, Copy, Key, Server, Terminal, ShieldCheck, Cpu } from 'lucide-react';
import { toast } from 'sonner';
import NvidiaNimAuditLog from '../components/NvidiaNimAuditLog';

export default function NvidiaDevCenterPage() {
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState<'curl' | 'node' | 'python'>('curl');
  const [ngcKey, setNgcKey] = useState<string>('nvapi-xxxxxxxxxxxxxxxxxxxxxxxxx');

  const handleCopySnippet = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    toast.success('Snippet copied to clipboard!');
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const codeSnippets = {
    curl: `curl -X POST "https://health.api.nvidia.com/v1/bionemo/esm2" \\
  -H "Authorization: Bearer $NVIDIA_NGC_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "sequence": "MSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLTLKFICTTG"
  }'`,
    node: `import { GoogleGenAI } from "@google/genai";
// NVIDIA BioNeMo NGC client proxy routing inside server.ts
const response = await fetch("https://health.api.nvidia.com/v1/bionemo/esm2", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${process.env.NVIDIA_NGC_API_KEY}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    sequence: "MSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLTLKFICTTG"
  })
});
const data = await response.json();`,
    python: `import requests

url = "https://health.api.nvidia.com/v1/bionemo/esm2"
headers = {
    "Authorization": f"Bearer {NVIDIA_NGC_API_KEY}",
    "Content-Type": "application/json"
}
payload = {
    "sequence": "MSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLTLKFICTTG"
}

response = requests.post(url, headers=headers, json=payload)
data = response.json()`
  };

  return (
    <div className="space-y-8 pb-12 font-sans text-slate-900">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#76B900]/15 text-[#76B900] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-sm border border-[#76B900]/20">
              Developer Space
            </span>
            <span className="bg-blue-500/10 text-blue-600 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-sm border border-blue-500/20">
              NGC API Core
            </span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-[#76B900]" />
            Developer/API Center
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-3xl leading-relaxed mt-2">
            Verify custom token variable parameters, configure server-managed authorization variables, and explore dynamic code generation snippets to connect BioNeMo directly with external pipelines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* API Configurations */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-[8.5px] font-mono font-black text-slate-400 uppercase tracking-widest block font-bold">NGC Registry</span>
              <h3 className="text-xs font-black text-slate-950 uppercase">NVIDIA NGC Authentication</h3>
            </div>

            <div className="space-y-3 font-mono text-[10px]">
              <div>
                <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">NVIDIA NGC API KEY</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={ngcKey} 
                    onChange={(e) => setNgcKey(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-950" 
                  />
                  <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                </div>
                <span className="text-[7.5px] text-slate-400 mt-1 uppercase font-bold block">Securely proxied via Server API</span>
              </div>
            </div>

            <button
              onClick={() => toast.success('Custom API configurations written.')}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              Update Developer Profile
            </button>
          </div>

          <div className="bg-[#05070a] border border-zinc-900 rounded-2xl p-5 shadow-xl text-zinc-400 space-y-3">
            <div className="space-y-1">
              <span className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest block">Environment variables</span>
              <h3 className="text-xs font-black text-white uppercase">Proxy Environment Configuration</h3>
            </div>
            
            <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
              Define the following key in your local workspace `.env` file for secure backend-forwarded client request loops:
            </p>

            <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg font-mono text-[9px] text-zinc-300">
              NVIDIA_NGC_API_KEY=nvapi-...
            </div>
          </div>
        </div>

        {/* Dynamic code generators */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest block">Integration code</span>
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-tight">Active API Request Snippet</h3>
              </div>
              
              <div className="flex gap-1.5 font-mono text-[9px]">
                {['curl', 'node', 'python'].map((tab: any) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedSnippet(tab)}
                    className={`px-2 py-1 rounded text-[9px] uppercase font-bold cursor-pointer transition-all ${
                      selectedSnippet === tab 
                        ? 'bg-[#76B900]/15 text-[#76B900] border border-[#76B900]/30' 
                        : 'bg-slate-50 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative group">
              <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-[9.5px] rounded-xl overflow-x-auto h-64 leading-relaxed">
                {codeSnippets[selectedSnippet]}
              </pre>
              <button
                onClick={() => handleCopySnippet(codeSnippets[selectedSnippet])}
                className="absolute top-3 right-3 p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg cursor-pointer transition-all"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* FULL-WIDTH NVIDIA NIM AUDIT LOG AND ANOMALY DETECTION DASHBOARD */}
      <NvidiaNimAuditLog />

    </div>
  );
}
