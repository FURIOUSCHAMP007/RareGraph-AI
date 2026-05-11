export interface GOEnrichmentResult {
  term: string;
  category: 'Biological Process' | 'Molecular Function' | 'Cellular Component';
  pValue: number;
  enrichedGenes: string[];
  description: string;
}

export async function runGOEnrichment(genes: string[]): Promise<GOEnrichmentResult[]> {
  // Simulate Gene Ontology database lookup and hypergeometric testing
  return new Promise((resolve) => {
    setTimeout(() => {
      const results: GOEnrichmentResult[] = [];
      
      const uniqueGenes = Array.from(new Set(genes));
      
      // Heuristic mapping for mitochondrial/muscular genes commonly in our dashboard
      if (uniqueGenes.includes('MT-TL1') || uniqueGenes.includes('MT-ND5')) {
        results.push({
          term: 'GO:0005739',
          category: 'Cellular Component',
          pValue: 1.2e-9,
          enrichedGenes: uniqueGenes.filter(g => g.startsWith('MT-')),
          description: 'Mitochondrion'
        });
        results.push({
          term: 'GO:0006119',
          category: 'Biological Process',
          pValue: 8.4e-7,
          enrichedGenes: uniqueGenes.filter(g => g.startsWith('MT-')),
          description: 'Oxidative phosphorylation'
        });
        results.push({
          term: 'GO:0008137',
          category: 'Molecular Function',
          pValue: 2.1e-5,
          enrichedGenes: ['MT-ND5'],
          description: 'NADH dehydrogenase (ubiquinone) activity'
        });
      }
      
      if (uniqueGenes.includes('GAA') || uniqueGenes.includes('DMD')) {
        results.push({
          term: 'GO:0003012',
          category: 'Biological Process',
          pValue: 4.5e-4,
          enrichedGenes: uniqueGenes.filter(g => ['GAA', 'DMD'].includes(g)),
          description: 'Muscle system process'
        });
        results.push({
          term: 'GO:0005856',
          category: 'Cellular Component',
          pValue: 1.1e-3,
          enrichedGenes: ['DMD'],
          description: 'Cytoskeleton'
        });
      }

      // Add a generic one if results are sparse
      if (results.length === 0) {
        results.push({
          term: 'GO:0008150',
          category: 'Biological Process',
          pValue: 0.045,
          enrichedGenes: [uniqueGenes[0]],
          description: 'Biological regulation'
        });
      }

      resolve(results.sort((a, b) => a.pValue - b.pValue));
    }, 1200);
  });
}
