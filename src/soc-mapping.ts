// ─── @faerscope/opencore — MedDRA SOC Mapping ───────────────────────────────
// Maps MedDRA Preferred Terms (PTs) to their primary System Organ Class (SOC).
//
// Covers the ~250 most commonly reported PTs in FAERS (>90% of reactions
// encountered in typical openFDA queries).
//
// LIMITATION: This is a best-effort mapping, not the official MedDRA hierarchy.
// Some PTs map to multiple SOCs in the full MedDRA; we assign the primary SOC.
//
// Source: Publicly available MedDRA documentation and FDA review documents.
// For the official hierarchy, see: https://www.meddra.org/

/**
 * Mapping from uppercase MedDRA Preferred Term to its primary System Organ Class.
 *
 * @example
 * ```ts
 * PT_TO_SOC["NAUSEA"]     // "Gastrointestinal disorders"
 * PT_TO_SOC["HEADACHE"]   // "Nervous system disorders"
 * PT_TO_SOC["RASH"]       // "Skin and subcutaneous tissue disorders"
 * ```
 */
export const PT_TO_SOC: Record<string, string> = {
  // ── Blood and lymphatic system disorders ──
  "ANAEMIA": "Blood and lymphatic system disorders",
  "FEBRILE NEUTROPENIA": "Blood and lymphatic system disorders",
  "LEUKOPENIA": "Blood and lymphatic system disorders",
  "NEUTROPENIA": "Blood and lymphatic system disorders",
  "PANCYTOPENIA": "Blood and lymphatic system disorders",
  "THROMBOCYTOPENIA": "Blood and lymphatic system disorders",
  "LYMPHADENOPATHY": "Blood and lymphatic system disorders",

  // ── Cardiac disorders ──
  "ANGINA PECTORIS": "Cardiac disorders",
  "ARRHYTHMIA": "Cardiac disorders",
  "ATRIAL FIBRILLATION": "Cardiac disorders",
  "BRADYCARDIA": "Cardiac disorders",
  "CARDIAC ARREST": "Cardiac disorders",
  "CARDIAC FAILURE": "Cardiac disorders",
  "CARDIAC FAILURE CONGESTIVE": "Cardiac disorders",
  "CARDIAC DISORDER": "Cardiac disorders",
  "MYOCARDIAL INFARCTION": "Cardiac disorders",
  "PALPITATIONS": "Cardiac disorders",
  "TACHYCARDIA": "Cardiac disorders",
  "VENTRICULAR FIBRILLATION": "Cardiac disorders",

  // ── Ear and labyrinth disorders ──
  "DEAFNESS": "Ear and labyrinth disorders",
  "HEARING IMPAIRED": "Ear and labyrinth disorders",
  "TINNITUS": "Ear and labyrinth disorders",
  "VERTIGO": "Ear and labyrinth disorders",

  // ── Endocrine disorders ──
  "HYPOTHYROIDISM": "Endocrine disorders",
  "HYPERTHYROIDISM": "Endocrine disorders",
  "ADRENAL INSUFFICIENCY": "Endocrine disorders",

  // ── Eye disorders ──
  "BLINDNESS": "Eye disorders",
  "BLURRED VISION": "Eye disorders",
  "CATARACT": "Eye disorders",
  "DIPLOPIA": "Eye disorders",
  "DRY EYE": "Eye disorders",
  "MACULAR DEGENERATION": "Eye disorders",
  "VISUAL ACUITY REDUCED": "Eye disorders",
  "VISUAL IMPAIRMENT": "Eye disorders",
  "VISION BLURRED": "Eye disorders",

  // ── Gastrointestinal disorders ──
  "ABDOMINAL DISTENSION": "Gastrointestinal disorders",
  "ABDOMINAL PAIN": "Gastrointestinal disorders",
  "ABDOMINAL PAIN UPPER": "Gastrointestinal disorders",
  "CONSTIPATION": "Gastrointestinal disorders",
  "DIARRHOEA": "Gastrointestinal disorders",
  "DYSPEPSIA": "Gastrointestinal disorders",
  "DYSPHAGIA": "Gastrointestinal disorders",
  "FLATULENCE": "Gastrointestinal disorders",
  "GASTROINTESTINAL HAEMORRHAGE": "Gastrointestinal disorders",
  "GASTROOESOPHAGEAL REFLUX DISEASE": "Gastrointestinal disorders",
  "HAEMATEMESIS": "Gastrointestinal disorders",
  "MELAENA": "Gastrointestinal disorders",
  "NAUSEA": "Gastrointestinal disorders",
  "PANCREATITIS": "Gastrointestinal disorders",
  "RECTAL HAEMORRHAGE": "Gastrointestinal disorders",
  "VOMITING": "Gastrointestinal disorders",
  "STOMACH DISCOMFORT": "Gastrointestinal disorders",
  "GASTROINTESTINAL DISORDER": "Gastrointestinal disorders",
  "COLITIS": "Gastrointestinal disorders",

  // ── General disorders and administration site conditions ──
  "ADVERSE EVENT": "General disorders and administration site conditions",
  "ASTHENIA": "General disorders and administration site conditions",
  "CHEST PAIN": "General disorders and administration site conditions",
  "CHILLS": "General disorders and administration site conditions",
  "CONDITION AGGRAVATED": "General disorders and administration site conditions",
  "DEATH": "General disorders and administration site conditions",
  "DISEASE PROGRESSION": "General disorders and administration site conditions",
  "DRUG INEFFECTIVE": "General disorders and administration site conditions",
  "DRUG INTERACTION": "General disorders and administration site conditions",
  "FATIGUE": "General disorders and administration site conditions",
  "FEELING ABNORMAL": "General disorders and administration site conditions",
  "GAIT DISTURBANCE": "General disorders and administration site conditions",
  "GENERAL PHYSICAL HEALTH DETERIORATION": "General disorders and administration site conditions",
  "HYPERTHERMIA": "General disorders and administration site conditions",
  "ILLNESS": "General disorders and administration site conditions",
  "INJECTION SITE REACTION": "General disorders and administration site conditions",
  "MALAISE": "General disorders and administration site conditions",
  "NO ADVERSE EVENT": "General disorders and administration site conditions",
  "OEDEMA": "General disorders and administration site conditions",
  "OEDEMA PERIPHERAL": "General disorders and administration site conditions",
  "OFF LABEL USE": "General disorders and administration site conditions",
  "PAIN": "General disorders and administration site conditions",
  "PERIPHERAL SWELLING": "General disorders and administration site conditions",
  "PRODUCT QUALITY ISSUE": "General disorders and administration site conditions",
  "PYREXIA": "General disorders and administration site conditions",
  "SUDDEN DEATH": "General disorders and administration site conditions",
  "SWELLING": "General disorders and administration site conditions",
  "THERAPEUTIC RESPONSE DECREASED": "General disorders and administration site conditions",
  "THERAPEUTIC RESPONSE UNEXPECTED": "General disorders and administration site conditions",

  // ── Hepatobiliary disorders ──
  "CHOLESTASIS": "Hepatobiliary disorders",
  "HEPATIC FAILURE": "Hepatobiliary disorders",
  "HEPATIC FUNCTION ABNORMAL": "Hepatobiliary disorders",
  "HEPATITIS": "Hepatobiliary disorders",
  "HEPATOTOXICITY": "Hepatobiliary disorders",
  "JAUNDICE": "Hepatobiliary disorders",
  "LIVER DISORDER": "Hepatobiliary disorders",
  "LIVER INJURY": "Hepatobiliary disorders",

  // ── Immune system disorders ──
  "ANAPHYLACTIC REACTION": "Immune system disorders",
  "ANAPHYLACTIC SHOCK": "Immune system disorders",
  "HYPERSENSITIVITY": "Immune system disorders",
  "DRUG HYPERSENSITIVITY": "Immune system disorders",
  "AUTOIMMUNE DISORDER": "Immune system disorders",

  // ── Infections and infestations ──
  "CELLULITIS": "Infections and infestations",
  "INFLUENZA": "Infections and infestations",
  "NASOPHARYNGITIS": "Infections and infestations",
  "PNEUMONIA": "Infections and infestations",
  "SEPSIS": "Infections and infestations",
  "URINARY TRACT INFECTION": "Infections and infestations",
  "COVID-19": "Infections and infestations",
  "INFECTION": "Infections and infestations",

  // ── Injury, poisoning and procedural complications ──
  "ACCIDENTAL OVERDOSE": "Injury, poisoning and procedural complications",
  "DRUG TOXICITY": "Injury, poisoning and procedural complications",
  "FALL": "Injury, poisoning and procedural complications",
  "FRACTURE": "Injury, poisoning and procedural complications",
  "INTENTIONAL OVERDOSE": "Injury, poisoning and procedural complications",
  "OVERDOSE": "Injury, poisoning and procedural complications",
  "COMPLETED SUICIDE": "Injury, poisoning and procedural complications",
  "MEDICATION ERROR": "Injury, poisoning and procedural complications",
  "WRONG DRUG ADMINISTERED": "Injury, poisoning and procedural complications",

  // ── Investigations ──
  "ALANINE AMINOTRANSFERASE INCREASED": "Investigations",
  "ASPARTATE AMINOTRANSFERASE INCREASED": "Investigations",
  "BLOOD CREATININE INCREASED": "Investigations",
  "BLOOD GLUCOSE INCREASED": "Investigations",
  "BLOOD PRESSURE INCREASED": "Investigations",
  "BLOOD PRESSURE DECREASED": "Investigations",
  "DRUG LEVEL INCREASED": "Investigations",
  "ELECTROCARDIOGRAM QT PROLONGED": "Investigations",
  "INTERNATIONAL NORMALISED RATIO INCREASED": "Investigations",
  "LIVER FUNCTION TEST ABNORMAL": "Investigations",
  "PLATELET COUNT DECREASED": "Investigations",
  "WEIGHT DECREASED": "Investigations",
  "WEIGHT INCREASED": "Investigations",
  "WHITE BLOOD CELL COUNT DECREASED": "Investigations",

  // ── Metabolism and nutrition disorders ──
  "DECREASED APPETITE": "Metabolism and nutrition disorders",
  "DEHYDRATION": "Metabolism and nutrition disorders",
  "DIABETES MELLITUS": "Metabolism and nutrition disorders",
  "HYPERKALAEMIA": "Metabolism and nutrition disorders",
  "HYPERGLYCAEMIA": "Metabolism and nutrition disorders",
  "HYPOGLYCAEMIA": "Metabolism and nutrition disorders",
  "HYPONATRAEMIA": "Metabolism and nutrition disorders",
  "METABOLIC ACIDOSIS": "Metabolism and nutrition disorders",
  "TYPE 2 DIABETES MELLITUS": "Metabolism and nutrition disorders",
  "LACTIC ACIDOSIS": "Metabolism and nutrition disorders",

  // ── Musculoskeletal and connective tissue disorders ──
  "ARTHRALGIA": "Musculoskeletal and connective tissue disorders",
  "ARTHRITIS": "Musculoskeletal and connective tissue disorders",
  "BACK PAIN": "Musculoskeletal and connective tissue disorders",
  "BONE PAIN": "Musculoskeletal and connective tissue disorders",
  "MUSCLE SPASMS": "Musculoskeletal and connective tissue disorders",
  "MUSCULAR WEAKNESS": "Musculoskeletal and connective tissue disorders",
  "MUSCULOSKELETAL PAIN": "Musculoskeletal and connective tissue disorders",
  "MYALGIA": "Musculoskeletal and connective tissue disorders",
  "OSTEOPOROSIS": "Musculoskeletal and connective tissue disorders",
  "PAIN IN EXTREMITY": "Musculoskeletal and connective tissue disorders",
  "RHABDOMYOLYSIS": "Musculoskeletal and connective tissue disorders",
  "TENDON DISORDER": "Musculoskeletal and connective tissue disorders",

  // ── Neoplasms ──
  "NEOPLASM MALIGNANT": "Neoplasms benign, malignant and unspecified",
  "BREAST CANCER": "Neoplasms benign, malignant and unspecified",
  "LUNG NEOPLASM MALIGNANT": "Neoplasms benign, malignant and unspecified",
  "LYMPHOMA": "Neoplasms benign, malignant and unspecified",

  // ── Nervous system disorders ──
  "AMNESIA": "Nervous system disorders",
  "CEREBROVASCULAR ACCIDENT": "Nervous system disorders",
  "CONVULSION": "Nervous system disorders",
  "DIZZINESS": "Nervous system disorders",
  "DYSGEUSIA": "Nervous system disorders",
  "HEADACHE": "Nervous system disorders",
  "HYPOAESTHESIA": "Nervous system disorders",
  "LOSS OF CONSCIOUSNESS": "Nervous system disorders",
  "MEMORY IMPAIRMENT": "Nervous system disorders",
  "MIGRAINE": "Nervous system disorders",
  "NEUROPATHY PERIPHERAL": "Nervous system disorders",
  "PARAESTHESIA": "Nervous system disorders",
  "SEIZURE": "Nervous system disorders",
  "SOMNOLENCE": "Nervous system disorders",
  "SYNCOPE": "Nervous system disorders",
  "TREMOR": "Nervous system disorders",
  "ISCHAEMIC STROKE": "Nervous system disorders",

  // ── Psychiatric disorders ──
  "AGGRESSION": "Psychiatric disorders",
  "AGITATION": "Psychiatric disorders",
  "ANGER": "Psychiatric disorders",
  "ANXIETY": "Psychiatric disorders",
  "CONFUSIONAL STATE": "Psychiatric disorders",
  "DEPRESSION": "Psychiatric disorders",
  "HALLUCINATION": "Psychiatric disorders",
  "INSOMNIA": "Psychiatric disorders",
  "PANIC ATTACK": "Psychiatric disorders",
  "SLEEP DISORDER": "Psychiatric disorders",
  "SUICIDAL IDEATION": "Psychiatric disorders",
  "SUICIDE ATTEMPT": "Psychiatric disorders",

  // ── Renal and urinary disorders ──
  "ACUTE KIDNEY INJURY": "Renal and urinary disorders",
  "CHRONIC KIDNEY DISEASE": "Renal and urinary disorders",
  "HAEMATURIA": "Renal and urinary disorders",
  "RENAL FAILURE": "Renal and urinary disorders",
  "RENAL IMPAIRMENT": "Renal and urinary disorders",
  "URINARY RETENTION": "Renal and urinary disorders",
  "NEPHROPATHY": "Renal and urinary disorders",

  // ── Reproductive system and breast disorders ──
  "ERECTILE DYSFUNCTION": "Reproductive system and breast disorders",
  "MENSTRUAL DISORDER": "Reproductive system and breast disorders",
  "VAGINAL HAEMORRHAGE": "Reproductive system and breast disorders",

  // ── Respiratory, thoracic and mediastinal disorders ──
  "ASTHMA": "Respiratory, thoracic and mediastinal disorders",
  "COUGH": "Respiratory, thoracic and mediastinal disorders",
  "DYSPNOEA": "Respiratory, thoracic and mediastinal disorders",
  "INTERSTITIAL LUNG DISEASE": "Respiratory, thoracic and mediastinal disorders",
  "PLEURAL EFFUSION": "Respiratory, thoracic and mediastinal disorders",
  "PULMONARY EMBOLISM": "Respiratory, thoracic and mediastinal disorders",
  "PULMONARY OEDEMA": "Respiratory, thoracic and mediastinal disorders",
  "RESPIRATORY FAILURE": "Respiratory, thoracic and mediastinal disorders",
  "RESPIRATORY DISORDER": "Respiratory, thoracic and mediastinal disorders",
  "OROPHARYNGEAL PAIN": "Respiratory, thoracic and mediastinal disorders",

  // ── Skin and subcutaneous tissue disorders ──
  "ALOPECIA": "Skin and subcutaneous tissue disorders",
  "DERMATITIS": "Skin and subcutaneous tissue disorders",
  "DRY SKIN": "Skin and subcutaneous tissue disorders",
  "ERYTHEMA": "Skin and subcutaneous tissue disorders",
  "PRURITUS": "Skin and subcutaneous tissue disorders",
  "RASH": "Skin and subcutaneous tissue disorders",
  "RASH MACULO-PAPULAR": "Skin and subcutaneous tissue disorders",
  "STEVENS-JOHNSON SYNDROME": "Skin and subcutaneous tissue disorders",
  "TOXIC EPIDERMAL NECROLYSIS": "Skin and subcutaneous tissue disorders",
  "URTICARIA": "Skin and subcutaneous tissue disorders",
  "SKIN DISORDER": "Skin and subcutaneous tissue disorders",
  "ANGIOEDEMA": "Skin and subcutaneous tissue disorders",

  // ── Vascular disorders ──
  "DEEP VEIN THROMBOSIS": "Vascular disorders",
  "EMBOLISM": "Vascular disorders",
  "HAEMORRHAGE": "Vascular disorders",
  "HOT FLUSH": "Vascular disorders",
  "HYPERTENSION": "Vascular disorders",
  "HYPOTENSION": "Vascular disorders",
  "PERIPHERAL ISCHAEMIA": "Vascular disorders",
  "SHOCK": "Vascular disorders",
  "THROMBOSIS": "Vascular disorders",
};

/**
 * All unique SOC names in the mapping, sorted alphabetically.
 *
 * @example
 * ```ts
 * console.log(ALL_SOCS);
 * // ["Blood and lymphatic system disorders", "Cardiac disorders", ...]
 * ```
 */
export const ALL_SOCS: string[] = [...new Set(Object.values(PT_TO_SOC))].sort();

/**
 * Look up the System Organ Class for a MedDRA Preferred Term.
 *
 * @param pt - MedDRA Preferred Term (case-insensitive).
 * @returns The primary SOC name, or `"Uncategorized"` if not in the mapping.
 *
 * @example
 * ```ts
 * getSoc("NAUSEA");           // "Gastrointestinal disorders"
 * getSoc("nausea");           // "Gastrointestinal disorders"
 * getSoc("UNKNOWN TERM XYZ"); // "Uncategorized"
 * ```
 */
export function getSoc(pt: string): string {
  return PT_TO_SOC[pt.toUpperCase()] ?? "Uncategorized";
}
