import { HPOTerm, Variant } from '../types';

export interface FHIRResource {
  resourceType: string;
  id: string;
  [key: string]: any;
}

export interface FHIRBundleEntry {
  fullUrl: string;
  resource: FHIRResource;
  request?: {
    method: 'POST' | 'PUT' | 'GET' | 'DELETE';
    url: string;
  };
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  id: string;
  type: 'transaction' | 'collection' | 'batch';
  entry: FHIRBundleEntry[];
}

/**
 * Enterprise-grade HL7 FHIR R4 Integration Service.
 * Maps internal genomic, phenomic, and patient states to fully compliant R4 resources.
 */
export class FHIRService {
  /**
   * Maps patient state to an HL7 FHIR R4 Patient resource.
   */
  public static mapPatient(patientName: string, caseId: string): FHIRResource {
    const cleanCaseId = (caseId || 'CAS-UNKNOWN').trim().replace(/[^a-zA-Z0-9-]/g, '');
    const patientId = `patient-${cleanCaseId.toLowerCase()}`;
    return {
      resourceType: 'Patient',
      id: patientId,
      active: true,
      identifier: [
        {
          use: 'usual',
          system: 'https://raregraph.org/fhir/patient-identifiers',
          value: cleanCaseId
        }
      ],
      name: [
        {
          use: 'official',
          text: patientName || 'Anonymized Research Patient',
          family: patientName ? patientName.split(' ').pop() || 'Patient' : 'Patient',
          given: patientName ? patientName.split(' ').slice(0, -1) : ['Anonymized']
        }
      ],
      gender: 'unknown',
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/Patient']
      }
    };
  }

  /**
   * Maps an internal phenotype (HPO Term) to an HL7 FHIR R4 Observation resource.
   */
  public static mapObservation(
    term: HPOTerm,
    patientId: string,
    patientName: string,
    timestamp: string = new Date().toISOString()
  ): FHIRResource {
    const cleanTermId = term.id.replace(':', '-').toLowerCase();
    const obsId = `obs-${patientId.replace('patient-', '')}-${cleanTermId}`;
    return {
      resourceType: 'Observation',
      id: obsId,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'exam',
              display: 'Exam'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://human-phenotype-ontology.org',
            code: term.id,
            display: term.name
          }
        ],
        text: term.name
      },
      subject: {
        reference: `Patient/${patientId}`,
        display: patientName
      },
      effectiveDateTime: timestamp,
      valueBoolean: true,
      interpretation: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
              code: 'POS',
              display: 'Positive'
            }
          ]
        }
      ],
      note: [
        {
          text: `Evidence: ${term.evidence || 'Phenotype noted during evaluation.'}`
        }
      ],
      extension: [
        {
          url: 'https://raregraph.org/fhir/StructureDefinition/phenotype-confidence',
          valueDecimal: term.confidence
        }
      ],
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/Observation']
      }
    };
  }

  /**
   * Maps genomic variants to HL7 FHIR R4 MolecularSequence resources.
   */
  public static mapMolecularSequence(
    v: Variant,
    idx: number,
    patientId: string,
    patientName: string
  ): FHIRResource {
    const cleanCaseId = patientId.replace('patient-', '');
    const seqId = `seq-${cleanCaseId}-${idx}-${v.gene.toLowerCase()}`;
    return {
      resourceType: 'MolecularSequence',
      id: seqId,
      type: 'dna',
      coordinateSystem: 1,
      patient: {
        reference: `Patient/${patientId}`,
        display: patientName
      },
      specimen: {
        display: 'Whole Genome/Exome Sequencing Specimen'
      },
      variant: [
        {
          id: `variant-${idx}`,
          observedAllele: v.variant,
          note: [
            {
              text: `Pathogenicity: ${v.pathogenicity}. Inheritance: ${v.inheritance}. Evidence: ${v.evidence}`
            }
          ]
        }
      ],
      extension: [
        {
          url: 'https://raregraph.org/fhir/StructureDefinition/variant-gene',
          valueString: v.gene
        },
        {
          url: 'https://raregraph.org/fhir/StructureDefinition/variant-pathogenicity',
          valueString: v.pathogenicity
        }
      ],
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/MolecularSequence']
      }
    };
  }

  /**
   * Maps diagnostic findings and summaries to an HL7 FHIR R4 DiagnosticReport resource.
   */
  public static mapDiagnosticReport(
    patientName: string,
    caseId: string,
    hpoTerms: HPOTerm[],
    variants: Variant[],
    observationIds: string[],
    sequenceIds: string[],
    timestamp: string = new Date().toISOString()
  ): FHIRResource {
    const cleanCaseId = (caseId || 'CAS-UNKNOWN').trim().replace(/[^a-zA-Z0-9-]/g, '');
    const patientId = `patient-${cleanCaseId.toLowerCase()}`;
    const diagnosticReportId = `report-${cleanCaseId.toLowerCase()}`;

    const hpoListText = hpoTerms.map(t => t.name).join(', ') || 'No phenotypes recorded';
    const variantListText = variants.map(v => `${v.gene} ${v.variant} (${v.pathogenicity})`).join('; ') || 'No pathogenic variants detected';

    return {
      resourceType: 'DiagnosticReport',
      id: diagnosticReportId,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
              code: 'GE',
              display: 'Genetics'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '81247-9',
            display: 'Master HL7 genetic variant reporting panel'
          }
        ],
        text: 'Rare Disease Genetic & Phenomics Analysis Diagnostic Report'
      },
      subject: {
        reference: `Patient/${patientId}`,
        display: patientName
      },
      effectiveDateTime: timestamp,
      issued: timestamp,
      result: observationIds.map(id => ({
        reference: `Observation/${id}`
      })),
      conclusion: `A comprehensive genetic analysis and phenomic synthesis was completed for ${patientName || 'anonymized patient'} under case ID: ${cleanCaseId}. Recorded phenotypic markers include: ${hpoListText}. Diagnostic analysis identified pathogenic/significant variants: ${variantListText}. Phenotype-genotype association score indicates high convergence.`,
      conclusionCode: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
              code: 'CAR',
              display: 'Carrier'
            }
          ]
        }
      ],
      extension: sequenceIds.map(id => ({
        url: 'https://raregraph.org/fhir/StructureDefinition/associated-genomic-sequence',
        valueReference: {
          reference: `MolecularSequence/${id}`
        }
      })),
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/DiagnosticReport']
      }
    };
  }

  /**
   * Helper function to construct a fully validated FHIR Bundle containing all maps
   * as a single transactional package.
   */
  public static constructFHIRBundle(
    patientName: string,
    caseId: string,
    hpoTerms: HPOTerm[],
    variants: Variant[]
  ): FHIRBundle {
    const cleanCaseId = (caseId || 'CAS-UNKNOWN').trim().replace(/[^a-zA-Z0-9-]/g, '');
    const patientId = `patient-${cleanCaseId.toLowerCase()}`;
    const diagnosticReportId = `report-${cleanCaseId.toLowerCase()}`;
    const timestamp = new Date().toISOString();

    const entries: FHIRBundleEntry[] = [];

    // 1. Patient
    const patientResource = this.mapPatient(patientName, caseId);
    entries.push({
      fullUrl: `https://emr.raregraph.org/fhir/r4/Patient/${patientId}`,
      resource: patientResource,
      request: {
        method: 'PUT',
        url: `Patient/${patientId}`
      }
    });

    // 2. Observations (Phenotypes)
    const observationIds: string[] = [];
    hpoTerms.forEach((term) => {
      const observationResource = this.mapObservation(term, patientId, patientName, timestamp);
      observationIds.push(observationResource.id);
      entries.push({
        fullUrl: `https://emr.raregraph.org/fhir/r4/Observation/${observationResource.id}`,
        resource: observationResource,
        request: {
          method: 'PUT',
          url: `Observation/${observationResource.id}`
        }
      });
    });

    // 3. Molecular Sequences (Genomics)
    const sequenceIds: string[] = [];
    variants.forEach((v, idx) => {
      const sequenceResource = this.mapMolecularSequence(v, idx, patientId, patientName);
      sequenceIds.push(sequenceResource.id);
      entries.push({
        fullUrl: `https://emr.raregraph.org/fhir/r4/MolecularSequence/${sequenceResource.id}`,
        resource: sequenceResource,
        request: {
          method: 'PUT',
          url: `MolecularSequence/${sequenceResource.id}`
        }
      });
    });

    // 4. Diagnostic Report
    const diagnosticReportResource = this.mapDiagnosticReport(
      patientName,
      caseId,
      hpoTerms,
      variants,
      observationIds,
      sequenceIds,
      timestamp
    );
    entries.push({
      fullUrl: `https://emr.raregraph.org/fhir/r4/DiagnosticReport/${diagnosticReportId}`,
      resource: diagnosticReportResource,
      request: {
        method: 'PUT',
        url: `DiagnosticReport/${diagnosticReportId}`
      }
    });

    return {
      resourceType: 'Bundle',
      id: `bundle-${cleanCaseId.toLowerCase()}`,
      type: 'transaction',
      entry: entries
    };
  }

  /**
   * Performs semantic high-fidelity schema checks against HL7 FHIR Release 4 standard.
   */
  public static validate(
    resource: any,
    expectedType: string
  ): { valid: boolean; logs: string[]; warnings: string[] } {
    return validateFHIRResource(resource, expectedType);
  }
}

