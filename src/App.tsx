import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Eye,
  Flame,
  Hand,
  HelpCircle,
  Layers,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  SunDim,
  Tablet,
  Wrench,
  X,
} from 'lucide-react';
import { IPadRehabView } from './components/IPadRehabView';
import {
  STECCO_NODES,
  STECCO_NODES_BY_ID,
  AnatomyTrainId,
  SegmentCode,
} from './data/steccoAtlas';
import {
  MYOFASCIAL_CHAINS,
  SEDENTARY_SCENARIOS,
} from './data/myofascialChains';
import { getNodeUX } from './data/nodeUXDigest';
import {
  createDefaultAdhesionMap,
  solveTensegrityField,
  traceRootCausesAndPrescription,
} from './engine/tensegritySolver';
import {
  AnatomyViewport3D,
  CameraPreset,
  FlowSpeedMode,
  LayerVisibilityState,
  LoopFocusFilter,
} from './components/AnatomyViewport3D';

// ============================================================================
// EXTENSIBLE SYMPTOM ENTRY CATALOG (Supports adding new pain regions anytime)
// ============================================================================
export type PainCategoryKey =
  | 'all'
  | 'scapula_adhesion'
  | 'thorax_scapula'
  | 'neck_shoulder'
  | 'arm_wrist'
  | 'lumbar_pelvis';

export interface PainSymptomEntry {
  nodeId: string;
  category: Exclude<PainCategoryKey, 'all'>;
  tagZh: string;
  titleZh: string;
  subtitleZh: string;
  symptomDescZh: string;
  recommendedCamera: CameraPreset;
  recommendedScenarioId: string;
}

export const PAIN_SYMPTOM_CATALOG: PainSymptomEntry[] = [
  // ==========================================================================
  // 1. 肩胛骨全周深层黏连 + 颈侧与耳周「车顶挂钩」
  // ==========================================================================
  {
    nodeId: 'CF-SC',
    category: 'scapula_adhesion',
    tagZh: '下角融合',
    titleZh: '右肩胛下角粘连痛',
    subtitleZh: 'CF-SC · 右下角多肌交汇处',
    symptomDescZh: '肩胛最底端发硬粘连，像被胶水粘在肋骨上',
    recommendedCamera: 'scapula_closeup',
    recommendedScenarioId: 'scapula_periscapular_adhesion_rehab',
  },
  {
    nodeId: 'LA-CP',
    category: 'scapula_adhesion',
    tagZh: '耳周挂钩',
    titleZh: '右耳周围 / 耳后乳突紧绷',
    subtitleZh: 'LA-CP · 吊起右肩胛的顶部挂钩',
    symptomDescZh: '耳后硬骨与耳上颞肌紧绷，会从上方持续吊起右肩胛',
    recommendedCamera: 'posterior_thorax',
    recommendedScenarioId: 'scapula_periscapular_adhesion_rehab',
  },
  {
    nodeId: 'IR-SC2',
    category: 'scapula_adhesion',
    tagZh: '深层黏连',
    titleZh: '肩胛骨底面扣压剧痛',
    subtitleZh: 'IR-SC2 · 肩胛下肌（腋后贴肋面）',
    symptomDescZh: '藏在肩胛骨底面的深层粘连，导致肩胛滑不动',
    recommendedCamera: 'scapula_closeup',
    recommendedScenarioId: 'scapula_periscapular_adhesion_rehab',
  },
  {
    nodeId: 'CF-HU',
    category: 'scapula_adhesion',
    tagZh: '深层黏连',
    titleZh: '肩胛外下缘钉子痛',
    subtitleZh: 'CF-HU · 小圆肌 / 四边孔',
    symptomDescZh: '右手抬起放桌面时，肩后外下侧深处酸胀刺痛',
    recommendedCamera: 'scapula_closeup',
    recommendedScenarioId: 'scapula_periscapular_adhesion_rehab',
  },
  {
    nodeId: 'RE-HU',
    category: 'scapula_adhesion',
    tagZh: '深层黏连',
    titleZh: '肩胛外下缘大圆肌硬结',
    subtitleZh: 'RE-HU · 大圆肌 / 腋后壁',
    symptomDescZh: '外下角厚肉块按压剧痛，抬手或反手摸背受限',
    recommendedCamera: 'scapula_closeup',
    recommendedScenarioId: 'scapula_periscapular_adhesion_rehab',
  },
  {
    nodeId: 'RE-HU2',
    category: 'scapula_adhesion',
    tagZh: '肩胛周边',
    titleZh: '腋后皱襞拉扯肩胛外缘',
    subtitleZh: 'RE-HU2 · 肱三头肌长头近端',
    symptomDescZh: '抬肘悬停时，大臂后侧粗肌腱猛扯肩胛外侧',
    recommendedCamera: 'scapula_closeup',
    recommendedScenarioId: 'scapula_periscapular_adhesion_rehab',
  },
  {
    nodeId: 'ER-HU',
    category: 'scapula_adhesion',
    tagZh: '肩胛周边',
    titleZh: '肩胛背面天宗穴酸胀',
    subtitleZh: 'ER-HU · 冈下肌（冈下窝中央）',
    symptomDescZh: '肩胛背面大片筋膜发紧，将手臂张力传向胸椎',
    recommendedCamera: 'scapula_closeup',
    recommendedScenarioId: 'scapula_periscapular_adhesion_rehab',
  },
  {
    nodeId: 'LA-SC',
    category: 'scapula_adhesion',
    tagZh: '颈侧吊绳',
    titleZh: '右颈外侧深层吊绳',
    subtitleZh: 'LA-SC · 中斜角肌 / 上斜方肌',
    symptomDescZh: '右脖子外侧深层紧绷，向下牵扯肩胛内侧缘',
    recommendedCamera: 'posterior_thorax',
    recommendedScenarioId: 'scapula_periscapular_adhesion_rehab',
  },
  {
    nodeId: 'ER-SC',
    category: 'scapula_adhesion',
    tagZh: '颈侧吊绳',
    titleZh: '肩胛上角硬结（肩胛提肌）',
    subtitleZh: 'ER-SC · 肩胛骨内上角止点',
    symptomDescZh: '右脖子根连着肩胛上角僵硬，把肩胛骨往上提吊',
    recommendedCamera: 'scapula_closeup',
    recommendedScenarioId: 'scapula_periscapular_adhesion_rehab',
  },
  {
    nodeId: 'AN-CL',
    category: 'scapula_adhesion',
    tagZh: '颈侧吊绳',
    titleZh: '右颈前侧胸锁乳突肌',
    subtitleZh: 'AN-CL · 上连耳后乳突，下连锁骨',
    symptomDescZh: '看屏幕探颈时缩短锁死，把右耳与脖子往前拽',
    recommendedCamera: 'anterior_chest',
    recommendedScenarioId: 'scapula_periscapular_adhesion_rehab',
  },
  {
    nodeId: 'LA-SC2',
    category: 'scapula_adhesion',
    tagZh: '肩胛上缘',
    titleZh: '肩胛冈上方深槽隐痛',
    subtitleZh: 'LA-SC2 · 冈上肌（冈上窝）',
    symptomDescZh: '抬手容易耸肩代偿，肩顶部深层酸胀卡顿',
    recommendedCamera: 'scapula_closeup',
    recommendedScenarioId: 'scapula_periscapular_adhesion_rehab',
  },

  // ==========================================================================
  // 2. 下斜方肌尾端 (T12) + 枕骨头尾 + 胸椎纵链
  // ==========================================================================
  {
    nodeId: 'CF-TH',
    category: 'thorax_scapula',
    tagZh: 'T12尾端',
    titleZh: '斜方肌末尾 (T12) 巨型结节',
    subtitleZh: 'CF-TH · 下斜方肌 T12 棘突附着点',
    symptomDescZh: '斜方肌最底端止于第12胸椎，松开可释放胸椎弓弦张力',
    recommendedCamera: 'posterior_thorax',
    recommendedScenarioId: 'thoracic_scapular_arm_loop',
  },
  {
    nodeId: 'RE-CP',
    category: 'thorax_scapula',
    tagZh: '颅底锚点',
    titleZh: '头部尾部（枕骨下缘）',
    subtitleZh: 'RE-CP · 枕下肌群（斜方肌顶端锚点）',
    symptomDescZh: '与 T12 尾端一上一下拉紧整条脊柱，连带颈椎痛',
    recommendedCamera: 'posterior_thorax',
    recommendedScenarioId: 'thoracic_scapular_arm_loop',
  },
  {
    nodeId: 'RE-TH',
    category: 'thorax_scapula',
    tagZh: '中段胸椎',
    titleZh: '胸椎中段竖脊肌拉扯痛',
    subtitleZh: 'RE-TH · 胸段竖脊肌拉扯感知区',
    symptomDescZh: '久坐全背扯痛感知区，由上下游筋膜拉力汇聚所致',
    recommendedCamera: 'arm_thorax_loop',
    recommendedScenarioId: 'thoracic_scapular_arm_loop',
  },
  {
    nodeId: 'RE-SC',
    category: 'thorax_scapula',
    tagZh: '受害痛点',
    titleZh: '右肩胛内侧缘菱形肌痛',
    subtitleZh: 'RE-SC · 被长期拉长的膏肓痛区',
    symptomDescZh: '肩胛被吊起后，内侧筋膜被拉长产生缺血单点痛',
    recommendedCamera: 'posterior_thorax',
    recommendedScenarioId: 'thoracic_scapular_arm_loop',
  },
  {
    nodeId: 'ER-TH',
    category: 'thorax_scapula',
    tagZh: '深层肋角',
    titleZh: '深吸气后背肋角刺痛',
    subtitleZh: 'ER-TH · 菱形肌深面上后锯肌',
    symptomDescZh: '藏在肩胛内侧深面，深呼吸或转体时隐隐刺痛',
    recommendedCamera: 'posterior_thorax',
    recommendedScenarioId: 'thoracic_scapular_arm_loop',
  },

  // ==========================================================================
  // 3. 手臂前侧 ➔ 肩胸 ➔ 后侧双向闭环线
  // ==========================================================================
  {
    nodeId: 'AN-SC',
    category: 'arm_wrist',
    tagZh: '前侧核心',
    titleZh: '前胸胸小肌（前侧锁扣）',
    subtitleZh: 'AN-SC · 勾住肩胛往前下方拽',
    symptomDescZh: '右手放桌面时把肩胛向前拉死，导致后背被扯痛',
    recommendedCamera: 'anterior_chest',
    recommendedScenarioId: 'thoracic_scapular_arm_loop',
  },
  {
    nodeId: 'AN-CA',
    category: 'arm_wrist',
    tagZh: '前侧起点',
    titleZh: '小臂内侧腕屈肌群',
    subtitleZh: 'AN-CA · 握鼠标打字前侧起点',
    symptomDescZh: '抓握鼠标发力由此上传至肱二头肌与胸小肌',
    recommendedCamera: 'right_arm_closeup',
    recommendedScenarioId: 'thoracic_scapular_arm_loop',
  },
  {
    nodeId: 'IR-CU',
    category: 'arm_wrist',
    tagZh: '旋前锁扣',
    titleZh: '肘内侧旋前圆肌',
    subtitleZh: 'IR-CU · 手心向下放桌面必锁死',
    symptomDescZh: '操作键鼠时手掌内旋缩短，迫使右肩向前扣',
    recommendedCamera: 'right_arm_closeup',
    recommendedScenarioId: 'thoracic_scapular_arm_loop',
  },
  {
    nodeId: 'RE-CA',
    category: 'arm_wrist',
    tagZh: '后侧闭环',
    titleZh: '小臂背侧指伸肌群',
    subtitleZh: 'RE-CA · 悬腕打字回传肩胛',
    symptomDescZh: '手指悬空敲键发紧，张力沿手背传回冈下肌',
    recommendedCamera: 'right_arm_closeup',
    recommendedScenarioId: 'thoracic_scapular_arm_loop',
  },
  {
    nodeId: 'LA-CU',
    category: 'arm_wrist',
    tagZh: '外侧支点',
    titleZh: '手肘外侧肱桡肌',
    subtitleZh: 'LA-CU · 抬手放桌面受力支点',
    symptomDescZh: '悬肘放桌面时手肘外侧发紧，向上连至斜角肌',
    recommendedCamera: 'right_arm_closeup',
    recommendedScenarioId: 'thoracic_scapular_arm_loop',
  },

  // ==========================================================================
  // 4. 颈后过渡与腰背底座区
  // ==========================================================================
  {
    nodeId: 'RE-CL',
    category: 'neck_shoulder',
    tagZh: '头颈桥梁',
    titleZh: '颈后头夹肌僵硬',
    subtitleZh: 'RE-CL · 连接耳后乳突与上胸椎',
    symptomDescZh: '低头盯屏时从脖子后方一直往下扯动上胸椎',
    recommendedCamera: 'posterior_thorax',
    recommendedScenarioId: 'neck_scalene_radial_chain',
  },
  {
    nodeId: 'AN-CX',
    category: 'lumbar_pelvis',
    tagZh: '屈髋底座',
    titleZh: '屈髋髂腰肌（T12-L2 减压）',
    subtitleZh: 'AN-CX · 连接腰胸椎前侧与骨盆髋窝',
    symptomDescZh: '久坐屈髋缩短会从前方拽紧腰胸椎，必须保持松软',
    recommendedCamera: 'pelvis_lumbar',
    recommendedScenarioId: 'sedentary_pelvis_lumbar_thoracic',
  },
  {
    nodeId: 'RE-LU',
    category: 'lumbar_pelvis',
    tagZh: '腰背底座',
    titleZh: '上腰段竖脊肌保护区',
    subtitleZh: 'RE-LU · 腰段竖脊肌与胸腰筋膜',
    symptomDescZh: '维持下背筋膜弹性与核心稳定，减少腰背僵痛',
    recommendedCamera: 'pelvis_lumbar',
    recommendedScenarioId: 'sedentary_pelvis_lumbar_thoracic',
  },
];

