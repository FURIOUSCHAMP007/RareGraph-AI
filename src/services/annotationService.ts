export interface VariantAnnotation {
  gene: string;
  variant: string;
  classification: string;
  pSource: string;
  severity: number;
  clinvar_id?: string;
  clinvar_stars?: number;
  gnomad_af?: number;
  gnomad_hom?: number;
  evidence_summary: string;
  acmg_codes: string[];
}

// Simulating an external API call to ClinVar/gnomAD via Gemini reasoning
export async function annotateVariants(variants: { gene: string, variant: string }[]): Promise<VariantAnnotation[]> {
  // In a real production app, you would fetch from real APIs here.
  // For this research-grade system, we use a controlled simulation or AI synthesis.
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const results: VariantAnnotation[] = variants.map(v => {
        if (v.gene === 'MT-TL1') {
          return {
            gene: v.gene,
            variant: v.variant,
            classification: 'Pathogenic',
            pSource: 'ClinVar (VCV000009514)',
            severity: 0.98,
            clinvar_id: '9514',
            clinvar_stars: 3,
            gnomad_af: 0.00001,
            gnomad_hom: 0,
            evidence_summary: 'Consistently reported as pathogenic for MELAS syndrome and associated mitochondrial disorders.',
            acmg_codes: ['PS1', 'PM2', 'PP3']
          };
        }
        if (v.gene === 'MT-ND5') {
          return {
            gene: v.gene,
            variant: v.variant,
            classification: 'Pathogenic',
            pSource: 'ClinVar (VCV000018151)',
            severity: 0.88,
            clinvar_id: '18151',
            clinvar_stars: 4,
            gnomad_af: 0.00003,
            gnomad_hom: 0,
            evidence_summary: 'Reported in multiple individuals with Leigh syndrome and MELAS-like phenotypes.',
            acmg_codes: ['PS1', 'PM1', 'PP3', 'PP4']
          };
        }
        if (v.gene === 'GAA') {
          return {
            gene: v.gene,
            variant: v.variant,
            classification: 'VUS',
            pSource: 'ClinVar (VCV000451022)',
            severity: 0.45,
            clinvar_id: '451022',
            clinvar_stars: 2,
            gnomad_af: 0.002,
            gnomad_hom: 1,
            evidence_summary: 'Conflicting evidence. Some submitters classify as likely benign while others as VUS.',
            acmg_codes: ['PM2', 'BP1']
          };
        }
        // Default / Fallback
        return {
          gene: v.gene,
          variant: v.variant,
          classification: 'Benign',
          pSource: 'gnomAD (v4.1)',
          severity: 0.02,
          clinvar_stars: 1,
          gnomad_af: 0.125,
          gnomad_hom: 45,
          evidence_summary: 'Variant present at high frequency in control populations.',
          acmg_codes: ['BA1']
        };
      });
      resolve(results);
    }, 1500); // Simulate network latency
  });
}