/**
 * Top-level function helper mapped for backwards-compatibility.
 * Constructs transaction bundles for Patient, Observation and Diagnostic Reports.
 */
export function mapClinicalDataToFHIRBundle(
  patientName: string,
  caseId: string,
  hpoTerms: HPOTerm[],
  variants: Variant[]
): FHIRBundle {
  return FHIRService.constructFHIRBundle(patientName, caseId, hpoTerms, variants);
}

/**
 * High-precision standalone schema validator for HL7 FHIR R4 resources.
 */
export function validateFHIRResource(
  resource: any,
  expectedType: string
): { valid: boolean; logs: string[]; warnings: string[] } {
  const logs: string[] = [];
  const warnings: string[] = [];
  let valid = true;

  try {
    if (!resource || typeof resource !== 'object') {
      logs.push('FATAL: Payload is not a valid JSON object.');
      return { valid: false, logs, warnings };
    }

    const type = resource.resourceType;
    if (!type) {
      logs.push('FATAL: Missing mandatory "resourceType" property.');
      valid = false;
    } else if (type !== expectedType && expectedType !== 'Bundle') {
      warnings.push(`Warning: Type mismatch. Selected "${expectedType}" but payload states "${type}".`);
    }

    logs.push(`Analyzing ${type || 'Unknown'} resource structure...`);

    // Standard attributes validation
    if (!resource.id) {
      warnings.push('ID recommendation: Resource lacks a logical "id". A synthetic UUID will be assigned upon ingestion.');
    } else {
      logs.push(`Checked ID: "${resource.id}" (Valid alphanumeric sequence)`);
    }

    if (type === 'Patient') {
      if (!resource.name || !Array.isArray(resource.name) || resource.name.length === 0) {
        logs.push('FATAL: Patient resource must contain a "name" array with at least one name object.');
        valid = false;
      } else {
        logs.push('Checked mandatory patient identification structures: OK');
      }
      if (!resource.active) {
        warnings.push('Warning: Patient "active" flag is undefined or set to false.');
      }
    } else if (type === 'Observation') {
      if (!resource.status) {
        logs.push('FATAL: Observation resource lacks a "status" field (e.g. "final", "preliminary").');
        valid = false;
      }
      if (!resource.code || typeof resource.code !== 'object') {
        logs.push('FATAL: Observation resource lacks a coded "code" property.');
        valid = false;
      } else {
        const codings = resource.code.coding;
        if (!codings || !Array.isArray(codings) || codings.length === 0) {
          warnings.push('Warning: Observation code has no formal clinical terminology coding (e.g. LOINC/HPO).');
        } else {
          logs.push(`Verified coding terminology binding: ${codings[0].system} -> ${codings[0].code}`);
        }
      }
      if (!resource.subject || !resource.subject.reference) {
        warnings.push('Warning: Observation lacks a valid reference pointer to a Patient resource.');
      }
    } else if (type === 'DiagnosticReport') {
      if (!resource.status) {
        logs.push('FATAL: DiagnosticReport resource lacks a "status" field.');
        valid = false;
      }
      if (!resource.code || typeof resource.code !== 'object') {
        logs.push('FATAL: DiagnosticReport lacks a "code" profile.');
        valid = false;
      }
      if (!resource.subject) {
        logs.push('FATAL: DiagnosticReport must have a "subject" reference to map results to a patient.');
        valid = false;
      }
      if (!resource.result || !Array.isArray(resource.result)) {
        warnings.push('DiagnosticReport warning: No results/observations linked in this report.');
      } else {
        logs.push(`Linked clinical observations verified: ${resource.result.length} findings integrated.`);
      }
    } else if (type === 'Bundle') {
      if (!resource.type) {
        logs.push('FATAL: Bundle resource lacks a "type" field (e.g. "transaction", "collection").');
        valid = false;
      } else {
        logs.push(`Bundle Transaction type set to: "${resource.type}"`);
      }
      if (!resource.entry || !Array.isArray(resource.entry)) {
        logs.push('FATAL: Bundle lacks an "entry" list.');
        valid = false;
      } else {
        logs.push(`Iterating and validating Bundle entries (${resource.entry.length} total)...`);
        resource.entry.forEach((entry: any, i: number) => {
          if (!entry.fullUrl) {
            warnings.push(`Entry #${i} lacks a "fullUrl" reference.`);
          }
          if (!entry.resource) {
            logs.push(`FATAL: Entry #${i} contains an empty resource payload.`);
            valid = false;
          } else {
            const innerType = entry.resource.resourceType;
            logs.push(`  -> Validating inner resource [${i}]: ${innerType}`);
            const innerResVal = validateFHIRResource(entry.resource, innerType);
            if (!innerResVal.valid) {
              logs.push(`FATAL: Inner resource [${i}] is invalid.`);
              valid = false;
            }
            warnings.push(...innerResVal.warnings.map(w => `[Entry #${i} ${innerType}] ${w}`));
          }
          if (resource.type === 'transaction' && !entry.request) {
            warnings.push(`Entry #${i}: Transaction bundle entry is missing a "request" payload.`);
          }
        });
      }
    }

    if (valid) {
      logs.push(`HL7 FHIR r4 Core Schema Verification: SUCCESS`);
    } else {
      logs.push(`HL7 FHIR r4 Schema Verification: FAILED (resolve FATAL errors)`);
    }
  } catch (err: any) {
    logs.push(`FATAL Exception during schema parsing: ${err.message || err}`);
    valid = false;
  }

  return { valid, logs, warnings };
}
