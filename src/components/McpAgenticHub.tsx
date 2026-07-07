import React, { useState, useEffect, useRef } from 'react';
import { 
  Server, 
  Cpu, 
  Play, 
  Terminal, 
  Database, 
  FileText, 
  Settings, 
  Sparkles, 
  Send, 
  Check, 
  RefreshCw, 
  Layers, 
  ShieldAlert, 
  ArrowRight, 
  Code, 
  Sliders,
  HelpCircle,
  Dna,
  Search,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

// Define the interface for an MCP Server
interface McpServer {
  id: string;
  name: string;
  description: string;
  version: string;
  transport: 'stdio' | 'sse' | 'websocket';
  status: 'online' | 'offline';
  tools: {
    name: string;
    description: string;
    parameters: Record<string, { type: string; description: string; defaultValue?: string; example?: string }>;
  }[];
}

const MCP_SERVERS: McpServer[] = [
  {
    id: 'bionemo',
    name: 'BioNeMo™ NIM MCP Server',
    description: 'Binds Google AI agent reasoning to NVIDIA NIM APIs for protein folding and molecular docking structures.',
    version: '1.2.4',
    transport: 'stdio',
    status: 'online',
    tools: [
      {
        name: 'esmfold_predict_structure',
        description: 'Predicts high-fidelity 3D atomic coordinates from primary amino acid sequences.',
        parameters: {
          sequence: { type: 'string', description: 'Primary amino acid sequence (FASTA format without headers).' },
          confidence_threshold: { type: 'number', description: 'Filter threshold for pLDDT confidence scores (0.0 - 1.0).' }
        }
      },
      {
        name: 'diffdock_dock_molecule',
        description: 'Performs deep generative ligand-protein docking to predict binding configurations and energies.',
        parameters: {
          ligand_smiles: { type: 'string', description: 'SMILES representation of the small molecule drug candidate.' },
          protein_pdb_id: { type: 'string', description: 'Target protein structural coordinate ID (PDB format).' }
        }
      }
    ]
  },
  {
    id: 'postgres',
    name: 'PostgreSQL / Cloud SQL MCP Server',
    description: 'Provides structured schema traversal, vector similarity searches, and read-write SQL access to clinical databases.',
    version: '1.1.0',
    transport: 'sse',
    status: 'online',
    tools: [
      {
        name: 'query_variant_db',
        description: 'Runs secure, read-only SQL queries against the master patient variant repository.',
        parameters: {
          sql_query: { type: 'string', description: 'Standard compliant PostgreSQL query string (read-only).' },
          limit: { type: 'number', description: 'Maximum number of diagnostic records to return.' }
        }
      },
      {
        name: 'get_table_schema',
        description: 'Retrieves metadata schema and column classifications for a target database table.',
        parameters: {
          table_name: { type: 'string', description: 'Name of the table to introspect (e.g., variant_annotations).' }
        }
      }
    ]
  },
  {
    id: 'genomics_fs',
    name: 'Local Genomics Filesystem MCP Server',
    description: 'High-speed local storage access to index compressed BAM/VCF arrays and parse target reference blocks.',
    version: '1.0.1',
    transport: 'stdio',
    status: 'online',
    tools: [
      {
        name: 'parse_vcf_block',
        description: 'Parses a specific genomic range block from high-throughput Variant Call Format files.',
        parameters: {
          vcf_path: { type: 'string', description: 'Relative path to VCF file in research directory.' },
          chromosome: { type: 'string', description: 'Chromosome identifier (e.g. chr7, chr22).' },
          start_pos: { type: 'number', description: 'Start nucleotide coordinate position.' },
          end_pos: { type: 'number', description: 'End nucleotide coordinate position.' }
        }
      },
      {
        name: 'retrieve_hg38_reference',
        description: 'Fetches reference fasta nucleotide patterns for coordinates from the human genome reference hg38.',
        parameters: {
          chromosome: { type: 'string', description: 'Chromosome designation.' },
          position: { type: 'number', description: 'Nucleotide anchor index.' },
          window_size: { type: 'number', description: 'Upstream/downstream flanking nucleotide block size.' }
        }
      }
    ]
  },
  {
    id: 'gcp_genomics',
    name: 'Google Cloud Genomics MCP Server',
    description: 'Exposes federated BigQuery genomics tables, Vertex AI processing pipelines, and FHIR clinical store endpoints.',
    version: '1.3.0',
    transport: 'sse',
    status: 'online',
    tools: [
      {
        name: 'bigquery_genomics_search',
        description: 'Searches 1000 Genomes high-depth references or global cohort database records inside Google BigQuery.',
        parameters: {
          cohort_id: { type: 'string', description: 'The unique identifier for the targeted research cohort.' },
          gene_symbol: { type: 'string', description: 'HGNC gene symbol (e.g. BRCA1, KCNH2).' }
        }
      },
      {
        name: 'fhir_store_export',
        description: 'Publishes finalized diagnostic models directly to Google Cloud Healthcare API FHIR Stores.',
        parameters: {
          patient_id: { type: 'string', description: 'FHIR compliant Patient unique reference ID.' },
          observation_payload_json: { type: 'string', description: 'Valid Observation or DiagnosticReport JSON schema.' }
        }
      }
    ]
  }
];

// Presets for Agentic Workflow Simulations
interface AgentPreset {
  id: string;
  name: string;
  prompt: string;
  steps: {
    nodeId: number;
    title: string;
    agentName: string;
    log: string;
    mcpRequest: string;
    mcpResponse: string;
  }[];
  finalResult: string;
}

const AGENT_PRESETS: AgentPreset[] = [
  {
    id: 'acmg_analysis',
    name: 'ACMG Pathogenicity Assessment',
    prompt: 'Query patient variant chr7-117232247-G-A from Cloud SQL, predict structure changes via BioNeMo, and compile clinical summary.',
    steps: [
      {
        nodeId: 1,
        title: 'Query Cloud SQL',
        agentName: 'Database-Agent',
        log: 'Instructing Cloud SQL MCP Server to run target variant lookup on locus chr7-117232247-G-A.',
        mcpRequest: '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "query_variant_db", "arguments": {"sql_query": "SELECT * FROM patient_variants WHERE locus = \'chr7-117232247-G-A\'", "limit": 1}}, "id": 1}',
        mcpResponse: '{"jsonrpc": "2.0", "result": {"content": [{"type": "text", "text": "{\\"id\\": 4209, \\"gene\\": \\"CFTR\\", \\"amino_acid_change\\": \\"F508del\\", \\"raw_sequence\\": \\"MSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLT\\", \\"allele_frequency\\": 0.00002}"}]}, "id": 1}'
      },
      {
        nodeId: 2,
        title: 'BioNeMo 3D Structure Prediction',
        agentName: 'Structural-Agent',
        log: 'Triggering BioNeMo ESMFold NIM to predict conformational folding impact of CFTR F508del deletion.',
        mcpRequest: '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "esmfold_predict_structure", "arguments": {"sequence": "MSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLT", "confidence_threshold": 0.85}}, "id": 2}',
        mcpResponse: '{"jsonrpc": "2.0", "result": {"content": [{"type": "text", "text": "{\\"plddt_score\\": 0.912, \\"folding_latency_ms\\": 4.82, \\"alpha_helices\\": 4, \\"beta_sheets\\": 8, \\"structural_stability\\": \\"COMPROMISED\\"}"}]}, "id": 2}'
      },
      {
        nodeId: 3,
        title: 'FHIR Export Integration',
        agentName: 'Sync-Agent',
        log: 'Publishing diagnostic observations and coordinate anomalies to the secure Cloud Healthcare FHIR store.',
        mcpRequest: '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "fhir_store_export", "arguments": {"patient_id": "PAT-99120", "observation_payload_json": "{\\"resourceType\\": \\"Observation\\", \\"status\\": \\"final\\", \\"code\\": {\\"text\\": \\"CFTR Gene Mutation Assessment\\"}}"}}, "id": 3}',
        mcpResponse: '{"jsonrpc": "2.0", "result": {"content": [{"type": "text", "text": "{\\"status\\": \\"success\\", \\"resource_id\\": \\"obs-cf-8910\\", \\"fhir_endpoint\\": \\"https://healthcare.googleapis.com/v1/projects/gcp-genomics-mcp/locations/us/datasets/ds1/fhirStores/fh1\\"}"}]}, "id": 3}'
      }
    ],
    finalResult: `### Specialized Multi-Agent Consensus Evaluation Report

**Case Focus:** CFTR F508del Pathogenicity Analysis
**Assigned Node Coordinator:** Consensus-Synthesizer (MCP Enabled)

#### 1. Database Query Findings (Cloud SQL MCP)
* Found candidate locus with significant frequency metrics.
* **Allele Frequency:** 0.00002 (gnomAD rare variant threshold met).
* **Interpreted Locus:** CFTR codon position 508.

#### 2. BioNeMo ESMFold Structural Simulation
* **pLDDT Confidence:** 91.2% (Very High)
* **Impact Profile:** Structural validation indicates a severe truncation in the cystic fibrosis transmembrane conductance regulator nucleotide binding fold. 
* **Assertion:** Highly likely pathogenic.

#### 3. GCP FHIR Publish Status
* Exported successfully as a structured resource to GCP Healthcare FHIR endpoints under ID \`obs-cf-8910\`.
* Verified HIPAA log audit trace.`
  },
  {
    id: 'drug_docking_affinity',
    name: 'Ligand-Target Docking Protocol',
    prompt: 'Parse genomic mutations for mutated protein receptor, retrieve PDB, and simulate ligand docking affinity with candidate Molecule L1.',
    steps: [
      {
        nodeId: 1,
        title: 'Parse Local VCF Block',
        agentName: 'Informatics-Agent',
        log: 'Scanning local research directories to extract the mutation sequence pattern from active exome block.',
        mcpRequest: '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "parse_vcf_block", "arguments": {"vcf_path": "data/exome_v2.vcf", "chromosome": "chr22", "start_pos": 24110000, "end_pos": 24120000}}, "id": 1}',
        mcpResponse: '{"jsonrpc": "2.0", "result": {"content": [{"type": "text", "text": "{\\"mutations_found\\": [{\\"pos\\": 24115820, \\"ref\\": \\"C\\", \\"alt\\": \\"T\\", \\"predicted_gene\\": \\"EGFR\\"}]}"}]}, "id": 1}'
      },
      {
        nodeId: 2,
        title: 'NIM DiffDock Processing',
        agentName: 'Docking-Agent',
        log: 'Invoking DiffDock generative ligand docking to evaluate interaction profile of candidate ligand SMILES.',
        mcpRequest: '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "diffdock_dock_molecule", "arguments": {"ligand_smiles": "CC1=C(C(=O)N(C1=O)C)C2=CC=C(C=C2)Cl", "protein_pdb_id": "8EGFR"}}, "id": 2}',
        mcpResponse: '{"jsonrpc": "2.0", "result": {"content": [{"type": "text", "text": "{\\"docking_poses\\": 5, \\"binding_energy_kcal_mol\\": -8.92, \\"confidence_score\\": 0.88, \\"hotspot_residues\\": [\\"MET793\\", \\"ASP855\\"]}"}]}, "id": 2}'
      },
      {
        nodeId: 3,
        title: 'BigQuery Bio-cohort Synthesis',
        agentName: 'Analytics-Agent',
        log: 'Analyzing global cohort references inside BigQuery to correlate EGFR mutated resistance stats.',
        mcpRequest: '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "bigquery_genomics_search", "arguments": {"cohort_id": "egfr_mutants_global", "gene_symbol": "EGFR"}}, "id": 3}',
        mcpResponse: '{"jsonrpc": "2.0", "result": {"content": [{"type": "text", "text": "{\\"matching_cases_count\\": 1404, \\"reported_drug_resistance\\": \\"LOW_TO_MODERATE\\", \\"consensus_clinical_response\\": 72.4}"}]}, "id": 3}'
      }
    ],
    finalResult: `### Generative Molecular Interaction & Docking Affinity Report

**Target Receptor:** Mutant EGFR (Mapped from local VCF exome record)
**Agentic Workflow Mode:** MCP Coupled Generative Biology

#### 1. Mutational Extraction
* Local Filesystem scan localized EGFR substitution within the tyrosine kinase domain.

#### 2. Generative Molecular Docking (NVIDIA NIM)
* **SMILES Candidate:** Chlorine-substituted oxazolidine backbone.
* **Binding Energy:** **-8.92 kcal/mol** (Excellent thermodynamic feasibility).
* **Key Interacting Residues:** Forms hydrogen bonds with peptide nitrogen of **MET793** and salt-bridges with **ASP855** in the activation loop.

#### 3. BigQuery Cohort Validation
* **Global Precedents:** 1,404 registered cases with homologous structural configurations show high susceptibility indexes to structurally matching kinase inhibitors.`
  }
];

export default function McpAgenticHub() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'mcp_servers' | 'agentic_workflow'>('mcp_servers');

  // MCP Server state
  const [selectedServer, setSelectedServer] = useState<McpServer>(MCP_SERVERS[0]);
  const [selectedTool, setSelectedTool] = useState(MCP_SERVERS[0].tools[0]);
  const [toolInputs, setToolInputs] = useState<Record<string, string>>({});
  
  // Terminal / Live Logging
  const [mcpConsoleLogs, setMcpConsoleLogs] = useState<string[]>([]);
  const [isPlayingToolCall, setIsPlayingToolCall] = useState(false);
  const [toolResultJson, setToolResultJson] = useState<string | null>(null);

  // Agentic Workflow state
  const [selectedPreset, setSelectedPreset] = useState<AgentPreset>(AGENT_PRESETS[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [agentIsRunning, setAgentIsRunning] = useState(false);
  const [currentAgentStep, setCurrentAgentStep] = useState(-1);
  const [agentConsoleLogs, setAgentConsoleLogs] = useState<string[]>([]);
  const [finalReportOutput, setFinalReportOutput] = useState<string | null>(null);

  const mcpConsoleEndRef = useRef<HTMLDivElement | null>(null);
  const agentConsoleEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll consoles
  useEffect(() => {
    if (mcpConsoleEndRef.current) {
      mcpConsoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mcpConsoleLogs]);

  useEffect(() => {
    if (agentConsoleEndRef.current) {
      agentConsoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [agentConsoleLogs]);

  // Set default tool inputs when tool changes
  useEffect(() => {
    const defaults: Record<string, string> = {};
    Object.entries(selectedTool.parameters).forEach(([key, schema]) => {
      defaults[key] = schema.defaultValue || schema.example || (schema.type === 'number' ? '500' : 'test_param');
    });
    setToolInputs(defaults);
    setToolResultJson(null);
  }, [selectedTool]);

  const selectServerById = (id: string) => {
    const srv = MCP_SERVERS.find(s => s.id === id);
    if (srv) {
      setSelectedServer(srv);
      setSelectedTool(srv.tools[0]);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setToolInputs(prev => ({ ...prev, [key]: value }));
  };

  // Simulate MCP JSON-RPC protocol message trace
  const executeSimulatedToolCall = () => {
    if (isPlayingToolCall) return;
    setIsPlayingToolCall(true);
    setToolResultJson(null);

    const clientTxId = Math.floor(Math.random() * 100000);
    
    // Structure JSON-RPC Payload
    const jsonRpcRequest = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: selectedTool.name,
        arguments: Object.entries(toolInputs).reduce((acc, [k, v]) => {
          // Attempt numeric conversion if applicable
          acc[k] = isNaN(Number(v)) ? v : Number(v);
          return acc;
        }, {} as Record<string, any>)
      },
      id: clientTxId
    };

    setMcpConsoleLogs(prev => [
      ...prev,
      `[CLIENT] Establishing connection transport via [${selectedServer.transport.toUpperCase()}] to server "${selectedServer.name}"`,
      `[CLIENT --> SERVER] Initiating JSON-RPC Request (ID: ${clientTxId}):\n${JSON.stringify(jsonRpcRequest, null, 2)}`
    ]);

    setTimeout(() => {
      // Simulate server-side processing
      setMcpConsoleLogs(prev => [
        ...prev,
        `[SERVER] Received Request ID: ${clientTxId}. Authorizing execution capabilities...`,
        `[SERVER] Launching internal computational node for tool "${selectedTool.name}"...`
      ]);

      setTimeout(() => {
        let simulatedResult: Record<string, any> = {};

        // Tailor the response based on the actual tool
        if (selectedTool.name === 'esmfold_predict_structure') {
          const sequenceLen = (toolInputs.sequence || '').length || 45;
          simulatedResult = {
            status: 'success',
            plddt_score: parseFloat((0.82 + Math.random() * 0.15).toFixed(3)),
            latency_seconds: parseFloat((0.8 + Math.random() * 2).toFixed(2)),
            sequence_length: sequenceLen,
            helices_count: Math.round(sequenceLen * 0.1),
            sheets_count: Math.round(sequenceLen * 0.15),
            coordinate_points_resolved: sequenceLen * 3,
            file_ref: `pdb_output_${Math.floor(Math.random() * 10000)}.pdb`
          };
        } else if (selectedTool.name === 'diffdock_dock_molecule') {
          simulatedResult = {
            status: 'docked',
            binding_affinity_kcal_mol: parseFloat((-11.5 + Math.random() * 4).toFixed(2)),
            rmse_deviation: parseFloat((1.1 + Math.random() * 0.9).toFixed(2)),
            poses_evaluated: 10,
            best_pose_id: 3,
            steric_hindrance_met: true,
            interacting_residues: ['ILE84', 'THR112', 'PHE209']
          };
        } else if (selectedTool.name === 'query_variant_db') {
          simulatedResult = {
            records_matched: 3,
            execution_time_ms: 12.4,
            columns_returned: ['id', 'locus', 'gene_symbol', 'clinical_significance'],
            data: [
              { id: 1024, locus: 'chr11-2045512-C-G', gene_symbol: 'KCNH2', clinical_significance: 'Pathogenic' },
              { id: 1028, locus: 'chr11-2045990-A-T', gene_symbol: 'KCNH2', clinical_significance: 'Likely Pathogenic' },
              { id: 1035, locus: 'chr11-2046124-G-A', gene_symbol: 'KCNH2', clinical_significance: 'Uncertain Significance' }
            ]
          };
        } else if (selectedTool.name === 'get_table_schema') {
          simulatedResult = {
            table: toolInputs.table_name || 'variant_annotations',
            engine: 'PostgreSQL',
            row_count_estimate: 4851200,
            schema: {
              id: 'BIGSERIAL PRIMARY KEY',
              locus: 'VARCHAR(128) UNIQUE INDEX',
              gene_symbol: 'VARCHAR(32)',
              clinsig: 'VARCHAR(64)',
              allele_frequency: 'DOUBLE PRECISION',
              last_updated: 'TIMESTAMP WITH TIME ZONE'
            }
          };
        } else if (selectedTool.name === 'parse_vcf_block') {
          simulatedResult = {
            file_parsed: toolInputs.vcf_path || 'data/exome_v2.vcf',
            chromosome_context: toolInputs.chromosome || 'chr7',
            header_lines_skipped: 182,
            records_parsed: 48,
            filtered_variants_count: 3,
            highly_pathogenic_matches: [
              { position: 117232247, ref: 'G', alt: 'A', coding: 'c.1521_1523delCTT', disease: 'Cystic Fibrosis' }
            ]
          };
        } else if (selectedTool.name === 'retrieve_hg38_reference') {
          simulatedResult = {
            assembly: 'GRCh38',
            chromosome: toolInputs.chromosome || 'chr7',
            center_position: Number(toolInputs.position) || 117232247,
            upstream_flank: 'CGATTAGCTAGCTAGCTAGCTG',
            downstream_flank: 'AAGCTTCGATCGATCGAATCGA',
            reference_allele: 'G'
          };
        } else if (selectedTool.name === 'bigquery_genomics_search') {
          simulatedResult = {
            billing_project: 'gcp-genomics-mcp',
            bytes_scanned_gb: 14.82,
            cohort_matched_count: 8522,
            target_gene: toolInputs.gene_symbol || 'BRCA1',
            alleles_evaluated: 120594,
            stat_significance_p_value: 0.000041,
            associated_phenotype_correlation_score: 0.941
          };
        } else if (selectedTool.name === 'fhir_store_export') {
          simulatedResult = {
            export_status: 'PUBLISHED',
            resource_type: 'DiagnosticReport',
            logical_id: `gcp-fhir-res-${Math.floor(Math.random() * 1000000)}`,
            fhir_version: 'R4',
            endpoint: 'https://healthcare.googleapis.com/v1/projects/mcp-gcp-fhir',
            audit_log_trace_hash: 'sha256-df82ea203b019df9ae'
          };
        }

        const jsonRpcResponse = {
          jsonrpc: "2.0",
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(simulatedResult)
              }
            ]
          },
          id: clientTxId
        };

        setToolResultJson(JSON.stringify(simulatedResult, null, 2));
        setMcpConsoleLogs(prev => [
          ...prev,
          `[SERVER --> CLIENT] Received JSON-RPC Response (ID: ${clientTxId}):\n${JSON.stringify(jsonRpcResponse, null, 2)}`,
          `[CLIENT] MCP tool execution complete. Disconnected transport thread.`
        ]);
        setIsPlayingToolCall(false);
        toast.success(`MCP Tool "${selectedTool.name}" completed successfully!`);
      }, 1500);

    }, 1000);
  };

  // Simulate Agentic Reasoner Workflow
  const handleStartAgenticWorkflow = () => {
    if (agentIsRunning) return;
    setAgentIsRunning(true);
    setCurrentAgentStep(0);
    setFinalReportOutput(null);
    setAgentConsoleLogs([
      `[AGENT COORD] Booting up Agentic Core utilizing Model Context Protocol schema.`,
      `[AGENT COORD] Analyzing user intent and constraints...`,
      `[USER INTENT] "${customPrompt || selectedPreset.prompt}"`,
      `[AGENT COORD] Planning execution steps. Selecting available registered MCP servers and tools...`
    ]);

    const activeSteps = selectedPreset.steps;

    const executeWorkflowStep = (stepIndex: number) => {
      if (stepIndex >= activeSteps.length) {
        // Complete workflow
        setTimeout(() => {
          setAgentConsoleLogs(prev => [
            ...prev,
            `[AGENT COORD] Finalizing multi-agent outputs. Reconciling conflicting parameters.`,
            `[AGENT COORD] Executing final markdown synthesis report...`
          ]);

          setTimeout(() => {
            setFinalReportOutput(selectedPreset.finalResult);
            setAgentIsRunning(false);
            setCurrentAgentStep(activeSteps.length); // All active
            toast.success("Agentic Reasoning Loop complete!");
          }, 1200);

        }, 1000);
        return;
      }

      const step = activeSteps[stepIndex];
      setCurrentAgentStep(stepIndex);

      setTimeout(() => {
        setAgentConsoleLogs(prev => [
          ...prev,
          `\n--- STEP ${step.nodeId}: [${step.title.toUpperCase()}] ---`,
          `[${step.agentName.toUpperCase()}] Active. ${step.log}`,
          `[${step.agentName.toUpperCase()} --> MCP] Dispatching JSON-RPC Call:\n${step.mcpRequest}`
        ]);

        setTimeout(() => {
          setAgentConsoleLogs(prev => [
            ...prev,
            `[MCP RESPONSE --> ${step.agentName.toUpperCase()}] Received payload:\n${step.mcpResponse}`,
            `[${step.agentName.toUpperCase()}] Step output validated. Continuing workflow.`
          ]);

          executeWorkflowStep(stepIndex + 1);
        }, 1800);

      }, 1500);
    };

    executeWorkflowStep(0);
  };

  return (
    <div className="bg-[#05070a] border border-zinc-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-6">
      
      {/* Visual background ambient grids */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#76B900/4,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#0284c7/3,transparent_50%)] pointer-events-none" />
      
      {/* Interactive header tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0284c7]/10 border border-[#0284c7]/20 rounded-2xl text-[#0284c7]">
            <Server className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[8.5px] font-mono font-black text-[#0284c7] uppercase tracking-widest block">
              Protocol Workspace
            </span>
            <h3 className="text-sm font-black uppercase text-white tracking-tight flex items-center gap-1.5 mt-0.5">
              Model Context Protocol (MCP) & Agentic AI Hub
            </h3>
          </div>
        </div>

        {/* Workspace Selector Tabs */}
        <div className="flex gap-1.5 p-0.5 bg-zinc-950 border border-zinc-900 rounded-xl">
          <button
            onClick={() => setActiveTab('mcp_servers')}
            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'mcp_servers'
                ? 'bg-zinc-900 text-white border border-zinc-800'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#76B900]" />
            MCP Server Registry
          </button>
          <button
            onClick={() => setActiveTab('agentic_workflow')}
            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'agentic_workflow'
                ? 'bg-zinc-900 text-white border border-zinc-800'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Agentic Workspace
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'mcp_servers' ? (
          <motion.div
            key="mcp_servers_panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Side: Servers & Tools List */}
            <div className="lg:col-span-4 space-y-4">
              <div className="space-y-1.5 border-b border-zinc-900 pb-2">
                <span className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest">Available Nodes</span>
                <h4 className="text-[10px] font-black uppercase text-zinc-300 tracking-tight">Active MCP Server Hosts</h4>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {MCP_SERVERS.map((server) => {
                  const isSelected = selectedServer.id === server.id;
                  return (
                    <div
                      key={server.id}
                      onClick={() => selectServerById(server.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left space-y-2 relative overflow-hidden ${
                        isSelected 
                          ? 'bg-zinc-950 border-[#0284c7]/40 ring-1 ring-[#0284c7]/20 shadow-lg' 
                          : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800 hover:bg-zinc-950/60'
                      }`}
                    >
                      {/* Left vertical border for active */}
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0284c7]" />
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${server.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
                          <h5 className="text-[10px] font-black text-zinc-100 uppercase tracking-tight">{server.name}</h5>
                        </div>
                        <span className="text-[7.5px] font-mono text-zinc-500 uppercase">v{server.version}</span>
                      </div>

                      <p className="text-[9px] text-zinc-400 font-medium leading-relaxed">
                        {server.description}
                      </p>

                      <div className="flex items-center justify-between text-[7.5px] font-mono font-black uppercase tracking-wider text-zinc-500 pt-1">
                        <span>Transport: <span className="text-zinc-300">{server.transport}</span></span>
                        <span>{server.tools.length} Tools Available</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Middle Side: Tool Details & Input configuration */}
            <div className="lg:col-span-4 space-y-4">
              <div className="space-y-1.5 border-b border-zinc-900 pb-2">
                <span className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest">Active Server Tools</span>
                <h4 className="text-[10px] font-black uppercase text-zinc-300 tracking-tight">Select Schema & Parameters</h4>
              </div>

              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-4">
                {/* Tool Selector Buttons */}
                <div className="space-y-2">
                  <label className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest block">Available Tools</label>
                  <div className="flex flex-col gap-1.5">
                    {selectedServer.tools.map((tool) => {
                      const isSelected = selectedTool.name === tool.name;
                      return (
                        <button
                          key={tool.name}
                          onClick={() => setSelectedTool(tool)}
                          className={`w-full py-2 px-3 text-left rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-[#0284c7]/10 border-[#0284c7]/30 text-white'
                              : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Code className={`w-3.5 h-3.5 ${isSelected ? 'text-[#0284c7]' : 'text-zinc-500'}`} />
                            <span className="text-[9px] font-mono font-bold">{tool.name}</span>
                          </div>
                          <ChevronRight className="w-3 h-3 text-zinc-600" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px bg-zinc-900" />

                {/* Tool Description */}
                <div className="space-y-1">
                  <span className="text-[7.5px] font-mono font-black text-[#76B900] uppercase tracking-wider block">Description</span>
                  <p className="text-[9px] text-zinc-400 leading-normal leading-relaxed">
                    {selectedTool.description}
                  </p>
                </div>

                <div className="h-px bg-zinc-900" />

                {/* Parameters Inputs */}
                <div className="space-y-3">
                  <span className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest block">Required Parameters</span>
                  {Object.entries(selectedTool.parameters).map(([key, schema]) => (
                    <div key={key} className="space-y-1 font-mono text-[9px]">
                      <div className="flex items-center justify-between text-[8px] uppercase font-bold text-zinc-400">
                        <span>{key} <span className="text-[#0284c7]">({schema.type})</span></span>
                      </div>
                      <input
                        type={schema.type === 'number' ? 'number' : 'text'}
                        value={toolInputs[key] || ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-900 text-white rounded-lg text-[9px] font-medium focus:border-[#0284c7] outline-none"
                        placeholder={schema.description}
                      />
                      <span className="text-[7.5px] text-zinc-500 leading-none">{schema.description}</span>
                    </div>
                  ))}
                </div>

                {/* Execute Button */}
                <button
                  onClick={executeSimulatedToolCall}
                  disabled={isPlayingToolCall}
                  className="w-full py-2.5 bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:from-[#0369a1] hover:to-[#075985] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-sky-950/20 disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {isPlayingToolCall ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      CALLING TOOL SEQUENCE...
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      EXECUTE MCP TOOL CALL
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Side: RPC Wire Stream Console & Output */}
            <div className="lg:col-span-4 flex flex-col h-full space-y-4">
              <div className="space-y-1.5 border-b border-zinc-900 pb-2">
                <span className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest">Protocol Monitor</span>
                <h4 className="text-[10px] font-black uppercase text-zinc-300 tracking-tight">JSON-RPC 2.0 Wire Monitor</h4>
              </div>

              <div className="flex-1 min-h-[380px] bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col overflow-hidden relative">
                {/* Header line */}
                <div className="px-4 py-2 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between text-[8px] font-mono text-zinc-500">
                  <span>TRANS-STREAM MONITOR</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>SSE/STDIO PORT ACTIVE</span>
                  </div>
                </div>

                {/* Wire Log Content */}
                <div className="flex-1 p-4 overflow-y-auto font-mono text-[9px] text-zinc-300 space-y-4 max-h-[340px] custom-scrollbar">
                  {mcpConsoleLogs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16 text-zinc-500">
                      <Terminal className="w-8 h-8 text-zinc-700 animate-pulse" />
                      <p className="text-[9px] uppercase font-bold tracking-wider">
                        Awaiting JSON-RPC 2.0 Client Initiation...
                      </p>
                    </div>
                  ) : (
                    mcpConsoleLogs.map((log, index) => {
                      const isClient = log.startsWith('[CLIENT]');
                      const isServer = log.startsWith('[SERVER]');
                      const isClientToServer = log.startsWith('[CLIENT -->');
                      const isServerToClient = log.startsWith('[SERVER -->');

                      let textClass = 'text-zinc-400';
                      if (isClient) textClass = 'text-sky-400 font-bold';
                      else if (isServer) textClass = 'text-yellow-500 font-bold';
                      else if (isClientToServer) textClass = 'text-emerald-400 bg-zinc-950 p-2 border border-zinc-900 rounded-lg whitespace-pre';
                      else if (isServerToClient) textClass = 'text-[#76B900] bg-zinc-950 p-2 border border-zinc-900 rounded-lg whitespace-pre';

                      return (
                        <div key={index} className="space-y-1">
                          <div className={`leading-relaxed ${textClass}`}>{log}</div>
                        </div>
                      );
                    })
                  )}
                  <div ref={mcpConsoleEndRef} />
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="agentic_workflow_panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Column: Preset configurations */}
            <div className="lg:col-span-4 space-y-4">
              <div className="space-y-1.5 border-b border-zinc-900 pb-2">
                <span className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest">Prompt Presets</span>
                <h4 className="text-[10px] font-black uppercase text-zinc-300 tracking-tight">Agentic Pipeline Presets</h4>
              </div>

              <div className="space-y-3">
                {AGENT_PRESETS.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        if (agentIsRunning) return;
                        setSelectedPreset(preset);
                        setCustomPrompt('');
                        setFinalReportOutput(null);
                        setAgentConsoleLogs([]);
                        setCurrentAgentStep(-1);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-2 relative overflow-hidden ${
                        isSelected 
                          ? 'bg-zinc-950 border-blue-500/40 ring-1 ring-blue-500/20' 
                          : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : 'text-zinc-500'}`} />
                        <h5 className="text-[10px] font-black text-zinc-100 uppercase tracking-tight">{preset.name}</h5>
                      </div>
                      <p className="text-[9px] text-zinc-400 leading-relaxed font-semibold">
                        "{preset.prompt}"
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic prompt builder */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3">
                <span className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest block">Custom Agent Instruction</span>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  disabled={agentIsRunning}
                  placeholder="Or write custom clinical tasks here (uses active MCP bindings)..."
                  className="w-full h-20 px-3 py-2 bg-zinc-950 border border-zinc-900 text-white text-[9px] font-medium rounded-xl outline-none focus:border-blue-500 resize-none font-mono"
                />
                
                <button
                  onClick={handleStartAgenticWorkflow}
                  disabled={agentIsRunning}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/20 disabled:opacity-50"
                >
                  {agentIsRunning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      AGENTS COMPUTING PARAMS...
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3 fill-current" />
                      LAUNCH AGENTIC WORKFLOW
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Middle Column: Agent Execution graph & wire diagnostics */}
            <div className="lg:col-span-4 space-y-4">
              <div className="space-y-1.5 border-b border-zinc-900 pb-2">
                <span className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest">Active Pipeline</span>
                <h4 className="text-[10px] font-black uppercase text-zinc-300 tracking-tight">Agent reasoning network</h4>
              </div>

              {/* Workflow visual node list */}
              <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-5">
                <div className="text-[8px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Execution Stream</span>
                  <span className="text-zinc-500">Node-to-Node Channels</span>
                </div>

                <div className="space-y-4 relative">
                  {/* Vertical connecting line */}
                  <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-zinc-900" />

                  {selectedPreset.steps.map((step, idx) => {
                    const isStepActive = idx === currentAgentStep;
                    const isStepCompleted = idx < currentAgentStep;
                    const isStepFuture = idx > currentAgentStep;

                    return (
                      <div key={idx} className="flex items-start gap-4 relative z-10">
                        {/* Node number sphere */}
                        <div className={`w-8 h-8 rounded-full font-mono text-[10px] font-bold flex items-center justify-center border transition-all ${
                          isStepActive 
                            ? 'bg-blue-600 border-blue-400 text-white scale-110 shadow-lg shadow-blue-500/20' 
                            : isStepCompleted 
                              ? 'bg-zinc-900 border-[#76B900]/40 text-[#76B900]' 
                              : 'bg-zinc-950 border-zinc-900 text-zinc-500'
                        }`}>
                          {isStepCompleted ? <Check className="w-4 h-4" /> : step.nodeId}
                        </div>

                        {/* Node details */}
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-center justify-between">
                            <h5 className={`text-[10px] font-black uppercase tracking-tight ${isStepActive ? 'text-white' : 'text-zinc-400'}`}>
                              {step.title}
                            </h5>
                            <span className="text-[7.5px] font-mono text-zinc-500 uppercase">{step.agentName}</span>
                          </div>
                          {isStepActive && (
                            <p className="text-[9px] text-blue-400 font-semibold mt-0.5 animate-pulse">
                              Active: invoking designated MCP server tools...
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="h-px bg-zinc-900" />

                {/* Console text log */}
                <div className="h-44 bg-zinc-950 border border-zinc-900 rounded-xl p-3 font-mono text-[8.5px] text-zinc-400 overflow-y-auto space-y-2 leading-relaxed custom-scrollbar">
                  {agentConsoleLogs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 py-8">
                      <Terminal className="w-5 h-5 mb-1.5" />
                      <span>Console idle. Initiate workflow.</span>
                    </div>
                  ) : (
                    agentConsoleLogs.map((log, index) => {
                      let textColor = 'text-zinc-500';
                      if (log.startsWith('---')) textColor = 'text-white font-bold border-b border-zinc-900/30 pb-0.5 block mt-2';
                      else if (log.includes('Active.') || log.includes('Validated.')) textColor = 'text-[#76B900]';
                      else if (log.includes('Dispatching')) textColor = 'text-sky-400 whitespace-pre overflow-x-auto bg-zinc-950 p-1.5 rounded border border-zinc-900 block';
                      else if (log.includes('Received payload')) textColor = 'text-yellow-400 whitespace-pre overflow-x-auto bg-zinc-950 p-1.5 rounded border border-zinc-900 block';

                      return (
                        <div key={index} className={textColor}>
                          {log}
                        </div>
                      );
                    })
                  )}
                  <div ref={agentConsoleEndRef} />
                </div>
              </div>
            </div>

            {/* Right Column: Compiled consensus output document */}
            <div className="lg:col-span-4 space-y-4">
              <div className="space-y-1.5 border-b border-zinc-900 pb-2">
                <span className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest">Compiled Output</span>
                <h4 className="text-[10px] font-black uppercase text-zinc-300 tracking-tight">Final Clinical Synthesis</h4>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-lg min-h-[380px] flex flex-col overflow-hidden text-left relative">
                {finalReportOutput ? (
                  <div className="flex-1 prose prose-sm max-w-none text-slate-700 font-bold leading-normal overflow-y-auto text-[10px] space-y-3 custom-scrollbar italic max-h-[360px]">
                    {/* Visual header */}
                    <div className="border-b border-slate-100 pb-2 mb-4">
                      <span className="bg-blue-50 text-blue-700 text-[8px] font-black uppercase px-2 py-0.5 rounded">FINAL REPORT</span>
                      <h4 className="text-[11px] font-black uppercase text-slate-900 mt-1">Multi-Agent Federated Summary</h4>
                    </div>
                    
                    {/* Render raw strings as basic formatting */}
                    {finalReportOutput.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('###')) {
                        return <h4 key={pIdx} className="text-xs font-black uppercase text-slate-900 mt-3 pt-2 border-t border-slate-100 first:border-0 first:mt-0 first:pt-0">{paragraph.replace('###', '').trim()}</h4>;
                      }
                      if (paragraph.startsWith('**')) {
                        return <p key={pIdx} className="text-slate-950 font-bold leading-relaxed">{paragraph}</p>;
                      }
                      if (paragraph.startsWith('*')) {
                        return (
                          <ul key={pIdx} className="list-disc pl-4 space-y-1 my-1">
                            {paragraph.split('\n').map((li, lIdx) => (
                              <li key={lIdx} className="text-slate-600 font-medium">{li.replace('*', '').trim()}</li>
                            ))}
                          </ul>
                        );
                      }
                      return <p key={pIdx} className="text-slate-600 font-medium leading-relaxed">{paragraph}</p>;
                    })}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-16 text-slate-400">
                    <FileText className="w-8 h-8 text-slate-300 animate-pulse" />
                    <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">
                      Awaiting Pipeline Execution Output...
                    </p>
                    <span className="text-[9px] text-slate-400 leading-normal max-w-[200px]">
                      Launch the Agentic Workflow loop to compile findings.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