export default function App() {
  // Default focus: Scapula & Periauricular Rehab
  const [activeScenarioId, setActiveScenarioId] = useState<string>(
    'scapula_periscapular_adhesion_rehab'
  );

  // Adhesion map (0..1) per SteccoNode
  const [adhesionMap, setAdhesionMap] = useState<Record<string, number>>(() => {
    const base = createDefaultAdhesionMap();
    const defaultSc =
      SEDENTARY_SCENARIOS.find(
        (s) => s.id === 'scapula_periscapular_adhesion_rehab'
      ) ?? SEDENTARY_SCENARIOS[0];
    return { ...base, ...defaultSc.adhesionOverrides };
  });

  // Track which nodes the user has marked as "Released (已松解)"
  const [releasedNodeIds, setReleasedNodeIds] = useState<Set<string>>(
    new Set()
  );

  // Selected target node in 3D (defaults to CF-SC: Right Scapula Deep Adhesion)
  const [selectedNodeId, setSelectedNodeId] = useState<string>('CF-SC');
  const [lastClickedMeshName, setLastClickedMeshName] = useState<string | null>(
    null
  );

  // Active prescription step index (defaults to 0 so Step 1 is expanded in accordion)
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(0);

  // Visual Loop Focus Filter & Flow Speed Mode
  const [loopFocusFilter, setLoopFocusFilter] =
    useState<LoopFocusFilter>('full_loop');
  const [flowSpeedMode, setFlowSpeedMode] = useState<FlowSpeedMode>('slow');

  // Left panel category filter & advanced dictionary toggle
  const [painCategoryFilter, setPainCategoryFilter] =
    useState<PainCategoryKey>('scapula_adhesion');
  const [showAdvancedNodeDict, setShowAdvancedNodeDict] =
    useState<boolean>(false);
  const [selectedChainFilter, setSelectedChainFilter] = useState<
    AnatomyTrainId | 'ALL'
  >('ALL');
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState<
    SegmentCode | 'ALL'
  >('ALL');

  // Right panel active tab
  const [rightTab, setRightTab] = useState<
    'prescription' | 'network' | 'theory'
  >('prescription');

  // Usage Guide Modal toggle
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Dual-Mode View: 'ipad' (default) vs 'desktop'
  const [viewMode, setViewMode] = useState<'desktop' | 'ipad'>(() => {
    if (typeof window === 'undefined') return 'desktop';
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'ipad') return 'ipad';
    if (params.get('mode') === 'desktop') return 'desktop';
    return 'ipad';
  });

  // 3D Layer visibility & Spotlight Dimming state
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibilityState>({
    skin: true,
    superficial_muscle: true,
    deep_muscle: true,
    fascia_connective: true,
    skeleton: true,
    xraySuperficial: true,
    spotlightDimming: true,
    showAllLabels: false,
  });

  const [cameraPreset, setCameraPreset] =
    useState<CameraPreset>('scapula_closeup');
  const [cameraTrigger, setCameraTrigger] = useState<number>(0);

  // Solve live biomechanical tension field & root-cause diagnostic report
  const fieldState = useMemo(
    () => solveTensegrityField(adhesionMap),
    [adhesionMap]
  );
  const diagnosticReport = useMemo(
    () => traceRootCausesAndPrescription(selectedNodeId, adhesionMap),
    [selectedNodeId, adhesionMap]
  );

  const activeScenario = useMemo(
    () =>
      SEDENTARY_SCENARIOS.find((s) => s.id === activeScenarioId) ??
      SEDENTARY_SCENARIOS[0],
    [activeScenarioId]
  );

  const selectedNode =
    STECCO_NODES_BY_ID[selectedNodeId] ?? STECCO_NODES_BY_ID['RE-TH'];
  const selectedNodeUX = getNodeUX(selectedNode);
  const selectedNodeState = fieldState[selectedNode.id];

  // Handlers
  const handleSelectScenario = (scenarioId: string) => {
    const sc = SEDENTARY_SCENARIOS.find((s) => s.id === scenarioId);
    if (!sc) return;
    setActiveScenarioId(scenarioId);
    setAdhesionMap({
      ...createDefaultAdhesionMap(),
      ...sc.adhesionOverrides,
    });
    setReleasedNodeIds(new Set());
    setActiveStepIndex(0);
    setLoopFocusFilter('full_loop');
    if (sc.primaryPainCpIds.length > 0) {
      setSelectedNodeId(sc.primaryPainCpIds[0]);
    }
    if (scenarioId === 'scapula_periscapular_adhesion_rehab') {
      setPainCategoryFilter('scapula_adhesion');
      setCameraPreset('scapula_closeup');
      setCameraTrigger((t) => t + 1);
      setLayerVisibility((prev) => ({ ...prev, xraySuperficial: true }));
    }
  };

  const handleSelectSymptomCard = (entry: PainSymptomEntry) => {
    if (entry.recommendedScenarioId !== activeScenarioId) {
      const sc = SEDENTARY_SCENARIOS.find(
        (s) => s.id === entry.recommendedScenarioId
      );
      if (sc) {
        setActiveScenarioId(sc.id);
        setAdhesionMap({
          ...createDefaultAdhesionMap(),
          ...sc.adhesionOverrides,
        });
        setReleasedNodeIds(new Set());
      }
    }
    setSelectedNodeId(entry.nodeId);
    setActiveStepIndex(0);
    setLoopFocusFilter('full_loop');
    setCameraPreset(entry.recommendedCamera);
    setCameraTrigger((t) => t + 1);
    if (entry.recommendedCamera === 'scapula_closeup') {
      setLayerVisibility((prev) => ({ ...prev, xraySuperficial: true }));
    }
    setRightTab('prescription');
  };

  const handleSelectNode = (nodeId: string, clickedMuscleName?: string) => {
    setSelectedNodeId(nodeId);
    const stepIdx = diagnosticReport.prescriptionSteps.findIndex(
      (s) => s.node.id === nodeId
    );
    setActiveStepIndex(stepIdx >= 0 ? stepIdx : 0);
    setLastClickedMeshName(clickedMuscleName ?? null);

    const node = STECCO_NODES_BY_ID[nodeId];
    if (node && node.layer === 'deep_muscle') {
      setLayerVisibility((prev) => ({ ...prev, xraySuperficial: true }));
    }
  };

  const handleSelectStepIndex = (idx: number | null) => {
    setActiveStepIndex(idx);
    if (idx !== null) {
      const stepNode = diagnosticReport.prescriptionSteps[idx]?.node;
      if (stepNode && stepNode.layer === 'deep_muscle') {
        setLayerVisibility((prev) => ({ ...prev, xraySuperficial: true }));
      }
    }
  };

  const handleToggleReleaseNode = (nodeId: string) => {
    const isCurrentlyReleased = releasedNodeIds.has(nodeId);
    const nextReleased = new Set(releasedNodeIds);
    if (isCurrentlyReleased) {
      nextReleased.delete(nodeId);
      const defaultVal =
        activeScenario.adhesionOverrides[nodeId] ??
        STECCO_NODES_BY_ID[nodeId]?.defaultSedentaryAdhesion ??
        0.75;
      setAdhesionMap((prev) => ({ ...prev, [nodeId]: defaultVal }));
    } else {
      nextReleased.add(nodeId);
      setAdhesionMap((prev) => ({ ...prev, [nodeId]: 0.08 }));
    }
    setReleasedNodeIds(nextReleased);
  };

  const handleSimulateNaiveBackRub = () => {
    const base = {
      ...createDefaultAdhesionMap(),
      ...activeScenario.adhesionOverrides,
      'RE-TH': 0.1,
      'RE-SC': 0.1,
    };
    setAdhesionMap(base);
    setReleasedNodeIds(new Set(['RE-TH', 'RE-SC']));
    setSelectedNodeId('RE-TH');
    setRightTab('network');
  };

  const handleSimulateFullUpstreamRelease = () => {
    const nextMap = { ...adhesionMap };
    const nextReleased = new Set<string>();
    for (const step of diagnosticReport.prescriptionSteps) {
      nextMap[step.node.id] = 0.08;
      nextReleased.add(step.node.id);
      for (const relayId of step.transmissionPathIds) {
        nextMap[relayId] = Math.min(nextMap[relayId] ?? 0.5, 0.12);
        nextReleased.add(relayId);
      }
    }
    setAdhesionMap(nextMap);
    setReleasedNodeIds(nextReleased);
  };

  const handleCycleFlowSpeed = () => {
    setFlowSpeedMode((prev) =>
      prev === 'slow' ? 'normal' : prev === 'normal' ? 'paused' : 'slow'
    );
  };

  const filteredSymptoms = useMemo(() => {
    if (painCategoryFilter === 'all') return PAIN_SYMPTOM_CATALOG;
    return PAIN_SYMPTOM_CATALOG.filter(
      (item) => item.category === painCategoryFilter
    );
  }, [painCategoryFilter]);

  const filteredLeftNodes = useMemo(() => {
    return STECCO_NODES.filter((n) => {
      if (
        selectedChainFilter !== 'ALL' &&
        !n.anatomyTrains.includes(selectedChainFilter)
      ) {
        return false;
      }
      if (
        selectedSegmentFilter !== 'ALL' &&
        n.segment !== selectedSegmentFilter
      ) {
        return false;
      }
      return true;
    });
  }, [selectedChainFilter, selectedSegmentFilter]);

  const totalSteps = diagnosticReport.prescriptionSteps.length;
  const currentStepIdx =
    activeStepIndex !== null && activeStepIndex < totalSteps
      ? activeStepIndex
      : 0;

  if (viewMode === 'ipad') {
    return (
      <IPadRehabView
        selectedNodeId={selectedNodeId}
        activeStepIndex={activeStepIndex}
        loopFocusFilter={loopFocusFilter}
        flowSpeedMode={flowSpeedMode}
        fieldState={fieldState}
        diagnosticReport={diagnosticReport}
        layerVisibility={layerVisibility}
        cameraPreset={cameraPreset}
        cameraTrigger={cameraTrigger}
        releasedNodeIds={releasedNodeIds}
        onSelectNode={handleSelectNode}
        onSelectStepIndex={handleSelectStepIndex}
        onSelectSymptomCard={handleSelectSymptomCard}
        onToggleReleaseNode={handleToggleReleaseNode}
        onSetLoopFocusFilter={setLoopFocusFilter}
        onCycleFlowSpeed={handleCycleFlowSpeed}
        onSetLayerVisibility={setLayerVisibility}
        onSetCameraPreset={setCameraPreset}
        onTriggerCamera={() => setCameraTrigger((t) => t + 1)}
        onSimulateFullRelease={handleSimulateFullUpstreamRelease}
        onSimulateNaiveBackRub={handleSimulateNaiveBackRub}
        onResetScenario={() => handleSelectScenario(activeScenarioId)}
        onSwitchToDesktop={() => setViewMode('desktop')}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* =====================================================================
          TOP HEADER & GLOBAL CONTROLS
         ===================================================================== */}
      <header className="z-30 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/90 bg-slate-900/95 px-4 py-2 backdrop-blur-md">
        {/* Brand + 2-Mode Core Workspace Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow">
              <Activity className="h-4 w-4 text-slate-950 stroke-[2.5]" />
            </div>
            <h1 className="text-sm font-black tracking-tight text-white">
              Stecco 3D 筋膜黏连溯源与康复导航台
            </h1>
          </div>

        </div>

        {/* Compact Scenario Switcher */}
        <div className="hidden 2xl:flex items-center gap-1">
          {SEDENTARY_SCENARIOS.map((sc) => {
            const active = sc.id === activeScenarioId;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleSelectScenario(sc.id)}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition-all border ${
                  active
                    ? 'bg-amber-500/20 text-amber-200 border-amber-400/80'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white'
                }`}
              >
                <Flame
                  className={`h-3 w-3 ${
                    active ? 'text-amber-400' : 'text-slate-500'
                  }`}
                />
                <span>{sc.badgeZh}</span>
              </button>
            );
          })}
        </div>

        {/* Streamlined Viewport & Mode Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              setLayerVisibility((v) => ({
                ...v,
                xraySuperficial: !v.xraySuperficial,
              }))
            }
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold border transition-all ${
              layerVisibility.xraySuperficial
                ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/60'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>透视</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setLayerVisibility((v) => ({
                ...v,
                spotlightDimming: !v.spotlightDimming,
              }))
            }
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold border transition-all ${
              layerVisibility.spotlightDimming
                ? 'bg-amber-500/20 text-amber-200 border-amber-400/70'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <SunDim className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">聚焦</span>
          </button>

          <button
            type="button"
            onClick={handleCycleFlowSpeed}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold border transition-all ${
              flowSpeedMode === 'paused'
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-cyan-500/15 text-cyan-200 border-cyan-500/40'
            }`}
          >
            {flowSpeedMode === 'paused' ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5 text-cyan-400" />
            )}
            <span>
              {flowSpeedMode === 'slow'
                ? '慢流'
                : flowSpeedMode === 'normal'
                ? '快流'
                : '暂停'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('ipad')}
            className="hidden md:flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-bold text-slate-300 hover:text-white"
            title="切换 iPad 跟练大按钮版"
          >
            <Tablet className="h-3.5 w-3.5 text-cyan-300" />
            <span>iPad版</span>
          </button>

          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-bold text-slate-300 hover:text-white"
            title="查看使用指南"
          >
            <HelpCircle className="h-3.5 w-3.5 text-cyan-300" />
          </button>

          <button
            type="button"
            onClick={() => handleSelectScenario(activeScenarioId)}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:text-white"
            title="重置打卡状态"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* =====================================================================
          MAIN 3-COLUMN WORKSPACE (UNIFIED STEP 1 ➔ STEP 2 ➔ STEP 3 FLOW)
         ===================================================================== */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* -------------------------------------------------------------------
            LEFT SIDEBAR (STEP 1): EXTENSIBLE SYMPTOM PICKER & NODE DIRECTORY
           ------------------------------------------------------------------- */}
        <aside className="hidden lg:flex lg:w-[320px] xl:w-[340px] shrink-0 flex-col border-r border-white/15 bg-[#0D1322]/95 backdrop-blur-md">
          {/* UNIFIED STEP 1 BANNER */}
          <div className="border-b border-white/15 bg-gradient-to-r from-sky-950/70 via-[#0D1322] to-[#0D1322] p-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex shrink-0 items-center rounded-md bg-sky-600 px-2 py-0.5 font-mono text-[10px] font-black text-white">
                  STEP 1
                </span>
                <span className="text-xs font-extrabold text-white">
                  选择康复靶点 / 痛点
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleSelectScenario('scapula_periscapular_adhesion_rehab')}
                className="rounded-md bg-sky-500/20 border border-sky-400/50 px-2 py-0.5 text-[10px] font-bold text-sky-200 hover:bg-sky-500/35"
              >
                肩胛特写
              </button>
            </div>

            {/* Clean 4-Tab Rehab Category Switcher */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px]">
              {(
                [
                  ['scapula_adhesion', '肩胛·耳周'],
                  ['thorax_scapula', '斜方·胸椎'],
                  ['arm_wrist', '手臂闭环'],
                  ['lumbar_pelvis', '屈髋底座'],
                  ['all', `全部(${PAIN_SYMPTOM_CATALOG.length})`],
                ] as const
              ).map(([catKey, label]) => (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setPainCategoryFilter(catKey)}
                  className={`shrink-0 rounded-lg px-2 py-1 font-bold transition-all border ${
                    painCategoryFilter === catKey
                      ? 'bg-sky-600 border-sky-300 text-white shadow'
                      : 'bg-[#161F30] border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Symptom Cards + Collapsible 35-Node Atlas */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {/* Scannable Symptom Cards */}
            <div className="space-y-1.5">
              {filteredSymptoms.map((item) => {
                const isSel = selectedNodeId === item.nodeId;
                const st = fieldState[item.nodeId];
                const strainPct = Math.round((st?.totalStrain ?? 0.8) * 100);

                return (
                  <button
                    key={item.nodeId}
                    type="button"
                    onClick={() => handleSelectSymptomCard(item)}
                    className={`w-full flex flex-col items-start rounded-xl px-3 py-2 text-left transition-all border ${
                      isSel
                        ? 'bg-sky-600/25 border-2 border-cyan-300 text-white shadow-lg'
                        : 'bg-[#12192B] border-white/10 text-white hover:border-cyan-400/60 hover:bg-[#161F30]'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            isSel ? 'bg-cyan-300 animate-ping' : 'bg-rose-500'
                          }`}
                        />
                        <span className="text-xs font-extrabold text-white truncate">
                          {item.titleZh}
                        </span>
                      </div>
                      <span className="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-bold text-rose-300 border border-rose-500/30">
                        {strainPct}%
                      </span>
                    </div>
                    <div className="mt-1 flex w-full items-center justify-between gap-2 text-[10px]">
                      <span className="font-mono font-bold text-cyan-300 truncate">
                        {item.subtitleZh}
                      </span>
                      <span className="shrink-0 rounded bg-sky-500/15 px-1.5 py-0.5 font-bold text-sky-300">
                        {item.tagZh}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-300 truncate w-full">
                      {item.symptomDescZh}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Collapsible Advanced 35-Node Stecco Atlas */}
            <div className="pt-2 border-t border-slate-800/90">
              <button
                type="button"
                onClick={() => setShowAdvancedNodeDict((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs font-bold text-slate-300 hover:border-slate-700 hover:text-white"
              >
                <span>
                  📚 进阶：全身 {STECCO_NODES.length} 个筋膜节点理论库
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    showAdvancedNodeDict ? 'rotate-180 text-cyan-400' : ''
                  }`}
                />
              </button>

              {showAdvancedNodeDict && (
                <div className="mt-2 space-y-2">
                  {/* Chain Filter */}
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedChainFilter('ALL')}
                      className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                        selectedChainFilter === 'ALL'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      全部 ({STECCO_NODES.length})
                    </button>
                    {MYOFASCIAL_CHAINS.map((chain) => {
                      const active = selectedChainFilter === chain.id;
                      return (
                        <button
                          key={chain.id}
                          type="button"
                          onClick={() =>
                            setSelectedChainFilter(active ? 'ALL' : chain.id)
                          }
                          className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border ${
                            active
                              ? 'bg-slate-800 border-white text-white'
                              : 'bg-slate-800/50 border-slate-700/60 text-slate-300'
                          }`}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: chain.color }}
                          />
                          <span>{chain.nameZh.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Segment Filter */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
                    {(
                      [
                        ['ALL', '全节段'],
                        ['DI', '手掌'],
                        ['CA', '手腕'],
                        ['CU', '前臂'],
                        ['HU', '大臂'],
                        ['SC', '肩胛'],
                        ['TH', '胸椎'],
                        ['CL', '颈部'],
                        ['CX', '骨盆'],
                      ] as const
                    ).map(([segCode, label]) => (
                      <button
                        key={segCode}
                        type="button"
                        onClick={() => setSelectedSegmentFilter(segCode as any)}
                        className={`shrink-0 rounded px-1.5 py-0.5 font-medium ${
                          selectedSegmentFilter === segCode
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Read-only theoretical nodes */}
                  <div className="space-y-1.5">
                    {filteredLeftNodes.map((node) => {
                      const ux = getNodeUX(node);
                      const isSelected = node.id === selectedNodeId;
                      const isReleased = releasedNodeIds.has(node.id);
                      const adhVal =
                        adhesionMap[node.id] ?? node.defaultSedentaryAdhesion;

                      return (
                        <div
                          key={node.id}
                          onClick={() => handleSelectNode(node.id)}
                          className={`cursor-pointer rounded-xl border p-2 transition-all ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-950/35'
                              : 'border-slate-800/90 bg-slate-900/60 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                                  node.roleType === 'CP'
                                    ? 'bg-rose-500/25 text-rose-300'
                                    : ux.loopGroup === 'outgoing_front'
                                    ? 'bg-amber-500/25 text-amber-300'
                                    : 'bg-cyan-500/25 text-cyan-300'
                                }`}
                              >
                                {node.code}
                              </span>
                              <span className="truncate text-xs font-bold text-slate-100">
                                {ux.shortTitleZh.split(' (')[0]}
                              </span>
                            </div>
                            <span className="shrink-0 text-[10px] text-slate-400">
                              {isReleased
                                ? '✓ 已松'
                                : ux.loopGroup === 'outgoing_front'
                                ? '🟠 去程'
                                : ux.loopGroup === 'returning_back'
                                ? '🔵 回程'
                                : '🔴 痛点'}
                            </span>
                          </div>

                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {node.roleType === 'CP' ? '理论受拉:' : '理论黏连:'}
                            </span>
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                              <div
                                className={`h-full rounded-full ${
                                  isReleased
                                    ? 'bg-emerald-400'
                                    : node.roleType === 'CP'
                                    ? 'bg-rose-500'
                                    : ux.loopGroup === 'outgoing_front'
                                    ? 'bg-amber-400'
                                    : 'bg-cyan-400'
                                }`}
                                style={{
                                  width: `${Math.round(
                                    (node.roleType === 'CP'
                                      ? fieldState[node.id]?.totalStrain ?? adhVal
                                      : adhVal) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="w-8 text-right font-mono text-[10px] font-bold text-amber-300">
                              {Math.round(
                                (node.roleType === 'CP'
                                  ? fieldState[node.id]?.totalStrain ?? adhVal
                                  : adhVal) * 100
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* -------------------------------------------------------------------
            CENTER (STEP 2): 3D VIEWPORT WITH UNIFIED STEP 2 BANNER
           ------------------------------------------------------------------- */}
        <main className="relative flex-1 min-w-0 h-full">
          {/* Top Overlay Toolbar inside 3D Viewport */}
          <div className="pointer-events-none absolute top-3 left-3 right-3 z-30 flex flex-col gap-2">
            {/* UNIFIED STEP 2 BANNER + LOOP ISOLATION SWITCHER */}
            <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/15 bg-[#0D1322]/90 px-3 py-1.5 shadow-xl backdrop-blur-md">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex shrink-0 items-center rounded-md bg-sky-600 px-2 py-0.5 font-mono text-[10px] font-black text-white">
                  STEP 2
                </span>
                <span className="text-xs font-bold text-slate-200 mr-1">
                  3D 牵扯链：
                </span>

                <button
                  type="button"
                  onClick={() => setLoopFocusFilter('full_loop')}
                  className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold transition-all border ${
                    loopFocusFilter === 'full_loop'
                      ? 'bg-sky-600 border-sky-300 text-white'
                      : 'bg-[#161F30] border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-cyan-300" />
                  <span>完整闭环</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLoopFocusFilter('outgoing_front')}
                  className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold transition-all border ${
                    loopFocusFilter === 'outgoing_front'
                      ? 'bg-sky-600 border-sky-300 text-white'
                      : 'bg-[#161F30] border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>前侧拉拽链</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLoopFocusFilter('returning_back')}
                  className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold transition-all border ${
                    loopFocusFilter === 'returning_back'
                      ? 'bg-sky-600 border-sky-300 text-white'
                      : 'bg-[#161F30] border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  <span>后侧回传链</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (activeStepIndex === null) setActiveStepIndex(0);
                    setLoopFocusFilter('single_step');
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold transition-all border ${
                    loopFocusFilter === 'single_step'
                      ? 'bg-sky-600 border-sky-300 text-white'
                      : 'bg-[#161F30] border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>仅当前步</span>
                </button>
              </div>
            </div>

            {/* Row 2: Camera View Presets & Counterfactual Proof Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="pointer-events-auto flex flex-wrap items-center gap-1 rounded-xl border border-white/15 bg-[#0D1322]/90 p-1 shadow-xl backdrop-blur-md">
                <span className="px-1.5 text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <Compass className="h-3.5 w-3.5 text-cyan-400" />
                  视角:
                </span>
                {(
                  [
                    ['scapula_closeup', '肩胛特写'],
                    ['arm_thorax_loop', '手-肩-背'],
                    ['posterior_thorax', '后背胸椎'],
                    ['anterior_chest', '前胸'],
                    ['right_arm_closeup', '右手臂'],
                    ['pelvis_lumbar', '腰胯'],
                    ['full_body', '全身'],
                  ] as const
                ).map(([presetId, label]) => (
                  <button
                    key={presetId}
                    type="button"
                    onClick={() => {
                      setCameraPreset(presetId);
                      setCameraTrigger((t) => t + 1);
                      if (presetId === 'scapula_closeup') {
                        setLayerVisibility((prev) => ({
                          ...prev,
                          xraySuperficial: true,
                        }));
                      }
                    }}
                    className={`rounded-lg px-2 py-0.5 text-[11px] font-bold transition-all border ${
                      cameraPreset === presetId
                        ? 'bg-sky-600 border-sky-300 text-white'
                        : 'border-transparent text-slate-300 hover:bg-[#161F30] hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="pointer-events-auto flex items-center gap-1.5 rounded-xl border border-white/15 bg-[#0D1322]/90 p-1 shadow-xl backdrop-blur-md">
                <button
                  type="button"
                  onClick={handleSimulateFullUpstreamRelease}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600/30 border border-emerald-400/60 px-2 py-0.5 text-[11px] font-bold text-emerald-200 hover:bg-emerald-600/45 transition-all"
                >
                  <Sparkles className="h-3 w-3 text-emerald-300" />
                  <span>模拟全松</span>
                </button>
                <button
                  type="button"
                  onClick={handleSimulateNaiveBackRub}
                  className="flex items-center gap-1 rounded-lg bg-rose-600/30 border border-rose-400/60 px-2 py-0.5 text-[11px] font-bold text-rose-200 hover:bg-rose-600/45 transition-all"
                >
                  <HelpCircle className="h-3 w-3 text-rose-300" />
                  <span>只揉痛点对比</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3D Viewport Component */}
          <AnatomyViewport3D
            selectedNodeId={selectedNodeId}
            activeStepIndex={activeStepIndex}
            loopFocusFilter={loopFocusFilter}
            flowSpeedMode={flowSpeedMode}
            fieldState={fieldState}
            diagnosticReport={diagnosticReport}
            layerVisibility={layerVisibility}
            cameraPreset={cameraPreset}
            cameraTrigger={cameraTrigger}
            onSelectNode={handleSelectNode}
            onSelectStepIndex={handleSelectStepIndex}
          />
        </main>

        {/* -------------------------------------------------------------------
            RIGHT SIDEBAR (STEP 3): GUIDED STEP-BY-STEP RELEASE PRESCRIPTION
           ------------------------------------------------------------------- */}
        <aside className="flex w-full lg:w-[320px] xl:w-[340px] shrink-0 flex-col border-l border-white/15 bg-[#0D1322]/95 backdrop-blur-md">
          {/* UNIFIED STEP 3 BANNER */}
          <div className="border-b border-white/15 bg-gradient-to-r from-sky-950/70 via-[#0D1322] to-[#0D1322] px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex shrink-0 items-center rounded-md bg-sky-600 px-2 py-0.5 font-mono text-[10px] font-black text-white">
                  STEP 3
                </span>
                <span className="text-xs font-extrabold text-white">
                  按序松解与打卡
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                先松源头 ➔ 后揉痛点
              </span>
            </div>
          </div>

          {/* Selected Target Summary Header */}
          <div className="border-b border-slate-800 bg-slate-950/70 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-extrabold ${
                      selectedNode.roleType === 'CP'
                        ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50'
                        : selectedNodeUX.loopGroup === 'outgoing_front'
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50'
                        : 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50'
                    }`}
                  >
                    {selectedNode.code}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 truncate">
                    {selectedNodeUX.loopGroupLabelZh}
                  </span>
                </div>
                <h2 className="mt-1 text-sm font-black text-white truncate">
                  {selectedNodeUX.shortTitleZh.split(' (')[0]}
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-300 line-clamp-1">
                  {selectedNodeUX.oneLineSummaryZh}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleToggleReleaseNode(selectedNode.id)}
                className={`shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all ${
                  releasedNodeIds.has(selectedNode.id)
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow'
                    : 'bg-slate-800 text-slate-200 border-slate-600 hover:border-cyan-400'
                }`}
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>
                  {releasedNodeIds.has(selectedNode.id) ? '已松解' : '打卡'}
                </span>
              </button>
            </div>

            {/* 3 Scannable KPI Gauges */}
            <div className="mt-2 grid grid-cols-3 gap-1.5 rounded-xl border border-slate-800/90 bg-slate-900/90 p-1.5">
              <div className="px-1.5">
                <div className="text-[10px] text-slate-400">致密黏连</div>
                <div className="font-mono text-xs font-extrabold text-amber-400">
                  {Math.round((selectedNodeState?.adhesion ?? 0) * 100)}%
                </div>
              </div>
              <div className="border-x border-slate-800 px-1.5">
                <div className="text-[10px] text-slate-400">被拉扯力</div>
                <div className="font-mono text-xs font-extrabold text-rose-400">
                  {Math.round((selectedNodeState?.transmittedPull ?? 0) * 100)}%
                </div>
              </div>
              <div className="px-1.5">
                <div className="text-[10px] text-slate-400">松解减负</div>
                <div className="font-mono text-xs font-extrabold text-emerald-400">
                  -{diagnosticReport.totalRelativeReliefPercent}%
                </div>
              </div>
            </div>


            {/* Navigation Tabs */}
            <div className="mt-2.5 grid grid-cols-3 gap-1 rounded-lg bg-[#090D18] p-1 border border-white/15">
              <button
                type="button"
                onClick={() => setRightTab('prescription')}
                className={`rounded-md py-1 text-[11px] font-extrabold transition-all border ${
                  rightTab === 'prescription'
                    ? 'bg-sky-600 border-white text-white shadow'
                    : 'border-transparent text-white/80 hover:text-white'
                }`}
              >
                1. 分步松解({totalSteps})
              </button>
              <button
                type="button"
                onClick={() => setRightTab('network')}
                className={`rounded-md py-1 text-[11px] font-extrabold transition-all border ${
                  rightTab === 'network'
                    ? 'bg-sky-600 border-white text-white shadow'
                    : 'border-transparent text-white/80 hover:text-white'
                }`}
              >
                2. 谁在拉扯它
              </button>
              <button
                type="button"
                onClick={() => setRightTab('theory')}
                className={`rounded-md py-1 text-[11px] font-extrabold transition-all border ${
                  rightTab === 'theory'
                    ? 'bg-sky-600 border-white text-white shadow'
                    : 'border-transparent text-white/80 hover:text-white'
                }`}
              >
                3. 触诊详情
              </button>
            </div>
          </div>

          {/* -----------------------------------------------------------------
              RIGHT PANEL BODY (PROGRESSIVE DISCLOSURE & VISUAL CARDS)
             ----------------------------------------------------------------- */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {/* TAB 1: STEP-BY-STEP ACCORDION WIZARD */}
            {rightTab === 'prescription' && (
              <>
                {/* Wizard Stepper Bar: Prev / Next Step */}
                <div className="flex items-center justify-between gap-2 rounded-xl border border-white/20 bg-[#12192B] px-2.5 py-1.5">
                  <div className="text-[11px] truncate">
                    <span className="font-extrabold text-white">
                      正在查看第 {currentStepIdx + 1} 步：
                    </span>
                    <span className="text-cyan-300 font-mono font-extrabold">
                      {
                        diagnosticReport.prescriptionSteps[currentStepIdx]?.node
                          .code
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={currentStepIdx <= 0}
                      onClick={() =>
                        handleSelectStepIndex(Math.max(0, currentStepIdx - 1))
                      }
                      className="flex items-center gap-0.5 rounded-lg border border-white/20 bg-[#161F30] px-2 py-0.5 text-[11px] font-bold text-white hover:bg-[#1E293B] disabled:opacity-40"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>上一步</span>
                    </button>
                    <button
                      type="button"
                      disabled={currentStepIdx >= totalSteps - 1}
                      onClick={() =>
                        handleSelectStepIndex(
                          Math.min(totalSteps - 1, currentStepIdx + 1)
                        )
                      }
                      className="flex items-center gap-0.5 rounded-lg border border-cyan-300 bg-sky-600 px-2 py-0.5 text-[11px] font-extrabold text-white hover:bg-sky-500 disabled:opacity-40"
                    >
                      <span>下一步</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Accordion Step List */}
                {diagnosticReport.prescriptionSteps.map((step, idx) => {
                  const isStepExpanded = activeStepIndex === idx;
                  const isNodeReleased = releasedNodeIds.has(step.node.id);
                  const ux = getNodeUX(step.node);
                  const isOutgoing = ux.loopGroup === 'outgoing_front';
                  const isReturning = ux.loopGroup === 'returning_back';

                  return (
                    <div
                      key={step.node.id}
                      className={`rounded-xl border transition-all ${
                        isStepExpanded
                          ? 'border-amber-400/90 bg-slate-900 shadow-xl ring-1 ring-amber-400/30'
                          : isNodeReleased
                          ? 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-400/50'
                          : 'border-slate-800/90 bg-slate-900/55 hover:border-slate-700'
                      }`}
                    >
                      {/* Compact 1-Line Header (Always Visible) */}
                      <div
                        onClick={() =>
                          handleSelectStepIndex(isStepExpanded ? null : idx)
                        }
                        className="flex cursor-pointer items-center justify-between gap-2 p-2.5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-extrabold ${
                              isNodeReleased
                                ? 'bg-emerald-500 text-slate-950'
                                : isStepExpanded
                                ? 'bg-amber-400 text-slate-950 shadow'
                                : isOutgoing
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                                : isReturning
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-400/50'
                            }`}
                          >
                            {step.stepNumber}
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-extrabold text-cyan-300">
                                {step.node.code}
                              </span>
                              <span className="truncate text-xs font-bold text-white">
                                {ux.shortTitleZh.split(' (')[0]}
                              </span>
                            </div>
                            {!isStepExpanded && (
                              <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-400 truncate">
                                <span
                                  className={
                                    isOutgoing
                                      ? 'text-amber-300/90'
                                      : isReturning
                                      ? 'text-cyan-300/90'
                                      : 'text-rose-300/90'
                                  }
                                >
                                  {ux.loopGroupLabelZh}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleReleaseNode(step.node.id);
                            }}
                            className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border transition-all ${
                              isNodeReleased
                                ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                                : 'bg-slate-800 text-slate-300 border-slate-600 hover:border-emerald-400 hover:text-emerald-300'
                            }`}
                          >
                            {isNodeReleased ? '✓ 已松' : '打卡'}
                          </button>
                          <ChevronDown
                            className={`h-4 w-4 text-slate-400 transition-transform ${
                              isStepExpanded ? 'rotate-180 text-amber-400' : ''
                            }`}
                          />
                        </div>
                      </div>

                      {/* Expanded Bite-Sized Action Card */}
                      {isStepExpanded && (
                        <div className="border-t border-slate-800/90 px-3 pb-3 pt-2.5 space-y-2.5">
                          {/* 1. One-Line Core Takeaway + Visual Path Pills */}
                          <div className="rounded-lg bg-slate-950/90 p-2.5 border border-slate-800">
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  isOutgoing
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : isReturning
                                    ? 'bg-cyan-500/20 text-cyan-300'
                                    : 'bg-rose-500/20 text-rose-300'
                                }`}
                              >
                                {ux.loopGroupLabelZh}
                              </span>
                              {step.strainReductionDelta > 0 && (
                                <span className="font-mono text-[10px] font-bold text-emerald-400">
                                  此步解锁减拉扯 -
                                  {Math.round(step.strainReductionDelta * 100)}%
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-medium text-slate-100 leading-relaxed">
                              {ux.oneLineSummaryZh}
                            </p>

                            {/* Visual Clickable Chain Breadcrumb */}
                            {step.transmissionPathIds.length > 1 && (
                              <div className="mt-2 flex flex-wrap items-center gap-1 pt-1.5 border-t border-slate-800/80 text-[10px]">
                                <span className="text-slate-400 mr-0.5">
                                  传导链:
                                </span>
                                {step.transmissionPathIds.map((pid, pIdx) => {
                                  const pNode = STECCO_NODES_BY_ID[pid];
                                  const isCurr = pid === step.node.id;
                                  const isPain = pid === selectedNode.id;
                                  return (
                                    <React.Fragment key={pid}>
                                      <button
                                        type="button"
                                        onClick={() => handleSelectNode(pid)}
                                        className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold transition-all ${
                                          isCurr
                                            ? 'bg-amber-400 text-slate-950'
                                            : isPain
                                            ? 'bg-rose-500/30 text-rose-200 border border-rose-400/50'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                      >
                                        {pid}{' '}
                                        {pNode?.muscleGroupZh
                                          .split('、')[0]
                                          .split('（')[0]}
                                      </button>
                                      {pIdx <
                                        step.transmissionPathIds.length - 1 && (
                                        <ArrowRight className="h-2.5 w-2.5 text-slate-500" />
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* 2. 3-Step Bite-Sized Palpation Guide */}
                          <div>
                            <div className="mb-1 flex items-center gap-1 text-xs font-bold text-cyan-300">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>3 步快速摸准位置</span>
                            </div>
                            <div className="space-y-1">
                              {ux.palpationSteps.map((pStep, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="rounded-lg bg-slate-950/60 px-2.5 py-1.5 text-[11px] text-slate-200 border border-slate-800/70"
                                >
                                  {pStep}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 3. Structured Release Spec */}
                          <div>
                            <div className="mb-1 flex items-center gap-1 text-xs font-bold text-amber-300">
                              <Hand className="h-3.5 w-3.5" />
                              <span>怎么按最有效</span>
                            </div>
                            <div className="space-y-1.5 text-[11px]">
                              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1.5">
                                <span className="flex items-center gap-1 text-slate-400">
                                  <Wrench className="h-3 w-3 text-amber-400" />
                                  工具:
                                  <strong className="text-slate-100 ml-1">
                                    {ux.releaseSpec.tool}
                                  </strong>
                                </span>
                                <span className="flex items-center gap-1 font-mono text-cyan-300 font-bold">
                                  <Clock className="h-3 w-3" />
                                  {ux.releaseSpec.duration}
                                </span>
                              </div>
                              <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 font-bold text-amber-200">
                                动作：{ux.releaseSpec.direction}
                              </div>
                            </div>
                          </div>

                          {/* 4. Concise Safety & Self-Test Chips */}
                          <div className="space-y-1.5">
                            <div className="flex items-start gap-1.5 rounded-lg border border-rose-500/35 bg-rose-950/30 px-2.5 py-1.5 text-[11px] text-rose-200">
                              <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-rose-400 mt-0.5" />
                              <span>
                                <strong>避坑：</strong>
                                {ux.shortWarningZh}
                              </span>
                            </div>
                            <div className="flex items-start gap-1.5 rounded-lg border border-emerald-500/35 bg-emerald-950/25 px-2.5 py-1.5 text-[11px] text-emerald-200">
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400 mt-0.5" />
                              <span>
                                <strong>自测：</strong>
                                {ux.shortTestZh}
                              </span>
                            </div>
                          </div>

                          {/* 5. Progressive Disclosure Drawer for Deep Medical Theory */}
                          <details className="group rounded-lg border border-slate-800 bg-slate-950/50 text-[11px] text-slate-400">
                            <summary className="cursor-pointer select-none px-2.5 py-1.5 font-medium text-slate-300 hover:text-white">
                              📖 展开完整 Stecco 医学机制与学术细节
                            </summary>
                            <div className="space-y-1.5 border-t border-slate-800/80 p-2.5 leading-relaxed text-slate-300">
                              <div>
                                <span className="font-bold text-cyan-300">
                                  为什么先松它：
                                </span>
                                {step.whyReleaseThisFirstZh}
                              </div>
                              <div>
                                <span className="font-bold text-amber-300">
                                  完整触诊与手法：
                                </span>
                                {step.node.palpationLandmark} —{' '}
                                {step.node.releaseTechnique}
                              </div>
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {/* TAB 2: VISUAL BIOMECHANICAL PULL NETWORK */}
            {rightTab === 'network' && (
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-xs">
                  <div className="font-bold text-cyan-300 mb-1">
                    {selectedNode.code} · 一句话力学总结
                  </div>
                  <p className="text-slate-100 font-medium">
                    {selectedNodeUX.oneLineSummaryZh}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                    <Flame className="h-4 w-4" />
                    <span>
                      是谁在拉扯 {selectedNode.code}？ (
                      {selectedNodeState?.incomingContributors.length ?? 0} 条输入)
                    </span>
                  </h3>
                  {selectedNodeState?.incomingContributors.length === 0 ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-xs text-slate-400">
                      该节点属于远端源头协调中心（CC），因固定姿势直接发生透明质酸致密化，并向下游传导张力。
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedNodeState?.incomingContributors.map((contrib) => {
                        const upNode = STECCO_NODES_BY_ID[contrib.nodeId];
                        if (!upNode) return null;
                        const upUX = getNodeUX(upNode);
                        const pct = Math.min(
                          100,
                          Math.round(contrib.contribution * 160)
                        );
                        return (
                          <div
                            key={contrib.edgeId}
                            onClick={() => handleSelectNode(upNode.id)}
                            className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 hover:border-amber-400/70 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                                  {upNode.code}
                                </span>
                                <span className="text-xs font-bold text-white truncate">
                                  {upUX.shortTitleZh.split(' (')[0]}
                                </span>
                              </div>
                              <span className="font-mono text-[11px] font-bold text-rose-400 shrink-0">
                                拉力 +{Math.round(contrib.contribution * 100)}%
                              </span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-rose-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="mt-1 text-[11px] text-slate-300">
                              {contrib.anatomicalBridgeZh}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-bold text-cyan-400 mb-2 flex items-center gap-1.5">
                    <ArrowRight className="h-4 w-4" />
                    <span>
                      {selectedNode.code} 僵硬时会去拉扯谁？ (
                      {selectedNodeState?.outgoingTargets.length ?? 0} 个下游)
                    </span>
                  </h3>
                  {selectedNodeState?.outgoingTargets.length === 0 ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-xs text-slate-400">
                      该节点是张力汇聚的终端疼痛感知中心（CP），全身多条筋膜序列的异常拉力在此汇集。
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedNodeState?.outgoingTargets.map((out) => {
                        const downNode = STECCO_NODES_BY_ID[out.nodeId];
                        if (!downNode) return null;
                        const downUX = getNodeUX(downNode);
                        return (
                          <div
                            key={out.edgeId}
                            onClick={() => handleSelectNode(downNode.id)}
                            className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 hover:border-cyan-400/70 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
                                  {downNode.code}
                                </span>
                                <span className="text-xs font-bold text-white truncate">
                                  {downUX.shortTitleZh.split(' (')[0]}
                                </span>
                              </div>
                              <span className="font-mono text-[11px] font-bold text-amber-300 shrink-0">
                                传导 {Math.round(out.contribution * 100)}%
                              </span>
                            </div>
                            <div className="mt-1 text-[11px] text-slate-300">
                              {out.anatomicalBridgeZh}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: CURRENT SELECTED NODE QUICK CARD */}
            {rightTab === 'theory' && (
              <div className="space-y-2.5 text-xs">
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3">
                  <div className="font-bold text-cyan-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>3 步摸准 {selectedNode.code}</span>
                  </div>
                  <div className="space-y-1">
                    {selectedNodeUX.palpationSteps.map((st, i) => (
                      <div
                        key={i}
                        className="rounded bg-slate-950/70 px-2.5 py-1.5 text-slate-200"
                      >
                        {st}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3">
                  <div className="font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                    <Hand className="h-4 w-4" />
                    <span>松解操作规格</span>
                  </div>
                  <div className="space-y-1 text-slate-200">
                    <div>
                      <strong>工具：</strong>
                      {selectedNodeUX.releaseSpec.tool}
                    </div>
                    <div>
                      <strong>方向：</strong>
                      {selectedNodeUX.releaseSpec.direction}
                    </div>
                    <div>
                      <strong>时长：</strong>
                      {selectedNodeUX.releaseSpec.duration}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 text-rose-200">
                  <div className="font-bold text-rose-300 mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    <span>安全避坑红线</span>
                  </div>
                  <div>{selectedNodeUX.shortWarningZh}</div>
                </div>

                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/25 p-3 text-emerald-200">
                  <div className="font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>10 秒动作自测</span>
                  </div>
                  <div>{selectedNodeUX.shortTestZh}</div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* =====================================================================
          INTERACTIVE 3-STEP USAGE GUIDE MODAL
         ===================================================================== */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-2xl border border-white/25 bg-[#0D1322] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-cyan-400" />
                <h2 className="text-base font-extrabold text-white">
                  Stecco 3D 筋膜康复导航台 · 3 步快速使用指南
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="rounded-lg p-1 text-white/80 hover:bg-[#161F30] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-white">
              <div className="rounded-xl border border-white/20 bg-[#12192B] p-3.5">
                <div className="flex items-center gap-2.5 font-extrabold text-white text-sm mb-1.5">
                  <span className="inline-flex shrink-0 whitespace-nowrap items-center rounded-lg border border-cyan-300/90 bg-sky-600 px-2.5 py-0.5 font-mono text-xs font-black text-white shadow-[0_0_12px_rgba(14,165,233,0.5)]">
                    STEP 1
                  </span>
                  <span>在左侧栏点选你感觉疼痛的部位（定位受害点 CP）</span>
                </div>
                <p className="text-white/90">
                  在意大利 Stecco 筋膜体系中，<strong>你觉得痛的地方（如胸椎中段、肩胛骨内侧缝）往往是被拉长的“受害者（CP）”</strong>。在左侧按部位分类点选你的症状（或在 3D 模型上直接点击疼痛肌肉），系统会自动逆向溯源整条张力链。
                </p>
              </div>

              <div className="rounded-xl border border-white/20 bg-[#12192B] p-3.5">
                <div className="flex items-center gap-2.5 font-extrabold text-white text-sm mb-1.5">
                  <span className="inline-flex shrink-0 whitespace-nowrap items-center rounded-lg border border-cyan-300/90 bg-sky-600 px-2.5 py-0.5 font-mono text-xs font-black text-white shadow-[0_0_12px_rgba(14,165,233,0.5)]">
                    STEP 2
                  </span>
                  <span>在中间 3D 视口查看是谁在拉扯它（去程与回程闭环）</span>
                </div>
                <p className="text-white/90">
                  中间 3D 模型会自动开启<strong>「聚光灯模式」</strong>（无关肌肉弱化为半透明幽灵），并用三色标出完整拉扯链：
                  <br />• <strong>琥珀橙（去程前侧锁死链）</strong>：从手掌大鱼际 ➔ 腕屈/旋前圆肌 ➔ <strong>胸小肌（AN-SC）</strong>，把肩胛骨往前拽；
                  <br />• <strong>电光青（回程背侧牵扯链）</strong>：从手背 ➔ 指伸肌 ➔ <strong>冈下肌（ER-HU）</strong>，跨过肩胛骨拉拽胸椎。
                </p>
              </div>

              <div className="rounded-xl border border-white/20 bg-[#12192B] p-3.5">
                <div className="flex items-center gap-2.5 font-extrabold text-white text-sm mb-1.5">
                  <span className="inline-flex shrink-0 whitespace-nowrap items-center rounded-lg border border-cyan-300/90 bg-sky-600 px-2.5 py-0.5 font-mono text-xs font-black text-white shadow-[0_0_12px_rgba(14,165,233,0.5)]">
                    STEP 3
                  </span>
                  <span>在右侧栏跟着 ① ➔ ② ➔ ③ 按顺序松解并打卡</span>
                </div>
                <p className="text-white/90">
                  右侧栏每次只展开 1 个步骤。点击 <strong>「下一步 ▶」</strong>，3D 镜头会自动飞往该块肌肉，对照卡片上的<strong>「3 步摸准位置」</strong>与<strong>「工具/方向/时长」</strong>完成松解后点击<strong>「打卡」</strong>，即可实时看到后背拉扯力大幅下降！
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="rounded-xl border border-cyan-300 bg-sky-600 px-5 py-2 text-xs font-black text-white shadow-[0_0_14px_rgba(14,165,233,0.45)] hover:bg-sky-500"
              >
                明白了，开始体验
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
