import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Compass,
  Eye,
  HelpCircle,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Monitor,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Smartphone,
  Sparkles,
  SunDim,
  Tablet,
  Wrench,
  X,
} from 'lucide-react';
import { STECCO_NODES_BY_ID } from '../data/steccoAtlas';
import { getNodeUX } from '../data/nodeUXDigest';
import {
  NodeBiomechanicalState,
  RootCauseDiagnosticReport,
} from '../engine/tensegritySolver';
import {
  AnatomyViewport3D,
  CameraPreset,
  FlowSpeedMode,
  LayerVisibilityState,
  LoopFocusFilter,
} from './AnatomyViewport3D';
import { PainCategoryKey, PainSymptomEntry, PAIN_SYMPTOM_CATALOG } from '../App';

interface IPadRehabViewProps {
  selectedNodeId: string;
  activeStepIndex: number | null;
  loopFocusFilter: LoopFocusFilter;
  flowSpeedMode: FlowSpeedMode;
  fieldState: Record<string, NodeBiomechanicalState>;
  diagnosticReport: RootCauseDiagnosticReport;
  layerVisibility: LayerVisibilityState;
  cameraPreset: CameraPreset;
  cameraTrigger: number;
  releasedNodeIds: Set<string>;
  onSelectNode: (nodeId: string, clickedMuscleName?: string) => void;
  onSelectStepIndex: (stepIdx: number | null) => void;
  onSelectSymptomCard: (entry: PainSymptomEntry) => void;
  onToggleReleaseNode: (nodeId: string) => void;
  onSetLoopFocusFilter: (filter: LoopFocusFilter) => void;
  onCycleFlowSpeed: () => void;
  onSetLayerVisibility: React.Dispatch<React.SetStateAction<LayerVisibilityState>>;
  onSetCameraPreset: (preset: CameraPreset) => void;
  onTriggerCamera: () => void;
  onSimulateFullRelease: () => void;
  onSimulateNaiveBackRub: () => void;
  onResetScenario: () => void;
  onSwitchToDesktop: () => void;
}

type FrameSimMode = 'fullscreen' | 'landscape_frame' | 'portrait_frame';

/**
 * Unified Validator-Screen HMI Step Badge class:
 * Identical vibrant electric-blue background, crisp cyan border, pure white text,
 * and strict no-wrap so STEP 1, STEP 2, and STEP 3 share 100% consistent visual emphasis.
 */
const UNIFIED_STEP_BADGE_CLASS =
  'inline-flex shrink-0 whitespace-nowrap items-center gap-1 rounded-lg border border-cyan-300/90 bg-sky-600 px-2.5 py-1 font-mono text-xs font-black tracking-wide text-white shadow-[0_0_14px_rgba(14,165,233,0.5)]';

