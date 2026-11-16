import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { STECCO_NODES, STECCO_NODES_BY_ID } from '../../data/steccoAtlas';
import { SEDENTARY_SCENARIOS } from '../../data/myofascialChains';
import {
  createDefaultAdhesionMap,
  findBestTransmissionPath,
  solveTensegrityField,
  traceRootCausesAndPrescription,
} from '../tensegritySolver';

describe('Outside Judge 1: BodyParts3D 4.0 3D Mesh Surface Coordinate Validation', () => {
  const atlasPath = path.resolve(process.cwd(), 'public/models/musculoskeletal-atlas.json');
  const atlasData = JSON.parse(fs.readFileSync(atlasPath, 'utf-8'));
  const partsById = new Map<string, any>(atlasData.parts.map((p: any) => [p.id, p]));

  it('verifies every Stecco CC/CF/CP node maps to a real BodyParts3D mesh and sits on its 3D bounding box within 2mm', () => {
    expect(STECCO_NODES.length).toBeGreaterThanOrEqual(28);

    for (const node of STECCO_NODES) {
      const part = partsById.get(node.primaryPartId);
      expect(part, `Missing BodyParts3D mesh ${node.primaryPartId} for ${node.code}`).toBeDefined();

      const [minB, maxB] = part.bounds as [[number, number, number], [number, number, number]];
      const [x, y, z] = node.coords;
      const tol = 0.002; // 2mm tolerance

      expect(x).toBeGreaterThanOrEqual(minB[0] - tol);
      expect(x).toBeLessThanOrEqual(maxB[0] + tol);
      expect(y).toBeGreaterThanOrEqual(minB[1] - tol);
      expect(y).toBeLessThanOrEqual(maxB[1] + tol);
      expect(z).toBeGreaterThanOrEqual(minB[2] - tol);
      expect(z).toBeLessThanOrEqual(maxB[2] + tol);
    }
  });
});

describe('Outside Judge 2: Stecco Hand-to-Scapula-to-Thorax Bidirectional Loop Continuity', () => {
  it('proves continuous outgoing anterior transmission from Thenar/Wrist (AN-DI / AN-CA) through Pectoralis Minor (AN-SC) to Thoracic Spine (RE-TH)', () => {
    const pathFromThumb = findBestTransmissionPath('AN-DI', 'RE-TH');
    expect(pathFromThumb).not.toBeNull();
    expect(pathFromThumb!.pathNodeIds).toContain('AN-SC');
    expect(pathFromThumb!.pathWeight).toBeGreaterThan(0.5);

    const pathFromWristFlexors = findBestTransmissionPath('AN-CA', 'RE-TH');
    expect(pathFromWristFlexors).not.toBeNull();
    expect(pathFromWristFlexors!.pathNodeIds).toContain('AN-CU');
    expect(pathFromWristFlexors!.pathNodeIds).toContain('AN-SC');
  });

  it('proves continuous returning posterior transmission from Dorsal Hand/Hypothenar (RE-DI / ME-DI) through Infraspinatus (ER-HU) & Rhomboids (RE-SC) to Thoracic Spine (RE-TH)', () => {
    const pathFromDorsalHand = findBestTransmissionPath('RE-DI', 'RE-TH');
    expect(pathFromDorsalHand).not.toBeNull();
    expect(pathFromDorsalHand!.pathNodeIds).toContain('RE-CA');
    expect(pathFromDorsalHand!.pathNodeIds).toContain('ER-HU');
    expect(pathFromDorsalHand!.pathNodeIds).toContain('RE-SC');
    expect(pathFromDorsalHand!.pathWeight).toBeGreaterThan(0.5);

    const pathFromHypothenar = findBestTransmissionPath('ME-DI', 'RE-TH');
    expect(pathFromHypothenar).not.toBeNull();
    expect(pathFromHypothenar!.pathNodeIds).toContain('ER-HU');
    expect(pathFromHypothenar!.pathNodeIds).toContain('RE-SC');
  });
});

describe('Outside Judge 3: Biomechanical Counterfactual Proof (Why Direct Back Rubbing Fails vs. Full-Line Release)', () => {
  const scenario = SEDENTARY_SCENARIOS.find((s) => s.id === 'thoracic_scapular_arm_loop')!;
  const scenarioMap = {
    ...createDefaultAdhesionMap(),
    ...scenario.adhesionOverrides,
  };

  it('demonstrates high eccentric traction strain at RE-TH and RE-SC in sedentary posture', () => {
    const field = solveTensegrityField(scenarioMap);
    expect(field['RE-TH'].totalStrain).toBeGreaterThan(0.8);
    expect(field['RE-TH'].transmittedPull).toBeGreaterThan(0.8);
    expect(field['RE-SC'].totalStrain).toBeGreaterThan(0.8);
  });

  it('proves that rubbing ONLY the painful thoracic spine (RE-TH) without releasing AN-SC & arm chains leaves >70% transmitted pull intact', () => {
    const naiveLocalRubMap = { ...scenarioMap, 'RE-TH': 0.1 };
    const fieldAfterNaiveRub = solveTensegrityField(naiveLocalRubMap);
    // Because AN-SC, ER-HU, RE-CA, AN-CA are still locked, transmittedPull on RE-TH remains huge!
    expect(fieldAfterNaiveRub['RE-TH'].transmittedPull).toBeGreaterThan(0.75);
  });

  it('proves that following the ordered Stecco upstream release prescription reduces RE-TH strain by >= 65%', () => {
    const report = traceRootCausesAndPrescription('RE-TH', scenarioMap);
    expect(report.totalRelativeReliefPercent).toBeGreaterThanOrEqual(65);
    expect(report.finalSimulatedStrain).toBeLessThan(0.3);
  });
});

describe('Outside Judge 4: Red-Team Clinical Sequencing & Neurovascular Safety Rules', () => {
  it('never places an eccentric victim CP node as Step 1 when upstream CC locks exist', () => {
    const map = createDefaultAdhesionMap();
    for (const cpId of ['RE-TH', 'RE-SC', 'RE-LU', 'RE-CL']) {
      const report = traceRootCausesAndPrescription(cpId, map);
      expect(report.prescriptionSteps.length).toBeGreaterThan(2);
      const firstStepNode = report.prescriptionSteps[0].node;
      expect(firstStepNode.roleType).not.toBe('CP');
      expect(firstStepNode.releasePriorityOrder).toBe(1);
    }
  });

  it('ensures every Stecco node includes palpation landmarks, release technique, red-team safety warning, and MV test', () => {
    for (const node of STECCO_NODES) {
      expect(node.palpationLandmark.length).toBeGreaterThan(10);
      expect(node.releaseTechnique.length).toBeGreaterThan(10);
      expect(node.redTeamWarning.length).toBeGreaterThan(10);
      expect(node.movementVerification.includes('MV')).toBe(true);
      expect(STECCO_NODES_BY_ID[node.id]).toBeDefined();
    }
  });
});
