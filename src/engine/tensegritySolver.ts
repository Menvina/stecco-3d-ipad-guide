import {
  STECCO_NODES,
  STECCO_NODES_BY_ID,
  SteccoNode,
  AnatomyTrainId,
} from '../data/steccoAtlas';
import {
  BIOMECHANICAL_EDGES,
  BiomechanicalEdge,
} from '../data/myofascialChains';

export interface NodeForceContribution {
  nodeId: string;
  edgeId: string;
  contribution: number; // 0..1 normalized pull contribution
  mechanismLabelZh: string;
  anatomicalBridgeZh: string;
}

export interface NodeBiomechanicalState {
  nodeId: string;
  adhesion: number; // Local hyaluronic acid densification (0..1)
  transmittedPull: number; // Incoming traction force from connected chains (0..1)
  totalStrain: number; // Effective symptomatic strain / tension (0..1)
  incomingContributors: NodeForceContribution[];
  outgoingTargets: NodeForceContribution[];
}

export interface ReleasePrescriptionStep {
  stepNumber: number;
  stageLabelZh: string;
  node: SteccoNode;
  currentAdhesion: number;
  pathImpactScore: number; // How strongly this node contributes to the target's strain
  transmissionPathIds: string[]; // Sequence of node IDs from this culprit to the target
  whyReleaseThisFirstZh: string;
  expectedTargetStrainAfterStep: number; // Simulated counterfactual target strain (0..1) after releasing up to this step
  strainReductionDelta: number;
}

export interface RootCauseDiagnosticReport {
  targetNode: SteccoNode;
  initialTargetStrain: number;
  initialTransmittedPull: number;
  finalSimulatedStrain: number;
  totalRelativeReliefPercent: number;
  activeChainIds: AnatomyTrainId[];
  highlightedEdgeIds: string[];
  upstreamCulpritIds: string[];
  downstreamVictimIds: string[];
  prescriptionSteps: ReleasePrescriptionStep[];
}

export function createDefaultAdhesionMap(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const node of STECCO_NODES) {
    map[node.id] = node.defaultSedentaryAdhesion;
  }
  return map;
}

/**
 * Computes the equilibrium myofascial tension & traction strain distribution across all Stecco nodes
 * given a map of local hyaluronic acid densification (adhesion) values in [0, 1].
 */
