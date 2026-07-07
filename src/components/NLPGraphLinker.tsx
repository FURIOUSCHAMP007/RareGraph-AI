import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  GitCommit, 
  CheckCircle2, 
  PlusCircle, 
  Dna, 
  GitCompare, 
  Brain, 
  RefreshCw, 
  ArrowRightLeft, 
  FileText, 
  ExternalLink,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { suggestGraphLinks, SuggestedLink } from '../services/geminiService';
import { initialNodes, initialLinks } from '../pages/GraphExplorer';

interface NLPGraphLinkerProps {
  activeVariantPayload: any[] | null;
  rawVariantsText: string;
}

export default function NLPGraphLinker({ activeVariantPayload, rawVariantsText }: NLPGraphLinkerProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedLink[]>([]);
  const [committedLinks, setCommittedLinks] = useState<string[]>([]); // Track forged targetIds or link IDs
  const [rawTextVariants, setRawTextVariants] = useState<Array<{ gene: string; variant: string }>>([]);

  // Parse raw text variants if payload is empty but raw variants text exists
  useEffect(() => {
    if ((!activeVariantPayload || activeVariantPayload.length === 0) && rawVariantsText) {
      // Simple local parsing for common variant notations e.g. "MT-TL1 m.3243A>G", "KCNQ2 c.740G>A"
      const parsed: Array<{ gene: string; variant: string }> = [];
      const parts = rawVariantsText.split(/[;,]/);
      for (const p of parts) {
        const trimmed = p.trim();
        if (!trimmed) continue;
        const match = trimmed.match(/^([A-Z0-9\-]+)\s+(.+)$/i);
        if (match) {
          parsed.push({ gene: match[1], variant: match[2] });
        } else {
          // Fallback to simple split
          const words = trimmed.split(/\s+/);
          if (words.length >= 2) {
            parsed.push({ gene: words[0], variant: words.slice(1).join(' ') });
          } else if (words.length === 1 && words[0].length > 1) {
            parsed.push({ gene: words[0], variant: 'Target Mutation' });
          }
        }
      }
      setRawTextVariants(parsed);
    } else {
      setRawTextVariants([]);
    }
  }, [activeVariantPayload, rawVariantsText]);

  // Load any existing forged links from localStorage to preserve state
  useEffect(() => {
    const saved = localStorage.getItem('rareGraph_forged_links_tracker');
    if (saved) {
      try {
        setCommittedLinks(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const persistCommittedLinks = (updated: string[]) => {
    setCommittedLinks(updated);
    localStorage.setItem('rareGraph_forged_links_tracker', JSON.stringify(updated));
  };

  const runNlpLinking = async () => {
    setLoading(true);
    try {
      // 1. Gather target variants
      const targets = activeVariantPayload && activeVariantPayload.length > 0
        ? activeVariantPayload.map(v => ({ gene: v.gene, variant: v.variant, acmgClassification: v.acmgClassification }))
        : rawTextVariants;

      if (targets.length === 0) {
        toast.error("No active variants found", {
          description: "Please run the ACMG Variant Classifier first or enter variant text (e.g., 'MT-TL1 m.3243A>G') in the input stream."
        });
        setLoading(false);
        return;
      }

      // 2. Load existing nodes in Knowledge Graph
      const savedNodes = localStorage.getItem('rareGraph_kg_nodes');
      let existingNodes = [];
      if (savedNodes) {
        existingNodes = JSON.parse(savedNodes);
      } else {
        // Fallback to the hardcoded ones if not in localstorage yet
        existingNodes = initialNodes;
      }

      toast.loading("Analyzing biological entities...", { id: 'nlp-linking' });
      
      // 3. Request NLP analysis
      const results = await suggestGraphLinks(targets, existingNodes);
      
      if (results.length === 0) {
        toast.success("Analysis complete: No direct correlations found.", {
          id: 'nlp-linking',
          description: "No overlapping clinical pathways detected for this specific variant sequence in the current graph."
        });
      } else {
        toast.success(`Discovered ${results.length} bidirectionally aligned clinical relations!`, {
          id: 'nlp-linking',
          description: "Review suggestions and forge the relationships in the Knowledge Graph."
        });
      }
      
      setSuggestions(results);
    } catch (err: any) {
      console.error(err);
      toast.error("Clinical NLP Link Suggestion failed", {
        id: 'nlp-linking',
        description: err.message || "An error occurred during semantic graph cross-referencing."
      });
    } finally {
      setLoading(false);
    }
  };

  // Forge a single suggested link in the Knowledge Graph
  const forgeLink = (link: SuggestedLink) => {
    try {
      // 1. Load current graph from localStorage or default
      const savedNodesStr = localStorage.getItem('rareGraph_kg_nodes');
      const savedLinksStr = localStorage.getItem('rareGraph_kg_links');

      let currentNodes = savedNodesStr ? JSON.parse(savedNodesStr) : null;
      let currentLinks = savedLinksStr ? JSON.parse(savedLinksStr) : null;

      if (!currentNodes || !currentLinks) {
        // Use default ones statically imported to bootstrap localstorage if needed
        if (!currentNodes) currentNodes = [...initialNodes];
        if (!currentLinks) currentLinks = [...initialLinks];
      }

      // 2. Insert variant node if not already exists
      const variantNodeId = link.sourceId;
      const nodeExists = currentNodes.some((n: any) => n.id === variantNodeId);

      if (!nodeExists) {
        currentNodes.push({
          id: variantNodeId,
          name: link.sourceName,
          type: 'gene',
          definition: `ACMG evaluated genomic variant: ${link.sourceName}. Aligned with clinical symptoms and diseases via Agentic RareGraphAI Orchestrator.`
        });
      }

      // 3. Create bidirectional edges
      // A -> B
      const forwardExists = currentLinks.some((l: any) => {
        const s = typeof l.source === 'string' ? l.source : l.source.id;
        const t = typeof l.target === 'string' ? l.target : l.target.id;
        return s === variantNodeId && t === link.targetId;
      });

      if (!forwardExists) {
        currentLinks.push({
          source: variantNodeId,
          target: link.targetId,
          label: link.relationship
        });
      }

      // B -> A (Bidirectional linkage representation)
      const backwardExists = currentLinks.some((l: any) => {
        const s = typeof l.source === 'string' ? l.source : l.source.id;
        const t = typeof l.target === 'string' ? l.target : l.target.id;
        return s === link.targetId && t === variantNodeId;
      });

      if (!backwardExists) {
        currentLinks.push({
          source: link.targetId,
          target: variantNodeId,
          label: `linked_variant`
        });
      }

      // 4. Save back to localStorage
      localStorage.setItem('rareGraph_kg_nodes', JSON.stringify(currentNodes));
      localStorage.setItem('rareGraph_kg_links', JSON.stringify(currentLinks));

      // 5. Track state locally
      const uniqueId = `${link.sourceId}_${link.targetId}`;
      const updated = [...committedLinks, uniqueId];
      persistCommittedLinks(updated);

      toast.success("Relation Forged and Synced", {
        description: `Successfully linked ${link.sourceName} with ${link.targetName} [${link.relationship.toUpperCase()}].`
      });
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to forge link", { description: e.message });
    }
  };

  // Forge all suggestions in one click
  const forgeAllLinks = () => {
    let count = 0;
    const updated = [...committedLinks];

    // Read current graph once to perform batch save
    const savedNodesStr = localStorage.getItem('rareGraph_kg_nodes');
    const savedLinksStr = localStorage.getItem('rareGraph_kg_links');

    let currentNodes = savedNodesStr ? JSON.parse(savedNodesStr) : null;
    let currentLinks = savedLinksStr ? JSON.parse(savedLinksStr) : null;

    if (!currentNodes || !currentLinks) {
      toast.error("Bootstrap error: graph must be loaded once.");
      return;
    }

    for (const link of suggestions) {
      const uniqueId = `${link.sourceId}_${link.targetId}`;
      if (updated.includes(uniqueId)) continue;

      // Add node
      const variantNodeId = link.sourceId;
      if (!currentNodes.some((n: any) => n.id === variantNodeId)) {
        currentNodes.push({
          id: variantNodeId,
          name: link.sourceName,
          type: 'gene',
          definition: `ACMG evaluated genomic variant: ${link.sourceName}. Aligned with clinical symptoms and diseases via Agentic RareGraphAI Orchestrator.`
        });
      }

      // Forward link
      const forwardExists = currentLinks.some((l: any) => {
        const s = typeof l.source === 'string' ? l.source : l.source.id;
        const t = typeof l.target === 'string' ? l.target : l.target.id;
        return s === variantNodeId && t === link.targetId;
      });
      if (!forwardExists) {
        currentLinks.push({
          source: variantNodeId,
          target: link.targetId,
          label: link.relationship
        });
      }

      // Backward link
      const backwardExists = currentLinks.some((l: any) => {
        const s = typeof l.source === 'string' ? l.source : l.source.id;
        const t = typeof l.target === 'string' ? l.target : l.target.id;
        return s === link.targetId && t === variantNodeId;
      });
      if (!backwardExists) {
        currentLinks.push({
          source: link.targetId,
          target: variantNodeId,
          label: `linked_variant`
        });
      }

      updated.push(uniqueId);
      count++;
    }

    if (count > 0) {
      localStorage.setItem('rareGraph_kg_nodes', JSON.stringify(currentNodes));
      localStorage.setItem('rareGraph_kg_links', JSON.stringify(currentLinks));
      persistCommittedLinks(updated);
      toast.success("Knowledge Graph Forged Successfully", {
        description: `Forged ${count} bi-directional pathways. Head to Graph Explorer page to view real-time changes.`
      });
    } else {
      toast.info("All detected pathways have already been forged.");
    }
  };

  const hasUnforged = suggestions.some(link => !committedLinks.includes(`${link.sourceId}_${link.targetId}`));

  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 flex flex-col gap-4 shadow-sm">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/50">
        <div>
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-emerald-500 animate-pulse" /> NLP Knowledge Graph Linker
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Automatically maps variant output nodes to patient, disease, and symptom nodes in the logic network.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runNlpLinking}
            disabled={loading}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
              loading 
                ? "bg-emerald-100 text-emerald-700 opacity-60 cursor-not-allowed" 
                : "bg-emerald-600 text-white shadow-md shadow-emerald-600/10 hover:bg-emerald-700"
            )}
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {loading ? "Analyzing..." : "Suggest Connections"}
          </button>

          {suggestions.length > 0 && hasUnforged && (
            <button
              onClick={forgeAllLinks}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-md shadow-slate-900/10"
            >
              <GitCompare className="w-3.5 h-3.5 text-blue-400" />
              Forge All Links
            </button>
          )}
        </div>
      </div>

      {/* Target Source Variants Badge */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-md">
          Current Stream Targets:
        </span>
        {activeVariantPayload && activeVariantPayload.length > 0 ? (
          activeVariantPayload.map((v, i) => (
            <span key={i} className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Dna className="w-3 h-3 text-emerald-500" /> {v.gene} {v.variant}
            </span>
          ))
        ) : rawTextVariants.length > 0 ? (
          rawTextVariants.map((v, i) => (
            <span key={i} className="text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Dna className="w-3 h-3 text-slate-400" /> {v.gene} {v.variant}
            </span>
          ))
        ) : (
          <span className="text-[9px] font-semibold text-slate-400 italic">No variants parsed yet. Enter variant text or run steps.</span>
        )}
      </div>

      {/* Suggestion list */}
      <div className="max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-[10px] font-bold uppercase tracking-wide flex flex-col items-center gap-2">
              <GitCommit className="w-8 h-8 text-slate-300" />
              Click "Suggest Connections" to align newly analyzed mutations with entities.
            </div>
          ) : (
            suggestions.map((link, idx) => {
              const uniqueId = `${link.sourceId}_${link.targetId}`;
              const isForged = committedLinks.includes(uniqueId);

              return (
                <motion.div
                  key={uniqueId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "border rounded-2xl p-3.5 transition-all flex flex-col gap-2.5",
                    isForged 
                      ? "bg-slate-100/50 border-slate-200 opacity-70" 
                      : "bg-white border-slate-100 shadow-sm hover:border-slate-200"
                  )}
                >
                  {/* Title and Badge */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-emerald-100">
                        <Dna className="w-3 h-3" />
                        {link.sourceName}
                      </div>

                      <ArrowRightLeft className="w-3 h-3 text-slate-400" />

                      <div className={cn(
                        "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border",
                        link.targetType === 'disease' 
                          ? "bg-purple-50 text-purple-800 border-purple-100"
                          : link.targetType === 'symptom'
                            ? "bg-amber-50 text-amber-800 border-amber-100"
                            : "bg-blue-50 text-blue-800 border-blue-100"
                      )}>
                        {link.targetName}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-mono font-black bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded uppercase">
                        {link.relationship}
                      </span>
                      <span className="text-[9px] font-mono font-black text-emerald-600">
                        {Math.round(link.confidence * 100)}% Match
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[10px] leading-relaxed text-slate-600 font-medium">
                    {link.explanation}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t border-slate-50 pt-2 mt-0.5">
                    <span className="text-[8px] text-slate-400 font-bold uppercase flex items-center gap-1">
                      Link Direction: Bi-directional Linkage Enabled
                    </span>

                    <button
                      onClick={() => forgeLink(link)}
                      disabled={isForged}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                        isForged 
                          ? "bg-slate-200 text-slate-500 cursor-not-allowed" 
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                      )}
                    >
                      {isForged ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Forged
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 text-emerald-600" />
                          Forge Link
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