export const IPadRehabView: React.FC<IPadRehabViewProps> = ({
  selectedNodeId,
  activeStepIndex,
  loopFocusFilter,
  flowSpeedMode,
  fieldState,
  diagnosticReport,
  layerVisibility,
  cameraPreset,
  cameraTrigger,
  releasedNodeIds,
  onSelectNode,
  onSelectStepIndex,
  onSelectSymptomCard,
  onToggleReleaseNode,
  onSetLoopFocusFilter,
  onCycleFlowSpeed,
  onSetLayerVisibility,
  onSetCameraPreset,
  onTriggerCamera,
  onSimulateFullRelease,
  onSimulateNaiveBackRub,
  onResetScenario,
  onSwitchToDesktop,
}) => {
  // Detect whether user is on a real touch tablet or previewing on a large desktop monitor
  const isRealTouchDevice =
    typeof window !== 'undefined' &&
    (window.matchMedia('(pointer: coarse)').matches ||
      /iPad|Macintosh.*Mobile/i.test(navigator.userAgent));

  const [frameSimMode, setFrameSimMode] = useState<FrameSimMode>(
    isRealTouchDevice ? 'fullscreen' : 'landscape_frame'
  );
  const [showSymptomDrawer, setShowSymptomDrawer] = useState<boolean>(false);
  const [painCat, setPainCat] = useState<PainCategoryKey>('scapula_adhesion');
  const [dockMinimized, setDockMinimized] = useState<boolean>(false);
  const [dockTab, setDockTab] = useState<'guide' | 'network'>('guide');

  const selectedNode =
    STECCO_NODES_BY_ID[selectedNodeId] ?? STECCO_NODES_BY_ID['RE-TH'];
  const selectedNodeUX = getNodeUX(selectedNode);
  const selectedNodeState = fieldState[selectedNode.id];

  const steps = diagnosticReport.prescriptionSteps;
  const totalSteps = steps.length;
  const currentIdx =
    activeStepIndex !== null && activeStepIndex < totalSteps
      ? activeStepIndex
      : 0;
  const currentStep = steps[currentIdx] ?? steps[0];
  const currentStepUX = currentStep ? getNodeUX(currentStep.node) : null;
  const isCurrentStepReleased = currentStep
    ? releasedNodeIds.has(currentStep.node.id)
    : false;

  const filteredSymptoms =
    painCat === 'all'
      ? PAIN_SYMPTOM_CATALOG
      : PAIN_SYMPTOM_CATALOG.filter((s) => s.category === painCat);

  const isPortraitSim = frameSimMode === 'portrait_frame';

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#070A12] text-white overflow-hidden select-none">
      {/* =====================================================================
          DESKTOP PREVIEW CONTROL BAR (Only shown when previewing on PC with frame)
         ===================================================================== */}
      {frameSimMode !== 'fullscreen' && (
        <div className="z-40 mb-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-[#0D1322]/95 px-4 py-1.5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs">
            <Tablet className="h-4 w-4 text-cyan-400" />
            <span className="font-extrabold text-white">
              iPad 触控跟练版 · 模拟器预览
            </span>
            <span className="hidden sm:inline text-[11px] text-slate-200">
              （在真实 iPad 上打开会自动全屏铺满，支持添加到主屏幕离线使用）
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFrameSimMode('landscape_frame')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all border ${
                frameSimMode === 'landscape_frame'
                  ? 'bg-sky-600 border-cyan-300 text-white shadow-[0_0_12px_rgba(14,165,233,0.45)]'
                  : 'bg-[#161F30] border-white/15 text-white hover:border-white/40'
              }`}
            >
              <Tablet className="h-3.5 w-3.5 rotate-90" />
              <span>横屏 iPad (1180×820)</span>
            </button>
            <button
              type="button"
              onClick={() => setFrameSimMode('portrait_frame')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all border ${
                frameSimMode === 'portrait_frame'
                  ? 'bg-sky-600 border-cyan-300 text-white shadow-[0_0_12px_rgba(14,165,233,0.45)]'
                  : 'bg-[#161F30] border-white/15 text-white hover:border-white/40'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>竖屏 iPad (820×1080)</span>
            </button>
            <button
              type="button"
              onClick={() => setFrameSimMode('fullscreen')}
              className="flex items-center gap-1 rounded-lg border border-white/15 bg-[#161F30] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#1E293B]"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>全屏铺满</span>
            </button>
            <div className="mx-1 h-4 w-px bg-white/20" />
            <button
              type="button"
              onClick={onSwitchToDesktop}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-400/70 bg-sky-600/30 px-3 py-1 text-xs font-bold text-white hover:bg-sky-600/50"
            >
              <Monitor className="h-3.5 w-3.5 text-cyan-300" />
              <span>切回电脑三栏版</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          IPAD VIEWPORT CONTAINER (Either Framed iPad Bezel or 100% Fullscreen)
         ===================================================================== */}
      <div
        className={`relative flex flex-col overflow-hidden bg-[#070A12] transition-all duration-300 ${
          frameSimMode === 'landscape_frame'
            ? 'h-[min(820px,88vh)] w-[min(1180px,96vw)] rounded-[32px] border-[10px] border-[#1A2234] shadow-[0_0_80px_rgba(0,0,0,0.9)] ring-1 ring-white/15'
            : frameSimMode === 'portrait_frame'
            ? 'h-[min(1060px,90vh)] w-[min(820px,94vw)] rounded-[32px] border-[10px] border-[#1A2234] shadow-[0_0_80px_rgba(0,0,0,0.9)] ring-1 ring-white/15'
            : 'h-full w-full'
        }`}
      >
        {/* -------------------------------------------------------------------
            FULL-BLEED 3D ANATOMY CANVAS (Fills 100% of iPad screen)
           ------------------------------------------------------------------- */}
        <div className="relative flex-1 w-full h-full">
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
            hasRightFloatingDock={!isPortraitSim}
            onSelectNode={onSelectNode}
            onSelectStepIndex={onSelectStepIndex}
          />

          {/* =================================================================
              FLOATING TOP HUD (2 COMPACT NON-OVERLAPPING ROWS)
              - Row 1: STEP 1 (Left) + STEP 2 (Right)
              - Row 2: Camera Presets + Spotlight/X-Ray Tools (Left of STEP 3 Dock)
             ================================================================= */}
          <div className="pointer-events-none absolute top-3 left-3 right-3 z-30 flex flex-col gap-2">
            {/* Row 1: STEP 1 + STEP 2 */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* STEP 1: Touch Pill to Open Pain Symptom Selector Drawer */}
              <button
                type="button"
                onClick={() => setShowSymptomDrawer((v) => !v)}
                className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/20 bg-[#0D1322]/95 px-3 py-1.5 text-left shadow-2xl backdrop-blur-md hover:border-cyan-400/80 active:scale-95 transition-all"
              >
                <span className={UNIFIED_STEP_BADGE_CLASS}>
                  STEP 1 · 换痛点
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-white">
                    {selectedNode.code} {selectedNodeUX.shortTitleZh.split(' (')[0]}
                  </span>
                  <span className="rounded-md border border-rose-400/70 bg-rose-600/40 px-2 py-0.5 font-mono text-[11px] font-extrabold text-white">
                    受拉 {Math.round((selectedNodeState?.totalStrain ?? 0) * 100)}%
                  </span>
                  <ChevronDown className="h-4 w-4 text-white" />
                </div>
              </button>

              {/* STEP 2: Touch-Friendly Loop Isolation Filter Bar */}
              <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/20 bg-[#0D1322]/95 p-1.5 shadow-2xl backdrop-blur-md">
                <span className={UNIFIED_STEP_BADGE_CLASS}>
                  STEP 2 · 看链路
                </span>
                {(
                  [
                    ['full_loop', '完整闭环', 'bg-cyan-400'],
                    ['outgoing_front', '去程前侧链', 'bg-amber-400'],
                    ['returning_back', '回程背侧链', 'bg-sky-400'],
                    ['single_step', '当前单步', 'bg-emerald-400'],
                  ] as const
                ).map(([fid, label, dotClass]) => {
                  const isActive = loopFocusFilter === fid;
                  return (
                    <button
                      key={fid}
                      type="button"
                      onClick={() => {
                        if (fid === 'single_step' && activeStepIndex === null) {
                          onSelectStepIndex(0);
                        }
                        onSetLoopFocusFilter(fid);
                      }}
                      className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-extrabold transition-all active:scale-95 border ${
                        isActive
                          ? 'bg-sky-600 border-white text-white shadow-[0_0_12px_rgba(14,165,233,0.5)]'
                          : 'bg-[#161F30] border-white/15 text-white hover:bg-[#1E293B] hover:border-white/35'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isActive ? 'bg-white' : dotClass
                        }`}
                      />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Camera Angles + Spotlight/X-Ray/Speed Utility Bar on a Single Compact Line */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="pointer-events-auto inline-flex flex-wrap items-center gap-1 rounded-2xl border border-white/20 bg-[#0D1322]/95 p-1 shadow-xl backdrop-blur-md">
                <span className="px-2 text-[11px] font-extrabold text-white flex items-center gap-1">
                  <Compass className="h-3.5 w-3.5 text-cyan-400" />
                  视角:
                </span>
                {(
                  [
                    ['scapula_closeup', '肩胛特写'],
                    ['arm_thorax_loop', '闭环全景'],
                    ['posterior_thorax', '后背胸椎'],
                    ['anterior_chest', '前胸胸小肌'],
                    ['right_arm_closeup', '右前臂手腕'],
                    ['pelvis_lumbar', '骨盆底座'],
                  ] as const
                ).map(([presetId, label]) => (
                  <button
                    key={presetId}
                    type="button"
                    onClick={() => {
                      if (presetId === 'scapula_closeup') {
                        onSetCameraPreset('scapula_closeup');
                        onTriggerCamera();
                        onSetLayerVisibility((v) => ({
                          ...v,
                          xraySuperficial: true,
                        }));
                      } else {
                        onSetCameraPreset(presetId);
                        onTriggerCamera();
                      }
                    }}
                    className={`rounded-xl px-2 py-1 text-xs font-extrabold transition-all active:scale-95 border ${
                      cameraPreset === presetId
                        ? 'bg-sky-600 border-white text-white shadow-[0_0_10px_rgba(14,165,233,0.45)]'
                        : 'bg-transparent border-transparent text-white/90 hover:bg-[#161F30] hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Compact Utility Pill right alongside Camera Angles on Row 2 */}
              <div className="pointer-events-auto inline-flex items-center gap-1 rounded-2xl border border-white/20 bg-[#0D1322]/95 p-1 shadow-2xl backdrop-blur-md">
                <button
                  type="button"
                  onClick={() =>
                    onSetLayerVisibility((v) => ({
                      ...v,
                      spotlightDimming: !v.spotlightDimming,
                    }))
                  }
                  className={`flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-extrabold transition-all border ${
                    layerVisibility.spotlightDimming
                      ? 'bg-sky-600/40 text-white border-cyan-300/90'
                      : 'bg-[#161F30] text-white/80 border-white/15'
                  }`}
                >
                  <SunDim className="h-3.5 w-3.5 text-cyan-300" />
                  <span>聚光灯</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onSetLayerVisibility((v) => ({
                      ...v,
                      xraySuperficial: !v.xraySuperficial,
                    }))
                  }
                  className={`flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-extrabold transition-all border ${
                    layerVisibility.xraySuperficial
                      ? 'bg-sky-600/40 text-white border-cyan-300/90'
                      : 'bg-[#161F30] text-white/80 border-white/15'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5 text-cyan-300" />
                  <span>深层透视</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onSetLayerVisibility((v) => ({
                      ...v,
                      showAllLabels: !v.showAllLabels,
                    }))
                  }
                  className={`flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-extrabold transition-all border ${
                    layerVisibility.showAllLabels
                      ? 'bg-sky-600/40 text-white border-cyan-300/90'
                      : 'bg-[#161F30] text-white/80 border-white/15'
                  }`}
                  title="默认仅显示当前按压步骤及其传导链标签；点击可展开全部节点标签"
                >
                  <Eye className="h-3.5 w-3.5 text-cyan-300" />
                  <span>{layerVisibility.showAllLabels ? '全部标签' : '当前链标签'}</span>
                </button>

                <button
                  type="button"
                  onClick={onCycleFlowSpeed}
                  className="flex items-center gap-1 rounded-xl border border-white/15 bg-[#161F30] px-2 py-1 text-xs font-bold text-white hover:border-white/35"
                >
                  {flowSpeedMode === 'paused' ? (
                    <Pause className="h-3.5 w-3.5 text-white/70" />
                  ) : (
                    <Play className="h-3.5 w-3.5 text-cyan-300" />
                  )}
                  <span>
                    {flowSpeedMode === 'slow'
                      ? '慢速'
                      : flowSpeedMode === 'normal'
                      ? '标准'
                      : '暂停'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onResetScenario}
                  className="rounded-xl border border-white/15 bg-[#161F30] p-1 text-white hover:bg-[#1E293B]"
                  title="重置状态"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>

                {frameSimMode === 'fullscreen' && (
                  <>
                    {!isRealTouchDevice && (
                      <button
                        type="button"
                        onClick={() => setFrameSimMode('landscape_frame')}
                        className="rounded-xl border border-white/20 bg-[#161F30] px-2 py-1 text-xs font-bold text-white hover:bg-[#1E293B]"
                        title="显示 iPad 外框模拟器"
                      >
                        iPad外框
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onSwitchToDesktop}
                      className="flex items-center gap-1 rounded-xl border border-cyan-300/80 bg-sky-600/40 px-2 py-1 text-xs font-extrabold text-white"
                    >
                      <Monitor className="h-3.5 w-3.5 text-cyan-300" />
                      <span className="hidden sm:inline">电脑版</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* =================================================================
              SLIDE-OVER SYMPTOM DRAWER (When user taps STEP 1 · 换痛点)
             ================================================================= */}
          {showSymptomDrawer && (
            <div className="pointer-events-auto absolute inset-0 z-40 flex bg-black/70 backdrop-blur-sm">
              <div className="flex h-full w-full max-w-md flex-col border-r border-white/20 bg-[#0D1322] p-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={UNIFIED_STEP_BADGE_CLASS}>STEP 1</span>
                    <span className="text-base font-extrabold text-white">
                      点选你感觉疼痛的部位
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSymptomDrawer(false)}
                    className="rounded-xl border border-white/20 bg-[#161F30] p-2 text-white hover:bg-[#1E293B]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Quick Banner: One-Tap Scapula + Ear Rehab Focus */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectSymptomCard(PAIN_SYMPTOM_CATALOG[0]);
                    setPainCat('scapula_adhesion');
                    setShowSymptomDrawer(false);
                  }}
                  className="mt-3 flex w-full items-center justify-between rounded-2xl border border-cyan-400/80 bg-sky-600/25 px-3.5 py-2.5 text-left shadow-lg hover:bg-sky-600/35 active:scale-[0.99]"
                >
                  <div>
                    <div className="text-xs font-extrabold text-cyan-300">
                      核心专项 · 肩胛特写
                    </div>
                    <div className="text-sm font-black text-white">
                      肩胛全周深层黏连 + 耳周「车顶挂钩」
                    </div>
                  </div>
                  <span className="shrink-0 rounded-xl bg-sky-600 border border-white/80 px-2.5 py-1 text-xs font-black text-white">
                    开启
                  </span>
                </button>

                {/* Category Filter Pills */}
                <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
                  {(
                    [
                      ['scapula_adhesion', '肩胛·耳周'],
                      ['thorax_scapula', '斜方·胸椎'],
                      ['arm_wrist', '手臂闭环'],
                      ['lumbar_pelvis', '腰背底座'],
                      ['all', `全部(${PAIN_SYMPTOM_CATALOG.length})`],
                    ] as const
                  ).map(([catKey, label]) => (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setPainCat(catKey)}
                      className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-extrabold border ${
                        painCat === catKey
                          ? 'bg-sky-600 border-white text-white shadow'
                          : 'bg-[#161F30] border-white/15 text-white/90 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Large Touch Symptom Cards */}
                <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
                  {filteredSymptoms.map((item) => {
                    const isSel = selectedNodeId === item.nodeId;
                    const st = fieldState[item.nodeId];
                    return (
                      <button
                        key={item.nodeId}
                        type="button"
                        onClick={() => {
                          onSelectSymptomCard(item);
                          setShowSymptomDrawer(false);
                        }}
                        className={`w-full flex flex-col items-start rounded-2xl p-3 text-left transition-all border active:scale-[0.99] ${
                          isSel
                            ? 'bg-sky-600/25 border-2 border-white text-white shadow-lg'
                            : 'bg-[#161F30]/90 border-white/15 text-white hover:border-cyan-400/60'
                        }`}
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className="text-sm font-extrabold text-white truncate">
                            {item.titleZh}
                          </span>
                          <span className="shrink-0 rounded-lg border border-rose-400/70 bg-rose-600/40 px-2 py-0.5 font-mono text-xs font-extrabold text-white">
                            {Math.round((st?.totalStrain ?? 0.8) * 100)}%
                          </span>
                        </div>
                        <div className="mt-1 flex w-full items-center justify-between gap-2 text-xs">
                          <span className="font-mono font-bold text-cyan-300 truncate">
                            {item.subtitleZh}
                          </span>
                          <span className="shrink-0 rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-bold text-sky-200">
                            {item.tagZh}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-200 truncate w-full">
                          {item.symptomDescZh}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div
                className="flex-1"
                onClick={() => setShowSymptomDrawer(false)}
              />
            </div>
          )}

          {/* =================================================================
              FLOATING STEP 3 FOLLOW-ALONG DOCK
              - In Landscape: Right Floating Validator HMI Card (w-[376px])
              - In Portrait: Bottom Sheet Card
             ================================================================= */}
          {currentStep && currentStepUX && (
            <div
              className={`pointer-events-auto absolute z-30 flex flex-col rounded-3xl border border-white/25 bg-[#0D1322]/96 shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-all ${
                isPortraitSim
                  ? 'bottom-3 left-3 right-3 max-h-[46%]'
                  : 'bottom-4 right-4 top-28 w-[376px]'
              } ${dockMinimized ? '!h-auto !top-auto' : ''}`}
            >
              {/* Dock Header + Minimize Toggle */}
              <div className="flex items-center justify-between gap-2 border-b border-white/15 px-3.5 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={UNIFIED_STEP_BADGE_CLASS}>
                    STEP 3 · 跟练
                  </span>
                  <span className="whitespace-nowrap font-mono text-xs font-extrabold text-white">
                    预计缓解{' '}
                    <span className="text-emerald-400">
                      -{diagnosticReport.totalRelativeReliefPercent}%
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setDockTab((t) => (t === 'guide' ? 'network' : 'guide'))
                    }
                    className="whitespace-nowrap rounded-lg border border-white/20 bg-[#161F30] px-2.5 py-1 text-[11px] font-extrabold text-white hover:border-cyan-400"
                  >
                    {dockTab === 'guide' ? '查看牵扯源' : '返回跟练'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDockMinimized((v) => !v)}
                    className="rounded-lg border border-white/20 bg-[#161F30] p-1.5 text-white hover:bg-[#1E293B]"
                    title={dockMinimized ? '展开跟练卡片' : '收起卡片看全屏3D'}
                  >
                    {dockMinimized ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <Minimize2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Giant Touch Stepper & Check-in Bar (Always visible even when minimized!) */}
              <div className="border-b border-white/15 bg-[#090D18] px-3 py-2">
                {/* Numbered Step Pills (1..N) — High-Contrast Pure White Text, No Right-Edge Clipping */}
                <div className="mb-2 flex flex-wrap items-center gap-1">
                  {steps.map((s, idx) => {
                    const active = idx === currentIdx;
                    const done = releasedNodeIds.has(s.node.id);
                    return (
                      <button
                        key={s.node.id}
                        type="button"
                        onClick={() => onSelectStepIndex(idx)}
                        className={`flex h-7 shrink-0 items-center justify-center gap-1 rounded-lg px-2 font-mono text-[11px] font-extrabold transition-all active:scale-95 border ${
                          active
                            ? 'bg-sky-600 text-white border-2 border-white shadow-[0_0_12px_rgba(14,165,233,0.65)]'
                            : done
                            ? 'bg-emerald-600/50 text-white border-emerald-300'
                            : 'bg-[#161F30] text-white border-white/20 hover:border-white/50'
                        }`}
                      >
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-black/35 text-[10px] font-black text-white">
                          {done ? '✓' : s.stepNumber}
                        </span>
                        <span className="text-[11px] font-extrabold text-white">
                          {s.node.code}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Big Touch Prev / Check-in / Next Buttons — Crisp White Typography */}
                <div className="grid grid-cols-12 gap-2">
                  <button
                    type="button"
                    disabled={currentIdx <= 0}
                    onClick={() =>
                      onSelectStepIndex(Math.max(0, currentIdx - 1))
                    }
                    className="col-span-3 flex h-11 items-center justify-center gap-1 rounded-2xl border border-white/25 bg-[#161F30] text-xs font-extrabold text-white hover:bg-[#1E293B] active:scale-95 disabled:opacity-35"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>上一步</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleReleaseNode(currentStep.node.id)}
                    className={`col-span-5 flex h-11 items-center justify-center gap-1.5 rounded-2xl text-xs font-extrabold transition-all active:scale-95 border ${
                      isCurrentStepReleased
                        ? 'bg-emerald-600 text-white border-2 border-white shadow-[0_0_14px_rgba(16,185,129,0.5)]'
                        : 'bg-[#161F30] text-white border-amber-400/90 hover:bg-amber-500/25'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4 text-amber-300" />
                    <span>
                      {isCurrentStepReleased ? '✓ 已打卡松解' : '打卡此步已松'}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={currentIdx >= totalSteps - 1}
                    onClick={() =>
                      onSelectStepIndex(
                        Math.min(totalSteps - 1, currentIdx + 1)
                      )
                    }
                    className="col-span-4 flex h-11 items-center justify-center gap-1 rounded-2xl border border-cyan-300 bg-sky-600 text-xs font-black text-white shadow-[0_0_14px_rgba(14,165,233,0.45)] hover:bg-sky-500 active:scale-95 disabled:opacity-35"
                  >
                    <span>下一步</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Step Details Body (Hidden when dockMinimized is true) */}
              {!dockMinimized && (
                <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs">
                  {dockTab === 'guide' ? (
                    <>
                      {/* Step Title & Core Reason */}
                      <div className="rounded-2xl border border-white/15 bg-[#12192B] p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="inline-flex items-center gap-1.5 font-mono text-xs font-black text-white">
                            <span className="rounded bg-sky-600 px-1.5 py-0.5 text-[11px] text-white border border-cyan-300/80">
                              第 {currentStep.stepNumber} 步
                            </span>
                            <span>{currentStep.node.code}</span>
                          </span>
                          <span className="rounded-md border border-white/15 bg-[#1B253B] px-2 py-0.5 text-[11px] font-bold text-cyan-300">
                            {currentStepUX.loopGroupLabelZh}
                          </span>
                        </div>
                        <div className="text-sm font-extrabold text-white">
                          {currentStepUX.shortTitleZh}
                        </div>
                        <p className="mt-1 text-xs font-medium text-white/95 leading-relaxed">
                          {currentStepUX.oneLineSummaryZh}
                        </p>

                        {/* Path Breadcrumb */}
                        {currentStep.transmissionPathIds.length > 1 && (
                          <div className="mt-2.5 flex flex-wrap items-center gap-1 pt-2 border-t border-white/15 text-[11px]">
                            <span className="font-bold text-white/80">
                              传导链:
                            </span>
                            {currentStep.transmissionPathIds.map(
                              (pid, pIdx) => (
                                <React.Fragment key={pid}>
                                  <button
                                    type="button"
                                    onClick={() => onSelectNode(pid)}
                                    className={`rounded-md px-2 py-0.5 font-mono font-extrabold border ${
                                      pid === currentStep.node.id
                                        ? 'bg-sky-600 border-white text-white'
                                        : pid === selectedNode.id
                                        ? 'bg-rose-600/50 border-rose-300 text-white'
                                        : 'bg-[#1B253B] border-white/20 text-white'
                                    }`}
                                  >
                                    {pid}
                                  </button>
                                  {pIdx <
                                    currentStep.transmissionPathIds.length -
                                      1 && (
                                    <ArrowRight className="h-3 w-3 text-white/70" />
                                  )}
                                </React.Fragment>
                              )
                            )}
                          </div>
                        )}
                      </div>

                      {/* 3-Step Palpation */}
                      <div className="rounded-2xl border border-white/15 bg-[#12192B] p-3">
                        <div className="mb-1.5 flex items-center gap-1.5 font-extrabold text-white">
                          <MapPin className="h-4 w-4 text-cyan-400" />
                          <span>3 步快速摸准位置</span>
                        </div>
                        <div className="space-y-1.5">
                          {currentStepUX.palpationSteps.map((st, i) => (
                            <div
                              key={i}
                              className="rounded-xl border border-white/10 bg-[#090D18] px-2.5 py-1.5 font-medium text-white"
                            >
                              {st}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Release Spec */}
                      <div className="rounded-2xl border border-white/15 bg-[#12192B] p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-extrabold text-white">
                            <Wrench className="h-3.5 w-3.5 text-amber-400" />
                            <span>{currentStepUX.releaseSpec.tool}</span>
                          </span>
                          <span className="flex items-center gap-1 font-mono font-extrabold text-cyan-300">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{currentStepUX.releaseSpec.duration}</span>
                          </span>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-[#090D18] px-2.5 py-1.5 font-bold text-white">
                          动作：{currentStepUX.releaseSpec.direction}
                        </div>
                      </div>

                      {/* Safety & Self-Test */}
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-1.5 rounded-xl border border-rose-400/50 bg-rose-950/50 px-2.5 py-2 text-[11px] text-white">
                          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                          <span>
                            <strong className="text-rose-200">避坑：</strong>
                            {currentStepUX.shortWarningZh}
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5 rounded-xl border border-emerald-400/50 bg-emerald-950/40 px-2.5 py-2 text-[11px] text-white">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                          <span>
                            <strong className="text-emerald-200">自测：</strong>
                            {currentStepUX.shortTestZh}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Quick Pull Network View + Counterfactual Simulators */
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={onSimulateFullRelease}
                          className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-emerald-600/35 border border-emerald-400/80 py-2 font-extrabold text-white"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                          <span>模拟全链松解</span>
                        </button>
                        <button
                          type="button"
                          onClick={onSimulateNaiveBackRub}
                          className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-rose-600/35 border border-rose-400/80 py-2 font-extrabold text-white"
                        >
                          <HelpCircle className="h-3.5 w-3.5 text-rose-300" />
                          <span>只揉后背实验</span>
                        </button>
                      </div>

                      <div className="font-extrabold text-white">
                        是谁在拉扯 {selectedNode.code}？
                      </div>
                      {selectedNodeState?.incomingContributors.map((c) => {
                        const upNode = STECCO_NODES_BY_ID[c.nodeId];
                        if (!upNode) return null;
                        return (
                          <div
                            key={c.edgeId}
                            onClick={() => {
                              onSelectNode(upNode.id);
                              setDockTab('guide');
                            }}
                            className="cursor-pointer rounded-xl border border-white/15 bg-[#12192B] p-2.5 hover:border-cyan-400"
                          >
                            <div className="flex items-center justify-between font-extrabold">
                              <span className="text-white">
                                {upNode.code} · {upNode.nameZh}
                              </span>
                              <span className="font-mono text-rose-300">
                                +{Math.round(c.contribution * 100)}%
                              </span>
                            </div>
                            <div className="mt-1 text-[11px] text-white/90">
                              {c.anatomicalBridgeZh}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