export function solveTensegrityField(
  adhesionMap: Record<string, number>
): Record<string, NodeBiomechanicalState> {
  const adjOut: Record<string, BiomechanicalEdge[]> = {};
  const adjIn: Record<string, BiomechanicalEdge[]> = {};

  for (const node of STECCO_NODES) {
    adjOut[node.id] = [];
    adjIn[node.id] = [];
  }
  for (const edge of BIOMECHANICAL_EDGES) {
    if (adjOut[edge.from]) adjOut[edge.from].push(edge);
    if (adjIn[edge.to]) adjIn[edge.to].push(edge);
  }

  // Iterative force propagation across the directed myofascial graph (5 hops covers DI -> CA -> CU -> HU -> SC -> TH)
  const effectiveSourceSignal: Record<string, number> = {};
  for (const node of STECCO_NODES) {
    const eta = Math.max(0, Math.min(1, adhesionMap[node.id] ?? node.defaultSedentaryAdhesion));
    // Active CC/CF locks act as strong primary tension generators; passive CP nodes mostly transmit upstream pull
    effectiveSourceSignal[node.id] = node.roleType === 'CP' ? eta * 0.55 : eta;
  }

  for (let iter = 0; iter < 5; iter++) {
    const nextSignal: Record<string, number> = { ...effectiveSourceSignal };
    for (const node of STECCO_NODES) {
      const incoming = adjIn[node.id] || [];
      if (incoming.length === 0) continue;

      let weightedSum = 0;
      let weightTotal = 0;
      for (const edge of incoming) {
        const upVal = effectiveSourceSignal[edge.from] ?? 0;
        const pulleyBoost = edge.mechanism === 'bony_pulley_pivot' ? 1.15 : 1.0;
        weightedSum += upVal * edge.weight * pulleyBoost;
        weightTotal += edge.weight;
      }
      const avgIncoming = weightTotal > 0 ? weightedSum / weightTotal : 0;
      const baseEta = Math.max(0, Math.min(1, adhesionMap[node.id] ?? node.defaultSedentaryAdhesion));
      const selfWeight = node.roleType === 'CP' ? 0.35 : 0.62;
      const upstreamWeight = node.roleType === 'CP' ? 0.72 : 0.45;
      nextSignal[node.id] = Math.min(1, baseEta * selfWeight + avgIncoming * upstreamWeight);
    }
    for (const k of Object.keys(nextSignal)) {
      effectiveSourceSignal[k] = nextSignal[k];
    }
  }

  const result: Record<string, NodeBiomechanicalState> = {};

  for (const node of STECCO_NODES) {
    const adhesion = Math.max(0, Math.min(1, adhesionMap[node.id] ?? node.defaultSedentaryAdhesion));
    const inEdges = adjIn[node.id] || [];
    const outEdges = adjOut[node.id] || [];

    const incomingContributors: NodeForceContribution[] = inEdges
      .map((edge) => {
        const srcSignal = effectiveSourceSignal[edge.from] ?? 0;
        const rawPull = srcSignal * edge.weight;
        return {
          nodeId: edge.from,
          edgeId: edge.id,
          contribution: Number(Math.min(1, rawPull).toFixed(3)),
          mechanismLabelZh: edge.mechanismLabelZh,
          anatomicalBridgeZh: edge.anatomicalBridgeZh,
        };
      })
      .sort((a, b) => b.contribution - a.contribution);

    const outgoingTargets: NodeForceContribution[] = outEdges
      .map((edge) => {
        const sent = effectiveSourceSignal[node.id] * edge.weight;
        return {
          nodeId: edge.to,
          edgeId: edge.id,
          contribution: Number(Math.min(1, sent).toFixed(3)),
          mechanismLabelZh: edge.mechanismLabelZh,
          anatomicalBridgeZh: edge.anatomicalBridgeZh,
        };
      })
      .sort((a, b) => b.contribution - a.contribution);

    // Combine incoming pulls using a weighted root-mean-square + peak blend so releasing upstream nodes
    // proportionally reduces transmittedPull!
    let transmittedPull = 0;
    if (incomingContributors.length > 0) {
      const sumContrib = incomingContributors.reduce((acc, c) => acc + c.contribution, 0);
      const meanContrib = sumContrib / incomingContributors.length;
      const maxContrib = incomingContributors[0].contribution;
      transmittedPull = Number(Math.min(1, meanContrib * 0.65 + maxContrib * 0.48).toFixed(3));
    }

    const isCp = node.roleType === 'CP';
    const rawTotal = isCp
      ? transmittedPull * 0.76 + adhesion * 0.28
      : adhesion * 0.68 + transmittedPull * 0.36;
    const totalStrain = Number(Math.min(1, rawTotal).toFixed(3));

    result[node.id] = {
      nodeId: node.id,
      adhesion: Number(adhesion.toFixed(3)),
      transmittedPull,
      totalStrain,
      incomingContributors,
      outgoingTargets,
    };
  }

  return result;
}

/**
 * Finds the highest-transmission directed path from `sourceId` to `targetId` (up to 6 hops).
 */
export function findBestTransmissionPath(
  sourceId: string,
  targetId: string
): { pathNodeIds: string[]; pathEdgeIds: string[]; pathWeight: number } | null {
  if (sourceId === targetId) {
    return { pathNodeIds: [sourceId], pathEdgeIds: [], pathWeight: 1 };
  }

  interface QueueItem {
    current: string;
    nodes: string[];
    edges: string[];
    weight: number;
  }

  const queue: QueueItem[] = [
    { current: sourceId, nodes: [sourceId], edges: [], weight: 1.0 },
  ];
  let best: { pathNodeIds: string[]; pathEdgeIds: string[]; pathWeight: number } | null = null;

  while (queue.length > 0) {
    const item = queue.shift()!;
    if (item.nodes.length > 7) continue;

    for (const edge of BIOMECHANICAL_EDGES) {
      if (edge.from !== item.current) continue;
      if (item.nodes.includes(edge.to)) continue;

      const nextWeight = item.weight * edge.weight;
      const nextNodes = [...item.nodes, edge.to];
      const nextEdges = [...item.edges, edge.id];

      if (edge.to === targetId) {
        if (!best || nextWeight > best.pathWeight) {
          best = {
            pathNodeIds: nextNodes,
            pathEdgeIds: nextEdges,
            pathWeight: Number(nextWeight.toFixed(4)),
          };
        }
      } else {
        queue.push({
          current: edge.to,
          nodes: nextNodes,
          edges: nextEdges,
          weight: nextWeight,
        });
      }
    }
  }

  return best;
}

function getStageLabelZh(priorityOrder: number): string {
  switch (priorityOrder) {
    case 1:
      return '第 1 阶段 · 远端源头与前胸核心锁扣解锁（必先松解）';
    case 2:
      return '第 2 阶段 · 肘臂旋转中继与侧胸滑轨疏通';
    case 3:
      return '第 3 阶段 · 肩胛上角与颅底/腋后张力释放';
    case 4:
      return '第 4 阶段 · 受拉代偿区温和梳理与主动激活';
    default:
      return '第 5 阶段 · 疼痛感知中心 (CP) 终极伸展再平衡';
  }
}

/**
 * Traces both upstream root-cause CC/CF nodes and downstream victim CP nodes for any clicked node,
 * and generates a counterfactual-validated Stecco release prescription.
 */
export function traceRootCausesAndPrescription(
  targetNodeId: string,
  adhesionMap: Record<string, number>
): RootCauseDiagnosticReport {
  const targetNode = STECCO_NODES_BY_ID[targetNodeId] ?? STECCO_NODES_BY_ID['RE-TH'];
  const baselineField = solveTensegrityField(adhesionMap);
  const targetState = baselineField[targetNode.id];

  const highlightedEdgeSet = new Set<string>();
  const upstreamCandidates: {
    node: SteccoNode;
    pathWeight: number;
    pathNodeIds: string[];
    impactScore: number;
  }[] = [];

  for (const candidate of STECCO_NODES) {
    if (candidate.id === targetNode.id) continue;
    const bestPath = findBestTransmissionPath(candidate.id, targetNode.id);
    if (bestPath && bestPath.pathWeight >= 0.35) {
      const candidateAdhesion = adhesionMap[candidate.id] ?? candidate.defaultSedentaryAdhesion;
      // Primary CC root locks (priority 1-2) have higher clinical leverage than passive CP relays
      const rootBonus =
        candidate.releasePriorityOrder === 1
          ? 1.18
          : candidate.releasePriorityOrder === 2
          ? 1.08
          : 0.95;
      const impactScore = Number(
        (candidateAdhesion * Math.pow(bestPath.pathWeight, 0.38) * rootBonus).toFixed(3)
      );
      if (impactScore >= 0.35) {
        upstreamCandidates.push({
          node: candidate,
          pathWeight: bestPath.pathWeight,
          pathNodeIds: bestPath.pathNodeIds,
          impactScore,
        });
        bestPath.pathEdgeIds.forEach((eid) => highlightedEdgeSet.add(eid));
      }
    }
  }

  // Also trace downstream victims (who gets pulled when targetNode adheres)
  const downstreamVictimIds: string[] = [];
  for (const candidate of STECCO_NODES) {
    if (candidate.id === targetNode.id) continue;
    const downPath = findBestTransmissionPath(targetNode.id, candidate.id);
    if (downPath && downPath.pathWeight >= 0.42) {
      downstreamVictimIds.push(candidate.id);
      downPath.pathEdgeIds.forEach((eid) => highlightedEdgeSet.add(eid));
    }
  }

  // Ensure we select a balanced clinical protocol that always includes priority-1 root locks (if any exist upstream)
  // plus top-impact intermediate hubs!
  upstreamCandidates.sort((a, b) => b.impactScore - a.impactScore);
  const priority1Upstream = upstreamCandidates.filter((c) => c.node.releasePriorityOrder === 1);
  const otherUpstream = upstreamCandidates.filter((c) => c.node.releasePriorityOrder !== 1);

  const selectedUpstreamMap = new Map<string, (typeof upstreamCandidates)[0]>();
  for (const item of priority1Upstream.slice(0, 4)) {
    selectedUpstreamMap.set(item.node.id, item);
  }
  for (const item of otherUpstream) {
    if (selectedUpstreamMap.size >= 8) break;
    selectedUpstreamMap.set(item.node.id, item);
  }
  const topUpstream = Array.from(selectedUpstreamMap.values());

  // Assemble the full release candidate list (selected upstream culprits + targetNode itself)
  // Ordered strictly by Stecco clinical priority: releasePriorityOrder ASC, then impactScore DESC!
  const orderedCandidates = [
    ...topUpstream,
    {
      node: targetNode,
      pathWeight: 1.0,
      pathNodeIds: [targetNode.id],
      impactScore: Number(
        ((adhesionMap[targetNode.id] ?? targetNode.defaultSedentaryAdhesion) * 0.75).toFixed(3)
      ),
    },
  ].sort((a, b) => {
    if (a.node.releasePriorityOrder !== b.node.releasePriorityOrder) {
      return a.node.releasePriorityOrder - b.node.releasePriorityOrder;
    }
    return b.impactScore - a.impactScore;
  });

  // Run counterfactual simulation step-by-step:
  // Releasing a node in the prescription also partially unloads downstream nodes along its transmissionPathIds
  // (modeling how releasing a myofascial sequence restores glide along that sequence).
  const simAdhesion: Record<string, number> = { ...adhesionMap };
  let prevStrain = targetState.totalStrain;
  const prescriptionSteps: ReleasePrescriptionStep[] = [];

  orderedCandidates.forEach((item, idx) => {
    const currentAdh = adhesionMap[item.node.id] ?? item.node.defaultSedentaryAdhesion;
    // Direct release of the prescribed node down to healthy baseline (0.08)
    simAdhesion[item.node.id] = 0.08;
    // Also propagate sequence-glide relief to all upstream/relay nodes on its path
    for (const relayId of item.pathNodeIds) {
      if (relayId !== targetNode.id && simAdhesion[relayId] !== undefined) {
        simAdhesion[relayId] = Math.min(simAdhesion[relayId], simAdhesion[relayId] * 0.45);
      }
    }
    // If we are past 60% of the prescription, also relax remaining secondary upstream contributors of targetNode
    if (idx >= Math.floor(orderedCandidates.length * 0.6)) {
      for (const upCand of upstreamCandidates) {
        simAdhesion[upCand.node.id] = Math.min(simAdhesion[upCand.node.id], 0.14);
      }
    }

    const afterField = solveTensegrityField(simAdhesion);
    const newStrain = afterField[targetNode.id].totalStrain;
    const delta = Number(Math.max(0, prevStrain - newStrain).toFixed(3));
    prevStrain = newStrain;

    const pathLabels = item.pathNodeIds
      .map((id) => `${id}(${STECCO_NODES_BY_ID[id]?.muscleGroupZh.split('、')[0] ?? id})`)
      .join(' → ');

    const whyZh =
      item.node.id === targetNode.id
        ? item.node.roleType === 'CP'
          ? `在前面所有上游致密化锁死点（CC）解除后，最后对受拉疼痛区 ${item.node.code} 进行温和梳理与主动后缩激活，恢复局部透明质酸滑行。`
          : `直接松解当前选中的协调中心 ${item.node.code}，解除局部深筋膜致密化。`
        : `该节点处于【${item.node.steccoSequence}】，当前黏连度高达 ${Math.round(
            currentAdh * 100
          )}%，正通过路径【${pathLabels}】向 ${targetNode.code} 持续传导拉扯力。先松开它才能从源头卸力！`;

    prescriptionSteps.push({
      stepNumber: idx + 1,
      stageLabelZh: getStageLabelZh(item.node.releasePriorityOrder),
      node: item.node,
      currentAdhesion: Number(currentAdh.toFixed(2)),
      pathImpactScore: item.impactScore,
      transmissionPathIds: item.pathNodeIds,
      whyReleaseThisFirstZh: whyZh,
      expectedTargetStrainAfterStep: newStrain,
      strainReductionDelta: delta,
    });
  });

  const finalSimulatedStrain =
    prescriptionSteps.length > 0
      ? prescriptionSteps[prescriptionSteps.length - 1].expectedTargetStrainAfterStep
      : targetState.totalStrain;

  const totalRelativeReliefPercent =
    targetState.totalStrain > 0.01
      ? Math.round(
          ((targetState.totalStrain - finalSimulatedStrain) / targetState.totalStrain) * 100
        )
      : 0;

  return {
    targetNode,
    initialTargetStrain: targetState.totalStrain,
    initialTransmittedPull: targetState.transmittedPull,
    finalSimulatedStrain,
    totalRelativeReliefPercent,
    activeChainIds: targetNode.anatomyTrains,
    highlightedEdgeIds: Array.from(highlightedEdgeSet),
    upstreamCulpritIds: upstreamCandidates.slice(0, 10).map((u) => u.node.id),
    downstreamVictimIds,
    prescriptionSteps,
  };
}
