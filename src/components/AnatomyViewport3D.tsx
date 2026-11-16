import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  STECCO_NODES,
  STECCO_NODES_BY_ID,
  SteccoNode,
  AnatomicalLayer,
  findSteccoNodesByPartId,
} from '../data/steccoAtlas';
import { BIOMECHANICAL_EDGES } from '../data/myofascialChains';
import { getNodeUX, LoopGroup } from '../data/nodeUXDigest';
import {
  NodeBiomechanicalState,
  RootCauseDiagnosticReport,
} from '../engine/tensegritySolver';

interface AtlasPartMeta {
  id: string;
  name: string;
  conceptId: string;
  system: string;
  layer: AnatomicalLayer;
  chunk: number;
  positions: number;
  normals: number;
  indices: number;
  vertexCount: number;
  indexCount: number;
  bounds: [[number, number, number], [number, number, number]];
}

interface MusculoskeletalAtlas {
  version: string;
  source: string;
  parts: AtlasPartMeta[];
  chunks: { url: string; bytes: number }[];
}

// Module-level memory cache so binary chunks are never re-fetched or re-parsed on component remount
let cachedAtlasJson: MusculoskeletalAtlas | null = null;
const cachedChunkBuffers = new Map<number, ArrayBuffer>();

export type CameraPreset =
  | 'scapula_closeup'
  | 'arm_thorax_loop'
  | 'posterior_thorax'
  | 'anterior_chest'
  | 'right_arm_closeup'
  | 'pelvis_lumbar'
  | 'full_body';

const POSTERIOR_SCAPULAR_NODE_IDS = new Set([
  'CF-SC',
  'RE-HU',
  'CF-HU',
  'RE-HU2',
  'ER-HU',
  'IR-SC2',
  'ME-SC',
  'RE-SC',
  'ER-SC',
  'LA-SC2',
  'ER-TH',
  'RE-TH',
  'CF-TH',
  'RE-CP',
]);

export type LoopFocusFilter =
  | 'full_loop'
  | 'outgoing_front'
  | 'returning_back'
  | 'single_step';

export type FlowSpeedMode = 'slow' | 'normal' | 'paused';

export interface LayerVisibilityState {
  skin: boolean;
  superficial_muscle: boolean;
  deep_muscle: boolean;
  fascia_connective: boolean;
  skeleton: boolean;
  xraySuperficial: boolean;
  spotlightDimming: boolean;
  showAllLabels: boolean;
}

interface Props {
  selectedNodeId: string;
  activeStepIndex: number | null;
  loopFocusFilter: LoopFocusFilter;
  flowSpeedMode: FlowSpeedMode;
  fieldState: Record<string, NodeBiomechanicalState>;
  diagnosticReport: RootCauseDiagnosticReport;
  layerVisibility: LayerVisibilityState;
  cameraPreset: CameraPreset;
  cameraTrigger: number;
  hasRightFloatingDock?: boolean;
  onSelectNode: (nodeId: string, clickedMuscleName?: string) => void;
  onSelectStepIndex?: (stepIdx: number) => void;
}

interface ProjectedLabel {
  id: string;
  code: string;
  nameZh: string;
  roleType: 'CC' | 'CF' | 'CP';
  loopGroup: LoopGroup;
  pinX: number;
  pinY: number;
  labelX: number;
  labelY: number;
  visible: boolean;
  isSelected: boolean;
  isCulprit: boolean;
  isActiveStep: boolean;
  stepIndex: number | null;
  strain: number;
  adhesion: number;
}

export const AnatomyViewport3D: React.FC<Props> = ({
  selectedNodeId,
  activeStepIndex,
  loopFocusFilter,
  flowSpeedMode,
  fieldState,
  diagnosticReport,
  layerVisibility,
  cameraPreset,
  cameraTrigger,
  hasRightFloatingDock = false,
  onSelectNode,
  onSelectStepIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hoveredInfo, setHoveredInfo] = useState<{
    partName: string;
    mappedNode?: SteccoNode;
  } | null>(null);
  const [projectedLabels, setProjectedLabels] = useState<ProjectedLabel[]>([]);
  const [zoomLodTier, setZoomLodTier] = useState<
    'L1_MACRO' | 'L2_MESO' | 'L3_MICRO'
  >('L1_MACRO');
  const lastZoomTierRef = useRef<'L1_MACRO' | 'L2_MESO' | 'L3_MICRO'>(
    'L1_MACRO'
  );

  // Dirty flags so we NEVER recompute 624 materials or React 2D labels 60 times/sec when idle
  const materialsDirtyRef = useRef<boolean>(true);
  const labelsDirtyRef = useRef<boolean>(true);

  const stateRef = useRef({
    selectedNodeId,
    activeStepIndex,
    loopFocusFilter,
    flowSpeedMode,
    fieldState,
    diagnosticReport,
    layerVisibility,
    hasRightFloatingDock,
    cameraPreset,
  });
  stateRef.current = {
    selectedNodeId,
    activeStepIndex,
    loopFocusFilter,
    flowSpeedMode,
    fieldState,
    diagnosticReport,
    layerVisibility,
    hasRightFloatingDock,
    cameraPreset,
  };

  // Mark materials & labels dirty whenever relevant React props change
  useEffect(() => {
    materialsDirtyRef.current = true;
    labelsDirtyRef.current = true;
  }, [
    selectedNodeId,
    activeStepIndex,
    loopFocusFilter,
    fieldState,
    diagnosticReport,
    layerVisibility,
    hasRightFloatingDock,
    cameraPreset,
  ]);

  const onSelectRef = useRef(onSelectNode);
  onSelectRef.current = onSelectNode;

  const cameraTargetGoalRef = useRef<{
    pos: THREE.Vector3;
    target: THREE.Vector3;
    animating: boolean;
  }>({
    pos: new THREE.Vector3(-0.68, 1.28, -0.74),
    target: new THREE.Vector3(-0.12, 1.18, -0.02),
    animating: false,
  });

  // Trigger camera choreography when selectedNodeId or activeStepIndex changes
  useEffect(() => {
    const activeStepNode =
      activeStepIndex !== null
        ? diagnosticReport.prescriptionSteps[activeStepIndex]?.node
        : null;
    const focusNode = activeStepNode ?? STECCO_NODES_BY_ID[selectedNodeId];

    if (focusNode) {
      const [nx, ny, nz] = focusNode.coords;
      const inScapulaZoom = cameraPreset === 'scapula_closeup';
      const target = inScapulaZoom
        ? new THREE.Vector3(nx * 0.88 - 0.01, ny, nz * 0.65 - 0.02)
        : new THREE.Vector3(nx * 0.78, ny, nz * 0.5);
      const isPosterior =
        nz < -0.02 ||
        focusNode.direction === 'RE' ||
        focusNode.direction === 'CF' ||
        focusNode.id === 'ER-HU' ||
        focusNode.id === 'ER-SC' ||
        focusNode.id === 'LA-SC2' ||
        focusNode.id === 'ER-TH';
      const isLateral = nx < -0.18 || focusNode.direction === 'LA';
      const isDeepCostalSubscap = focusNode.id === 'IR-SC2';
      const dir = isDeepCostalSubscap
        ? new THREE.Vector3(-0.84, 0.06, -0.54).normalize()
        : new THREE.Vector3(
            isLateral ? -0.78 : -0.42,
            0.12,
            isPosterior ? -0.88 : 0.88
          ).normalize();
      const dist = inScapulaZoom
        ? activeStepNode
          ? 0.37
          : 0.42
        : activeStepNode
        ? 0.64
        : 0.78;
      cameraTargetGoalRef.current = {
        pos: target.clone().addScaledVector(dir, dist),
        target,
        animating: true,
      };
    }
  }, [selectedNodeId, activeStepIndex]);

  useEffect(() => {
    if (loopFocusFilter === 'outgoing_front') {
      cameraTargetGoalRef.current = {
        target: new THREE.Vector3(-0.15, 1.2, 0.03),
        pos: new THREE.Vector3(-0.56, 1.28, 0.76),
        animating: true,
      };
    } else if (loopFocusFilter === 'returning_back') {
      cameraTargetGoalRef.current = {
        target: new THREE.Vector3(-0.14, 1.22, -0.04),
        pos: new THREE.Vector3(-0.58, 1.3, -0.76),
        animating: true,
      };
    } else if (loopFocusFilter === 'full_loop') {
      cameraTargetGoalRef.current = {
        target: new THREE.Vector3(-0.12, 1.18, -0.02),
        pos: new THREE.Vector3(-0.72, 1.28, -0.74),
        animating: true,
      };
    }
  }, [loopFocusFilter]);

  useEffect(() => {
    let pos = new THREE.Vector3(-0.65, 1.28, -0.82);
    let target = new THREE.Vector3(-0.11, 1.22, -0.02);

    if (cameraPreset === 'scapula_closeup') {
      target = new THREE.Vector3(-0.105, 1.325, -0.062);
      pos = new THREE.Vector3(-0.225, 1.335, -0.455);
    } else if (cameraPreset === 'posterior_thorax') {
      target = new THREE.Vector3(-0.05, 1.32, -0.06);
      pos = new THREE.Vector3(-0.18, 1.38, -0.78);
    } else if (cameraPreset === 'anterior_chest') {
      target = new THREE.Vector3(-0.08, 1.32, 0.03);
      pos = new THREE.Vector3(-0.25, 1.36, 0.78);
    } else if (cameraPreset === 'right_arm_closeup') {
      target = new THREE.Vector3(-0.21, 1.08, 0.0);
      pos = new THREE.Vector3(-0.78, 1.15, 0.48);
    } else if (cameraPreset === 'pelvis_lumbar') {
      target = new THREE.Vector3(-0.06, 0.98, -0.03);
      pos = new THREE.Vector3(-0.55, 1.06, -0.68);
    } else if (cameraPreset === 'full_body') {
      target = new THREE.Vector3(0, 0.92, 0);
      pos = new THREE.Vector3(-0.95, 1.12, 1.95);
    } else {
      target = new THREE.Vector3(-0.12, 1.18, -0.02);
      pos = new THREE.Vector3(-0.72, 1.28, -0.74);
    }

    cameraTargetGoalRef.current = { pos, target, animating: true };
  }, [cameraPreset, cameraTrigger]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    const abortController = new AbortController();

    // 1. Cap PixelRatio at 1.5x to cut Retina GPU fragment shader fill-rate cost by ~44% with zero visible loss
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor('#060911', 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      36,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.01,
      50
    );
    camera.position.set(-0.72, 1.28, -0.74);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(-0.12, 1.18, -0.02);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minDistance = 0.22;
    controls.maxDistance = 5.0;
    controls.update();

    let isOrbitDragging = false;
    const onControlStart = () => {
      isOrbitDragging = true;
      cameraTargetGoalRef.current.animating = false;
    };
    const onControlEnd = () => {
      isOrbitDragging = false;
      labelsDirtyRef.current = true;
    };
    controls.addEventListener('start', onControlStart);
    controls.addEventListener('end', onControlEnd);

    // 2. Direct Three-Point Studio Lighting (Removed heavy PMREM RoomEnvironment reflection probe)
    scene.add(new THREE.HemisphereLight(0xe2e8f0, 0x1e293b, 1.25));
    const frontKey = new THREE.DirectionalLight(0xfff7ed, 1.9);
    frontKey.position.set(-1.8, 2.8, 2.2);
    scene.add(frontKey);

    const backKey = new THREE.DirectionalLight(0xe0f2fe, 2.1);
    backKey.position.set(-1.5, 2.5, -2.5);
    scene.add(backKey);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
    rimLight.position.set(2.2, 1.6, -1.5);
    scene.add(rimLight);

    const grid = new THREE.PolarGridHelper(0.75, 16, 8, 48, 0x1e293b, 0x0f172a);
    grid.position.y = -0.01;
    scene.add(grid);

    const anatomyGroup = new THREE.Group();
    const nodeMarkerGroup = new THREE.Group();
    const edgeTubeGroup = new THREE.Group();
    const pulseParticleGroup = new THREE.Group();
    scene.add(anatomyGroup);
    scene.add(edgeTubeGroup);
    scene.add(pulseParticleGroup);
    scene.add(nodeMarkerGroup);

    // Separate interactive mapped meshes (~95) from merged static background layer meshes (5)
    // This drops WebGL draw calls from 624 down to ~100!
    const mappedPartMeshes: THREE.Mesh[] = [];
    const mergedBackgroundMeshes: THREE.Mesh[] = [];
    let pulsingMeshes: { mesh: THREE.Mesh; isStep: boolean }[] = [];

    const nodeMeshes = new Map<
      string,
      {
        core: THREE.Mesh;
        halo: THREE.Mesh;
        ring: THREE.Mesh;
        baseColor: number;
        baseScale: number;
        baseHaloOpacity: number;
        baseRingOpacity: number;
      }
    >();

    // Build 3D Node Beacons with surgical base radii (adaptive zoom scales them down further on close-up)
    const sphereGeo = new THREE.SphereGeometry(0.0056, 14, 14);
    const haloGeo = new THREE.SphereGeometry(0.0102, 12, 12);
    const ringGeo = new THREE.RingGeometry(0.0108, 0.0142, 24);

    for (const node of STECCO_NODES) {
      const ux = getNodeUX(node);
      const baseColor =
        node.roleType === 'CP'
          ? 0xf43f5e
          : ux.loopGroup === 'outgoing_front'
          ? 0xf59e0b
          : ux.loopGroup === 'returning_back'
          ? 0x06b6d4
          : 0xa855f7;

      const coreMat = new THREE.MeshBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: 1.0,
        depthTest: false,
      });
      const coreMesh = new THREE.Mesh(sphereGeo, coreMat);
      coreMesh.position.set(...node.coords);
      coreMesh.renderOrder = 22;
      coreMesh.userData = { steccoNodeId: node.id };

      const haloMat = new THREE.MeshBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0.28,
        depthTest: false,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.set(...node.coords);
      haloMesh.renderOrder = 21;
      haloMesh.userData = { steccoNodeId: node.id };

      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.0,
        depthTest: false,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(...node.coords);
      ringMesh.renderOrder = 23;

      nodeMarkerGroup.add(coreMesh, haloMesh, ringMesh);
      nodeMeshes.set(node.id, {
        core: coreMesh,
        halo: haloMesh,
        ring: ringMesh,
        baseColor,
        baseScale: 1.0,
        baseHaloOpacity: 0.28,
        baseRingOpacity: 0.0,
      });
    }

    // Build 3D Curved Fascial Transmission Tubes (Dual-LOD: Macro Tube + Micro Filament) + Flow Particles
    interface EdgeVisual {
      edgeId: string;
      fromId: string;
      toId: string;
      edgeLoopGroup: LoopGroup;
      isVictimBridge: boolean;
      curve: THREE.CatmullRomCurve3;
      tubeMesh: THREE.Mesh;
      microTubeMesh: THREE.Mesh;
      particles: THREE.Mesh[];
      isEdgeFocused: boolean;
      isContextEdge: boolean;
      showParticles: boolean;
      baseTubeOpacity: number;
    }
    const edgeVisuals: EdgeVisual[] = [];
    const particleGeo = new THREE.SphereGeometry(0.0032, 10, 10);

    for (const edge of BIOMECHANICAL_EDGES) {
      const fromNode = STECCO_NODES_BY_ID[edge.from];
      const toNode = STECCO_NODES_BY_ID[edge.to];
      if (!fromNode || !toNode) continue;

      const p1 = new THREE.Vector3(...fromNode.coords);
      const p2 = new THREE.Vector3(...toNode.coords);
      const mid = p1.clone().add(p2).multiplyScalar(0.5);

      const radialOut = new THREE.Vector3(mid.x, 0, mid.z);
      if (radialOut.lengthSq() > 0.0001) {
        radialOut.normalize().multiplyScalar(0.015);
        mid.add(radialOut);
      }

      const curve = new THREE.CatmullRomCurve3([p1, mid, p2]);
      // Macro/Meso tube (0.0021m radius) for overview & mid zoom
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.0021, 8, false);
      // Micro filament (0.00085m radius) for close-up muscle inspection so muscle fibers stay clear
      const microTubeGeo = new THREE.TubeGeometry(curve, 20, 0.00085, 6, false);

      const fromUX = getNodeUX(fromNode);
      const isVictimBridge = toNode.roleType === 'CP';
      const baseTubeColor = isVictimBridge
        ? 0xf43f5e
        : fromUX.loopGroup === 'outgoing_front'
        ? 0xf59e0b
        : 0x06b6d4;

      const tubeMat = new THREE.MeshBasicMaterial({
        color: baseTubeColor,
        transparent: true,
        opacity: 0.78,
        depthTest: false,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      tubeMesh.renderOrder = 16;
      edgeTubeGroup.add(tubeMesh);

      const microTubeMat = new THREE.MeshBasicMaterial({
        color: baseTubeColor,
        transparent: true,
        opacity: 0.52,
        depthTest: false,
      });
      const microTubeMesh = new THREE.Mesh(microTubeGeo, microTubeMat);
      microTubeMesh.renderOrder = 16;
      microTubeMesh.visible = false;
      edgeTubeGroup.add(microTubeMesh);

      const pColor = isVictimBridge
        ? 0xfecdd3
        : fromUX.loopGroup === 'outgoing_front'
        ? 0xfef08a
        : 0xa5f3fc;

      const particles: THREE.Mesh[] = [];
      for (let k = 0; k < 2; k++) {
        const pMat = new THREE.MeshBasicMaterial({
          color: pColor,
          transparent: true,
          opacity: 0.9,
          depthTest: false,
        });
        const pMesh = new THREE.Mesh(particleGeo, pMat);
        pMesh.renderOrder = 19;
        pulseParticleGroup.add(pMesh);
        particles.push(pMesh);
      }

      edgeVisuals.push({
        edgeId: edge.id,
        fromId: edge.from,
        toId: edge.to,
        edgeLoopGroup: fromUX.loopGroup,
        isVictimBridge,
        curve,
        tubeMesh,
        microTubeMesh,
        particles,
        isEdgeFocused: true,
        isContextEdge: true,
        showParticles: true,
        baseTubeOpacity: 0.78,
      });
    }

    // 3. Load Curated BodyParts3D 4.0 Atlas with Memory Cache, Main-Thread Yielding & Layer Geometry Merging
    (async () => {
      try {
        const baseUrl = (import.meta as any).env?.BASE_URL || './';
        if (!cachedAtlasJson) {
          const res = await fetch(`${baseUrl}models/musculoskeletal-atlas.json`, {
            signal: abortController.signal,
          });
          if (!res.ok) throw new Error('无法加载 3D 肌肉骨骼解剖索引文件');
          cachedAtlasJson = await res.json();
        }
        const atlas = cachedAtlasJson!;

        const neededChunks = Array.from(
          new Set(atlas.parts.map((p) => p.chunk))
        ).sort((a, b) => a - b);
        let loadedCount = 0;

        // Collect unmapped background geometries by layer so 520+ background parts become just 5 merged meshes!
        const unmappedGeosByLayer: Record<AnatomicalLayer, THREE.BufferGeometry[]> = {
          skin: [],
          superficial_muscle: [],
          deep_muscle: [],
          fascia_connective: [],
          skeleton: [],
        };

        for (const chunkIndex of neededChunks) {
          let buffer = cachedChunkBuffers.get(chunkIndex);
          if (!buffer) {
            const binRes = await fetch(`${baseUrl}models/body-${chunkIndex}.bin`, {
              signal: abortController.signal,
            });
            if (!binRes.ok)
              throw new Error(`无法加载解剖网格分块 body-${chunkIndex}.bin`);
            buffer = await binRes.arrayBuffer();
            cachedChunkBuffers.set(chunkIndex, buffer);
          }
          if (disposed) return;

          const chunkParts = atlas.parts.filter((p) => p.chunk === chunkIndex);
          for (const p of chunkParts) {
            const geo = new THREE.BufferGeometry();
            geo.setAttribute(
              'position',
              new THREE.BufferAttribute(
                new Float32Array(buffer, p.positions, p.vertexCount * 3),
                3
              )
            );
            geo.setAttribute(
              'normal',
              new THREE.BufferAttribute(
                new Int16Array(buffer, p.normals, p.vertexCount * 3),
                3,
                true
              )
            );
            geo.setIndex(
              new THREE.BufferAttribute(
                new Uint32Array(buffer, p.indices, p.indexCount),
                1
              )
            );

            const mappedNodes = findSteccoNodesByPartId(p.id);

            // If this part is NOT directly mapped to a Stecco node, batch it into its layer's merged geometry!
            if (mappedNodes.length === 0) {
              unmappedGeosByLayer[p.layer].push(geo);
              continue;
            }

            // Only compute bounding sphere on the ~95 interactive mapped Stecco muscles
            geo.computeBoundingSphere();

            const isFascia = p.layer === 'fascia_connective';
            const isDeep = p.layer === 'deep_muscle';
            const baseColor = isFascia
              ? 0x7dd3fc
              : isDeep
              ? 0x99352e
              : 0xb34b42;

            const mat = new THREE.MeshLambertMaterial({
              color: baseColor,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 1.0,
            });

            const mesh = new THREE.Mesh(geo, mat);
            mesh.userData = {
              partId: p.id,
              partName: p.name,
              layer: p.layer,
              baseColor,
              mappedNodeIds: mappedNodes.map((n) => n.id),
            };

            anatomyGroup.add(mesh);
            mappedPartMeshes.push(mesh);
          }

          loadedCount++;
          if (!disposed) {
            setLoadingProgress(
              Math.round((loadedCount / neededChunks.length) * 100)
            );
          }
          // Yield to browser main thread between chunks so UI stays responsive during load
          await new Promise((r) => setTimeout(r, 0));
        }

        if (disposed) return;

        // Merge all unmapped background parts into 1 single draw call per layer!
        const layerBaseColors: Record<AnatomicalLayer, number> = {
          skin: 0x94a3b8,
          skeleton: 0xd6cebf,
          fascia_connective: 0x7dd3fc,
          deep_muscle: 0x8f322b,
          superficial_muscle: 0xa8443b,
        };

        (Object.keys(unmappedGeosByLayer) as AnatomicalLayer[]).forEach(
          (layer) => {
            const geos = unmappedGeosByLayer[layer];
            if (geos.length === 0) return;
            const mergedGeo = mergeGeometries(geos, false);
            geos.forEach((g) => g.dispose());
            if (!mergedGeo) return;

            const isSkin = layer === 'skin';
            const mat = new THREE.MeshLambertMaterial({
              color: layerBaseColors[layer],
              // Use FrontSide on dimmed/transparent background meshes to cut GPU overdraw in half
              side: isSkin ? THREE.FrontSide : THREE.DoubleSide,
              transparent: true,
              opacity: isSkin ? 0.04 : 0.25,
              depthWrite: false,
            });

            const mergedMesh = new THREE.Mesh(mergedGeo, mat);
            mergedMesh.userData = {
              partId: `merged_${layer}`,
              partName:
                layer === 'skeleton'
                  ? '骨骼参考标志 (点击自动定位最近筋膜点)'
                  : '周边背景肌群 (点击自动定位最近筋膜点)',
              layer,
              baseColor: layerBaseColors[layer],
              mappedNodeIds: [] as string[],
              isMergedBackground: true,
            };

            anatomyGroup.add(mergedMesh);
            mergedBackgroundMeshes.push(mergedMesh);
          }
        );

        materialsDirtyRef.current = true;
        labelsDirtyRef.current = true;
        setIsLoaded(true);
      } catch (err: any) {
        if (!disposed) {
          setLoadError(err?.message ?? '加载 3D 解剖模型失败');
        }
      }
    })();

    // 4. Fast Throttled Raycasting (Only checks ~95 mapped muscles & 35 beacons on hover!)
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };
    let lastHoverRaycastTime = 0;

    const getIntersects = (
      clientX: number,
      clientY: number,
      includeBackground = false
    ) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      // 1. Check visible Stecco 3D Node Beacons first (super fast: only 35 small spheres)
      const markerCandidates: THREE.Object3D[] = [];
      nodeMeshes.forEach(({ core, halo }) => {
        if (core.visible) markerCandidates.push(core, halo);
      });
      const markerHits = raycaster.intersectObjects(markerCandidates, false);
      if (markerHits.length > 0) {
        const nid = markerHits[0].object.userData?.steccoNodeId;
        if (nid) return { type: 'node' as const, nodeId: nid };
      }

      // 2. Check visible mapped Stecco muscles (~95 meshes instead of 624!)
      const activeMappedMeshes = mappedPartMeshes.filter((m) => {
        if (!m.visible) return false;
        const mat = m.material as THREE.MeshLambertMaterial;
        return mat.opacity >= 0.2;
      });

      const meshHits = raycaster.intersectObjects(activeMappedMeshes, false);
      if (meshHits.length > 0) {
        const hitMesh = meshHits[0].object as THREE.Mesh;
        return {
          type: 'mesh' as const,
          partId: hitMesh.userData.partId as string,
          partName: hitMesh.userData.partName as string,
          mappedNodeIds: hitMesh.userData.mappedNodeIds as string[],
          hitPoint: meshHits[0].point,
        };
      }

      // 3. Only check merged background skeleton/muscles on actual click, NEVER on mousemove hover!
      if (includeBackground) {
        const bgCandidates = mergedBackgroundMeshes.filter(
          (m) => m.visible && m.userData.layer !== 'skin'
        );
        const bgHits = raycaster.intersectObjects(bgCandidates, false);
        if (bgHits.length > 0) {
          const hitMesh = bgHits[0].object as THREE.Mesh;
          return {
            type: 'mesh' as const,
            partId: hitMesh.userData.partId as string,
            partName: hitMesh.userData.partName as string,
            mappedNodeIds: [] as string[],
            hitPoint: bgHits[0].point,
          };
        }
      }

      return null;
    };

    const activeTouchIds = new Set<number>();
    let wasMultiTouch = false;

    const handlePointerDown = (e: PointerEvent) => {
      activeTouchIds.add(e.pointerId);
      if (activeTouchIds.size > 1) {
        wasMultiTouch = true;
      } else {
        wasMultiTouch = false;
        pointerDownPos = { x: e.clientX, y: e.clientY };
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      // Skip hover raycast on touch devices or while dragging OrbitControls
      if (e.pointerType === 'touch' || isOrbitDragging || activeTouchIds.size > 0)
        return;
      const now = performance.now();
      if (now - lastHoverRaycastTime < 55) return; // Throttle hover raycast to max 18fps
      lastHoverRaycastTime = now;

      const hit = getIntersects(e.clientX, e.clientY, false);
      if (!hit) {
        if (renderer.domElement.style.cursor !== 'grab') {
          renderer.domElement.style.cursor = 'grab';
        }
        setHoveredInfo((prev) => (prev === null ? null : null));
        return;
      }
      if (hit.type === 'node') {
        renderer.domElement.style.cursor = 'pointer';
        const node = STECCO_NODES_BY_ID[hit.nodeId];
        setHoveredInfo({
          partName: `${node.code} · ${node.nameZh}`,
          mappedNode: node,
        });
      } else {
        const mappedNode =
          hit.mappedNodeIds.length > 0
            ? STECCO_NODES_BY_ID[hit.mappedNodeIds[0]]
            : undefined;
        renderer.domElement.style.cursor = mappedNode ? 'pointer' : 'crosshair';
        setHoveredInfo({
          partName: hit.partName,
          mappedNode,
        });
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      activeTouchIds.delete(e.pointerId);
      if (wasMultiTouch) {
        if (activeTouchIds.size === 0) wasMultiTouch = false;
        return;
      }

      const moveDist = Math.hypot(
        e.clientX - pointerDownPos.x,
        e.clientY - pointerDownPos.y
      );
      const maxTapTolerance = e.pointerType === 'touch' ? 14 : 6;
      if (moveDist > maxTapTolerance) return;

      const hit = getIntersects(e.clientX, e.clientY, true);
      if (!hit) return;

      if (hit.type === 'node') {
        onSelectRef.current(hit.nodeId);
      } else if (hit.mappedNodeIds.length > 0) {
        onSelectRef.current(hit.mappedNodeIds[0], hit.partName);
      } else {
        let nearestId = 'RE-TH';
        let bestDist = Infinity;
        for (const node of STECCO_NODES) {
          const d = hit.hitPoint.distanceTo(new THREE.Vector3(...node.coords));
          if (d < bestDist) {
            bestDist = d;
            nearestId = node.id;
          }
        }
        onSelectRef.current(nearestId, hit.partName);
      }
    };

    const handlePointerCancel = (e: PointerEvent) => {
      activeTouchIds.delete(e.pointerId);
    };

    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('pointercancel', handlePointerCancel);

    const handleResize = () => {
      if (!container || container.clientWidth === 0 || container.clientHeight === 0) return;
      camera.aspect =
        container.clientWidth / Math.max(1, container.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      labelsDirtyRef.current = true;
    };
    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 5. Event-Driven Material Updater (Only runs when state changes, NOT 60 times/sec!)
    const tempColor = new THREE.Color();
    const projVec = new THREE.Vector3();
    const lastCameraPos = new THREE.Vector3();
    const lastCameraTarget = new THREE.Vector3();
    let lastLabelSync = 0;

    const syncSceneMaterials = () => {
      const {
        selectedNodeId: selId,
        activeStepIndex: stepIdx,
        loopFocusFilter: loopFilter,
        flowSpeedMode: speedMode,
        diagnosticReport: report,
        layerVisibility: vis,
      } = stateRef.current;

      const activeStep =
        stepIdx !== null ? report.prescriptionSteps[stepIdx] ?? null : null;
      const activeStepNodeId = activeStep?.node.id ?? null;

      // Compute Spotlight Focus Node Set & Edge Set + Full-Chain Context Sets
      const focusNodeSet = new Set<string>();
      const focusEdgeSet = new Set<string>();
      const contextNodeSet = new Set<string>();
      const contextEdgeSet = new Set<string>();

      contextNodeSet.add(selId);
      for (const s of report.prescriptionSteps) {
        contextNodeSet.add(s.node.id);
        for (const pid of s.transmissionPathIds) {
          contextNodeSet.add(pid);
        }
      }

      if (loopFilter === 'single_step' && activeStep) {
        for (const pid of activeStep.transmissionPathIds) {
          focusNodeSet.add(pid);
        }
        focusNodeSet.add(activeStep.node.id);
        focusNodeSet.add(selId);
      } else if (loopFilter === 'outgoing_front') {
        focusNodeSet.add(selId);
        focusNodeSet.add('RE-SC');
        for (const node of STECCO_NODES) {
          if (getNodeUX(node).loopGroup === 'outgoing_front') {
            focusNodeSet.add(node.id);
          }
        }
      } else if (loopFilter === 'returning_back') {
        focusNodeSet.add(selId);
        focusNodeSet.add('RE-SC');
        for (const node of STECCO_NODES) {
          if (getNodeUX(node).loopGroup === 'returning_back') {
            focusNodeSet.add(node.id);
          }
        }
      } else {
        for (const id of contextNodeSet) {
          focusNodeSet.add(id);
        }
      }

      for (const ev of edgeVisuals) {
        const inDiagnostic = report.highlightedEdgeIds.includes(ev.edgeId);
        if (
          inDiagnostic ||
          (contextNodeSet.has(ev.fromId) && contextNodeSet.has(ev.toId))
        ) {
          contextEdgeSet.add(ev.edgeId);
        }
        if (loopFilter === 'single_step' && activeStep) {
          const path = activeStep.transmissionPathIds;
          let isStepEdge = false;
          for (let i = 0; i < path.length - 1; i++) {
            if (ev.fromId === path[i] && ev.toId === path[i + 1]) {
              isStepEdge = true;
              break;
            }
          }
          if (isStepEdge) focusEdgeSet.add(ev.edgeId);
        } else if (loopFilter === 'outgoing_front') {
          if (
            focusNodeSet.has(ev.fromId) &&
            focusNodeSet.has(ev.toId) &&
            (ev.edgeLoopGroup === 'outgoing_front' || ev.isVictimBridge)
          ) {
            focusEdgeSet.add(ev.edgeId);
          }
        } else if (loopFilter === 'returning_back') {
          if (
            focusNodeSet.has(ev.fromId) &&
            focusNodeSet.has(ev.toId) &&
            (ev.edgeLoopGroup === 'returning_back' || ev.isVictimBridge)
          ) {
            focusEdgeSet.add(ev.edgeId);
          }
        } else {
          if (
            inDiagnostic ||
            (focusNodeSet.has(ev.fromId) && focusNodeSet.has(ev.toId))
          ) {
            focusEdgeSet.add(ev.edgeId);
          }
        }
      }

      const activeStepPathSet = new Set<string>(
        activeStep ? activeStep.transmissionPathIds : []
      );

      // A. Update the 5 Merged Background Meshes
      for (const bgMesh of mergedBackgroundMeshes) {
        const layer = bgMesh.userData.layer as AnatomicalLayer;
        const mat = bgMesh.material as THREE.MeshLambertMaterial;

        let layerShown = true;
        if (layer === 'skin') layerShown = vis.skin;
        else if (layer === 'superficial_muscle')
          layerShown = vis.superficial_muscle;
        else if (layer === 'deep_muscle') layerShown = vis.deep_muscle;
        else if (layer === 'fascia_connective')
          layerShown = vis.fascia_connective;
        else if (layer === 'skeleton') layerShown = vis.skeleton;

        bgMesh.visible = layerShown;
        if (!layerShown) continue;

        if (layer === 'skin') {
          mat.opacity = vis.spotlightDimming ? 0.025 : 0.05;
        } else if (layer === 'skeleton') {
          if (vis.spotlightDimming) {
            mat.color.setHex(0x8892a6);
            mat.transparent = true;
            mat.opacity = 0.24;
            mat.depthWrite = false;
          } else {
            mat.color.setHex(bgMesh.userData.baseColor);
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.depthWrite = true;
          }
        } else {
          // Unmapped background muscles
          if (vis.spotlightDimming) {
            mat.color.setHex(0x1e2436);
            mat.transparent = true;
            mat.opacity = 0.08;
            mat.depthWrite = false;
          } else if (layer === 'superficial_muscle' && vis.xraySuperficial) {
            mat.color.setHex(bgMesh.userData.baseColor);
            mat.transparent = true;
            mat.opacity = 0.18;
            mat.depthWrite = false;
          } else {
            mat.color.setHex(bgMesh.userData.baseColor);
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.depthWrite = true;
          }
        }
      }

      // B. Update the ~95 Mapped Stecco Meshes & record the 1-2 pulsing meshes
      pulsingMeshes = [];
      for (const mesh of mappedPartMeshes) {
        const layer = mesh.userData.layer as AnatomicalLayer;
        const mat = mesh.material as THREE.MeshLambertMaterial;
        const mappedIds = mesh.userData.mappedNodeIds as string[];

        let layerShown = true;
        if (layer === 'superficial_muscle') layerShown = vis.superficial_muscle;
        else if (layer === 'deep_muscle') layerShown = vis.deep_muscle;
        else if (layer === 'fascia_connective')
          layerShown = vis.fascia_connective;

        mesh.visible = layerShown;
        if (!layerShown) continue;

        const isFocusedMuscle = mappedIds.some((id) => focusNodeSet.has(id));
        const isContextMuscle = mappedIds.some((id) => contextNodeSet.has(id));
        const isOnActiveStepPath =
          activeStepPathSet.size > 0 &&
          mappedIds.some((id) => activeStepPathSet.has(id));
        const isActiveStepMuscle =
          activeStepNodeId !== null && mappedIds.includes(activeStepNodeId);
        const isTargetMuscle = mappedIds.includes(selId);

        if (vis.spotlightDimming && !isFocusedMuscle) {
          if (isContextMuscle) {
            // Keep full-loop muscles as a soft legible anatomical silhouette even in single_step focus
            const cNode = STECCO_NODES_BY_ID[mappedIds[0]];
            const cUx = cNode ? getNodeUX(cNode) : null;
            mat.color.setHex(
              cUx?.loopGroup === 'outgoing_front' ? 0x78350f : 0x155e75
            );
            mat.emissive.setHex(0x000000);
            mat.transparent = true;
            mat.opacity = 0.24;
            mat.depthWrite = false;
          } else {
            mat.color.setHex(0x1e2436);
            mat.emissive.setHex(0x000000);
            mat.transparent = true;
            mat.opacity = 0.085;
            mat.depthWrite = false;
          }
          continue;
        }

        if (
          vis.spotlightDimming &&
          activeStepPathSet.size > 0 &&
          !isOnActiveStepPath &&
          !isActiveStepMuscle &&
          !isTargetMuscle
        ) {
          const pNode = STECCO_NODES_BY_ID[mappedIds[0]];
          const ux = pNode ? getNodeUX(pNode) : null;
          mat.color.setHex(
            ux?.loopGroup === 'outgoing_front' ? 0x78350f : 0x164e63
          );
          mat.emissive.setHex(0x000000);
          mat.transparent = true;
          mat.opacity = 0.26;
          mat.depthWrite = false;
          continue;
        }

        const primaryNodeId = mappedIds[0];
        const nodeMeta = primaryNodeId
          ? STECCO_NODES_BY_ID[primaryNodeId]
          : undefined;
        const ux = nodeMeta ? getNodeUX(nodeMeta) : undefined;

        if (
          layer === 'superficial_muscle' &&
          vis.xraySuperficial &&
          !isActiveStepMuscle &&
          !isTargetMuscle
        ) {
          mat.transparent = true;
          mat.opacity = vis.spotlightDimming ? 0.35 : 0.18;
          mat.depthWrite = false;
        } else {
          mat.transparent = false;
          mat.opacity = 1.0;
          mat.depthWrite = true;
        }

        tempColor.setHex(mesh.userData.baseColor);

        if (isActiveStepMuscle) {
          tempColor.lerp(new THREE.Color(0xfacc15), 0.78);
          mat.emissive.setHex(0xd97706);
          mat.emissiveIntensity = 0.6;
          pulsingMeshes.push({ mesh, isStep: true });
        } else if (isTargetMuscle) {
          const isCp = nodeMeta?.roleType === 'CP';
          tempColor.lerp(new THREE.Color(isCp ? 0xf43f5e : 0x38bdf8), 0.75);
          mat.emissive.setHex(isCp ? 0xbe123c : 0x0284c7);
          mat.emissiveIntensity = 0.52;
          pulsingMeshes.push({ mesh, isStep: false });
        } else if (isFocusedMuscle && ux) {
          const roleColor =
            nodeMeta?.roleType === 'CP'
              ? 0xf43f5e
              : ux.loopGroup === 'outgoing_front'
              ? 0xf59e0b
              : ux.loopGroup === 'returning_back'
              ? 0x06b6d4
              : 0xa855f7;
          tempColor.lerp(new THREE.Color(roleColor), 0.62);
          mat.emissive.setHex(roleColor);
          mat.emissiveIntensity = 0.28;
        } else {
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
        }

        mat.color.copy(tempColor);
      }

      // C. Update Node Beacons Visibility & Base Scale/Opacity (Zoom-adaptive scaling applied in animate)
      nodeMeshes.forEach((entry, nodeId) => {
        const { core, halo, ring } = entry;
        const isSelected = nodeId === selId;
        const isActiveStep = nodeId === activeStepNodeId;
        const isFocused = focusNodeSet.has(nodeId);
        const isContextNode = contextNodeSet.has(nodeId);
        const isOnStepPath =
          activeStepPathSet.size === 0 || activeStepPathSet.has(nodeId);

        const showBeacon =
          vis.showAllLabels ||
          !vis.spotlightDimming ||
          isFocused ||
          isContextNode ||
          isSelected ||
          isActiveStep;

        core.visible = showBeacon;
        halo.visible = showBeacon;
        ring.visible = showBeacon;
        if (!showBeacon) return;

        const baseScale = isActiveStep
          ? 1.38
          : isSelected
          ? 1.28
          : isOnStepPath && isFocused
          ? 1.05
          : 0.68;
        entry.baseScale = baseScale;

        const coreMat = core.material as THREE.MeshBasicMaterial;
        const dimmedByStep =
          activeStepPathSet.size > 0 &&
          !isOnStepPath &&
          !isSelected &&
          !isActiveStep;

        coreMat.opacity = dimmedByStep ? 0.35 : 0.96;
        entry.baseHaloOpacity =
          isActiveStep || isSelected ? 0.42 : dimmedByStep ? 0.08 : 0.24;

        const ringMat = ring.material as THREE.MeshBasicMaterial;
        if (isActiveStep || isSelected) {
          entry.baseRingOpacity = 0.92;
          ringMat.color.setHex(isActiveStep ? 0xfacc15 : 0xf43f5e);
        } else if (isOnStepPath && isFocused) {
          entry.baseRingOpacity = 0.48;
          ringMat.color.setHex(0xffffff);
        } else {
          entry.baseRingOpacity = 0;
        }
        ringMat.opacity = entry.baseRingOpacity;
      });

      // D. Update Edge Tube Visibility & Base Opacity (Dual-LOD Macro/Micro switched by zoom distance)
      for (const ev of edgeVisuals) {
        const isEdgeFocused = focusEdgeSet.has(ev.edgeId);
        const isStepPathEdge = Boolean(
          activeStep &&
            (() => {
              const path = activeStep.transmissionPathIds;
              for (let i = 0; i < path.length - 1; i++) {
                if (ev.fromId === path[i] && ev.toId === path[i + 1])
                  return true;
              }
              return false;
            })()
        );

        ev.isEdgeFocused = isEdgeFocused;
        ev.isContextEdge = contextEdgeSet.has(ev.edgeId);

        if (!isEdgeFocused) {
          ev.baseTubeOpacity = ev.isContextEdge ? 0.22 : 0.05;
        } else if (activeStep && !isStepPathEdge && loopFilter === 'full_loop') {
          ev.baseTubeOpacity = 0.28;
        } else {
          ev.baseTubeOpacity = 0.9;
        }

        ev.showParticles =
          isEdgeFocused &&
          speedMode !== 'paused' &&
          (!activeStep || isStepPathEdge || loopFilter !== 'full_loop');

        ev.particles.forEach((pMesh) => {
          pMesh.visible = ev.showParticles;
        });
      }
    };

    // 6. Ultra-Lightweight Animation Loop with Map-Style Multi-Level Zoom LOD
    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const {
        selectedNodeId: selId,
        activeStepIndex: stepIdx,
        loopFocusFilter: loopFilter,
        flowSpeedMode: speedMode,
        fieldState: fState,
        diagnosticReport: report,
        layerVisibility: vis,
      } = stateRef.current;

      if (cameraTargetGoalRef.current.animating) {
        camera.position.lerp(cameraTargetGoalRef.current.pos, 0.09);
        controls.target.lerp(cameraTargetGoalRef.current.target, 0.09);
        if (
          camera.position.distanceTo(cameraTargetGoalRef.current.pos) < 0.008 &&
          controls.target.distanceTo(cameraTargetGoalRef.current.target) < 0.008
        ) {
          cameraTargetGoalRef.current.animating = false;
        }
      }
      controls.update();

      // Re-sync material states ONLY when state actually changed
      if (materialsDirtyRef.current) {
        materialsDirtyRef.current = false;
        syncSceneMaterials();
      }

      // Compute camera zoom distance & Map LOD Tier (L1 Macro -> L2 Meso -> L3 Micro Close-Up)
      const camDist = camera.position.distanceTo(controls.target);
      const nextTier: 'L1_MACRO' | 'L2_MESO' | 'L3_MICRO' =
        camDist > 0.78
          ? 'L1_MACRO'
          : camDist >= 0.48
          ? 'L2_MESO'
          : 'L3_MICRO';
      if (nextTier !== lastZoomTierRef.current) {
        lastZoomTierRef.current = nextTier;
        setZoomLodTier(nextTier);
        labelsDirtyRef.current = true;
      }

      // Gently pulse ONLY the 1-2 active target muscles (instead of all 624 meshes!)
      if (pulsingMeshes.length > 0) {
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 3.0);
        for (const item of pulsingMeshes) {
          const mat = item.mesh.material as THREE.MeshLambertMaterial;
          mat.emissiveIntensity = item.isStep
            ? 0.45 + pulse * 0.3
            : 0.4 + pulse * 0.2;
        }
      }

      // Map-Style Distance-Adaptive Scaling for 3D Node Beacons (Core, Halo, Ring)
      // As you zoom in closer to inspect muscle fibers, world radius scales down ~d^0.88
      // and the glowing halo fades away so the underlying muscle tissue is never obscured!
      const activeStep =
        stepIdx !== null ? report.prescriptionSteps[stepIdx] ?? null : null;
      const activeStepNodeId = activeStep?.node.id ?? null;

      nodeMeshes.forEach((entry, nodeId) => {
        const { core, halo, ring, baseScale, baseHaloOpacity } = entry;
        if (!core.visible) return;

        const nodeDist = camera.position.distanceTo(core.position);
        const distNorm = THREE.MathUtils.clamp(nodeDist / 0.95, 0.14, 1.35);
        const coreZoomFactor = Math.pow(distNorm, 0.88);
        const haloZoomFactor = Math.pow(distNorm, 1.15);
        // Smoothly fade out the outer glowing halo when zoomed closer than 0.65m
        const closeUpHaloFade = THREE.MathUtils.smoothstep(
          nodeDist,
          0.24,
          0.68
        );

        core.scale.setScalar(baseScale * coreZoomFactor);
        halo.scale.setScalar(baseScale * 1.15 * haloZoomFactor);

        const haloMat = halo.material as THREE.MeshBasicMaterial;
        haloMat.opacity = baseHaloOpacity * (0.06 + 0.94 * closeUpHaloFade);

        ring.lookAt(camera.position);
        if (nodeId === activeStepNodeId || nodeId === selId) {
          const ringPulse = 1.24 + 0.2 * Math.sin(elapsed * 3.0);
          ring.scale.setScalar(ringPulse * coreZoomFactor);
        } else {
          ring.scale.setScalar(1.02 * coreZoomFactor);
        }
      });

      // Map-Style Dual-LOD Transmission Tubes & Distance-Adaptive Flow Particles
      const isMicroCloseUp = camDist < 0.54;
      const macroOpacityAtten =
        0.58 + 0.42 * THREE.MathUtils.smoothstep(camDist, 0.48, 0.9);
      const particleZoomScale = Math.pow(
        THREE.MathUtils.clamp(camDist / 0.95, 0.16, 1.25),
        0.88
      );

      for (const ev of edgeVisuals) {
        const edgeShown =
          ev.isEdgeFocused || ev.isContextEdge || !vis.spotlightDimming;
        if (!edgeShown) {
          ev.tubeMesh.visible = false;
          ev.microTubeMesh.visible = false;
          continue;
        }

        if (isMicroCloseUp) {
          // Close-up muscle inspection: switch to ultra-fine 0.85mm filament so muscle belly stays clear
          ev.tubeMesh.visible = false;
          ev.microTubeMesh.visible = true;
          const microMat = ev.microTubeMesh.material as THREE.MeshBasicMaterial;
          microMat.opacity = ev.baseTubeOpacity * 0.62;
        } else {
          ev.tubeMesh.visible = true;
          ev.microTubeMesh.visible = false;
          const macroMat = ev.tubeMesh.material as THREE.MeshBasicMaterial;
          macroMat.opacity = ev.baseTubeOpacity * macroOpacityAtten;
        }
      }

      if (speedMode !== 'paused') {
        const speedMultiplier = speedMode === 'slow' ? 0.75 : 1.35;
        for (const ev of edgeVisuals) {
          if (!ev.showParticles) continue;
          const srcState = fState[ev.fromId];
          const strength = srcState ? srcState.adhesion : 0.5;
          const speed = (0.075 + strength * 0.065) * speedMultiplier;

          ev.particles.forEach((pMesh, idx) => {
            const t = (elapsed * speed + idx * 0.5) % 1.0;
            ev.curve.getPointAt(t, pMesh.position);
            const envelope = Math.sin(t * Math.PI);
            pMesh.scale.setScalar(
              (0.72 + 0.42 * envelope) * particleZoomScale
            );
          });
        }
      }

      renderer.render(scene, camera);

      // 7. Only recompute 2D Projected Labels when camera actually moved or state changed!
      const cameraMoved =
        lastCameraPos.distanceToSquared(camera.position) > 0.00002 ||
        lastCameraTarget.distanceToSquared(controls.target) > 0.00002;

      if (
        (cameraMoved || labelsDirtyRef.current) &&
        elapsed - lastLabelSync > 0.06
      ) {
        lastLabelSync = elapsed;
        lastCameraPos.copy(camera.position);
        lastCameraTarget.copy(controls.target);
        labelsDirtyRef.current = false;

        const rect = renderer.domElement.getBoundingClientRect();
        const rawLabels: ProjectedLabel[] = [];
        const stepNumberByNodeId = new Map<string, number>();
        report.prescriptionSteps.forEach((s) =>
          stepNumberByNodeId.set(s.node.id, s.stepNumber)
        );
        const activeStepPathSet = new Set<string>(
          activeStep ? activeStep.transmissionPathIds : []
        );

        // At close-up zoom (L3_MICRO), push 2D badges further aside so the muscle belly under the pin is unobstructed
        const labelOffsetScale = camDist < 0.54 ? 1.45 : 1.0;

        for (const node of STECCO_NODES) {
          const isSelected = node.id === selId;
          const isActiveStep = node.id === activeStepNodeId;
          const stepNum = stepNumberByNodeId.get(node.id) ?? null;
          const ux = getNodeUX(node);

          projVec.set(...node.coords);
          const nodeDistToCam = camera.position.distanceTo(projVec);

          let shouldShow = false;
          if (vis.showAllLabels) {
            shouldShow = true;
          } else if (loopFilter === 'single_step' && activeStep) {
            shouldShow =
              activeStepPathSet.has(node.id) || isSelected || isActiveStep;
          } else if (loopFilter === 'outgoing_front') {
            shouldShow =
              isSelected ||
              isActiveStep ||
              activeStepPathSet.has(node.id) ||
              (activeStepPathSet.size === 0 &&
                stepNum !== null &&
                stepNum <= 5 &&
                ux.loopGroup === 'outgoing_front');
          } else if (loopFilter === 'returning_back') {
            shouldShow =
              isSelected ||
              isActiveStep ||
              activeStepPathSet.has(node.id) ||
              (activeStepPathSet.size === 0 &&
                stepNum !== null &&
                stepNum <= 5 &&
                ux.loopGroup === 'returning_back');
          } else if (activeStepPathSet.size > 0) {
            // Smart Step Focus: Only display labels directly relevant to the current release step & its pull chain!
            // Other muscles remain visible & clickable as 3D pins on the anatomy model.
            shouldShow =
              activeStepPathSet.has(node.id) || isSelected || isActiveStep;
          } else if (stateRef.current.cameraPreset === 'scapula_closeup') {
            shouldShow =
              POSTERIOR_SCAPULAR_NODE_IDS.has(node.id) ||
              isSelected ||
              (vis.xraySuperficial &&
                (node.id === 'AN-SC' || node.id === 'IR-SC'));
          } else {
            shouldShow =
              isSelected ||
              isActiveStep ||
              (stepNum !== null && stepNum <= 5);
          }

          if (!shouldShow) continue;

          projVec.project(camera);

          const inFrustum = projVec.z >= -1 && projVec.z <= 1;
          const pinX = (projVec.x * 0.5 + 0.5) * rect.width;
          const pinY = (-(projVec.y * 0.5) + 0.5) * rect.height;

          const visible =
            inFrustum &&
            pinX > 40 &&
            pinX < rect.width - 40 &&
            pinY > 70 &&
            pinY < rect.height - 40;

          if (!visible) continue;

          const initialOffsetX =
            (ux.loopGroup === 'outgoing_front'
              ? 30
              : ux.loopGroup === 'returning_back'
              ? -30
              : 0) * labelOffsetScale;
          const initialOffsetY = (isSelected ? 28 : -28) * labelOffsetScale;

          const nState = fState[node.id];
          rawLabels.push({
            id: node.id,
            code: node.code,
            nameZh: node.muscleGroupZh.split('、')[0].split('（')[0],
            roleType: node.roleType,
            loopGroup: ux.loopGroup,
            pinX,
            pinY,
            labelX: pinX + initialOffsetX,
            labelY: pinY + initialOffsetY,
            visible: true,
            isSelected,
            isCulprit: report.upstreamCulpritIds.includes(node.id),
            isActiveStep,
            stepIndex: stepNum,
            strain: nState?.totalStrain ?? 0,
            adhesion: nState?.adhesion ?? 0,
          });
        }

        // Multi-pass 2D AABB repulsion solver + HUD safe-zone clamping
        const minW = 186;
        const minH = 44;
        const hasRightDock = stateRef.current.hasRightFloatingDock;
        const minLeftX = 102;
        const maxRightX = hasRightDock
          ? Math.max(260, rect.width - 485)
          : rect.width - 102;
        const minTopY = 128;
        const maxBottomY = rect.height - 76;

        for (let iter = 0; iter < 24; iter++) {
          for (let i = 0; i < rawLabels.length; i++) {
            for (let j = i + 1; j < rawLabels.length; j++) {
              const a = rawLabels[i];
              const b = rawLabels[j];
              const dx = b.labelX - a.labelX;
              const dy = b.labelY - a.labelY;
              if (Math.abs(dx) < minW && Math.abs(dy) < minH) {
                const overlapY = minH - Math.abs(dy);
                const pushY = (overlapY * 0.58 + 2.0) * (dy >= 0 ? 1 : -1);
                a.labelY -= pushY;
                b.labelY += pushY;

                const overlapX = minW - Math.abs(dx);
                if (overlapX > 36) {
                  const pushX = overlapX * 0.18 * (dx >= 0 ? 1 : -1);
                  a.labelX -= pushX;
                  b.labelX += pushX;
                }
              }
            }
          }
          for (const lbl of rawLabels) {
            lbl.labelX = Math.max(minLeftX, Math.min(maxRightX, lbl.labelX));
            lbl.labelY = Math.max(minTopY, Math.min(maxBottomY, lbl.labelY));
          }
        }

        setProjectedLabels(rawLabels);
      }
    };

    animate();

    return () => {
      disposed = true;
      abortController.abort();
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      controls.removeEventListener('start', onControlStart);
      controls.removeEventListener('end', onControlEnd);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950">
      {/* WebGL Canvas Host */}
      <div ref={containerRef} className="w-full h-full" />

      {/* SVG Leader Lines connecting displaced 2D badges to their exact 3D Anatomical Pins */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full z-10 overflow-visible">
        {projectedLabels.map((lbl) => {
          if (!lbl.visible) return null;
          const dist = Math.hypot(lbl.labelX - lbl.pinX, lbl.labelY - lbl.pinY);
          const strokeColor = lbl.isActiveStep
            ? '#facc15'
            : lbl.roleType === 'CP'
            ? '#f43f5e'
            : lbl.loopGroup === 'outgoing_front'
            ? '#f59e0b'
            : '#22d3ee';
          return (
            <g key={`leader-${lbl.id}`}>
              {dist > 14 && (
                <line
                  x1={lbl.pinX}
                  y1={lbl.pinY}
                  x2={lbl.labelX}
                  y2={lbl.labelY}
                  stroke={strokeColor}
                  strokeWidth={lbl.isActiveStep || lbl.isSelected ? 1.8 : 1.2}
                  strokeDasharray={
                    lbl.isActiveStep || lbl.isSelected ? undefined : '3 2'
                  }
                  strokeOpacity={0.75}
                />
              )}
              <circle
                cx={lbl.pinX}
                cy={lbl.pinY}
                r={lbl.isActiveStep || lbl.isSelected ? 4 : 2.8}
                fill={strokeColor}
              />
            </g>
          );
        })}
      </svg>

      {/* De-cluttered, Anti-Collided 3D Anatomical Node Badges (High-Contrast White Validator HUD Pills) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-20">
        {projectedLabels.map(
          (lbl) =>
            lbl.visible && (
              <button
                key={lbl.id}
                type="button"
                onClick={() => {
                  if (lbl.stepIndex !== null && onSelectStepIndex) {
                    onSelectStepIndex(lbl.stepIndex - 1);
                  } else {
                    onSelectNode(lbl.id);
                  }
                }}
                style={{
                  transform: `translate3d(${Math.round(lbl.labelX)}px, ${Math.round(lbl.labelY)}px, 0) translate(-50%, -50%)`,
                }}
                className={`pointer-events-auto absolute left-0 top-0 flex items-center gap-1.5 rounded-full font-extrabold text-white transition-all duration-150 hover:scale-105 backdrop-blur-md border ${
                  zoomLodTier === 'L3_MICRO' &&
                  !lbl.isActiveStep &&
                  !lbl.isSelected
                    ? 'px-2 py-0.5 text-[11px] opacity-85 hover:opacity-100'
                    : 'px-3 py-1 text-xs'
                } ${
                  lbl.isActiveStep
                    ? 'z-30 bg-sky-600 text-white border-2 border-white ring-2 ring-cyan-300/70 shadow-[0_4px_20px_rgba(14,165,233,0.75)] scale-105'
                    : lbl.isSelected
                    ? 'z-30 bg-rose-600 text-white border-2 border-white ring-2 ring-rose-400/70 shadow-[0_4px_20px_rgba(225,29,72,0.75)]'
                    : lbl.loopGroup === 'outgoing_front'
                    ? 'z-20 bg-[#0B0F19]/95 text-white border-amber-400 shadow-[0_4px_16px_rgba(0,0,0,0.85)] hover:bg-[#161F30]'
                    : lbl.loopGroup === 'returning_back'
                    ? 'z-20 bg-[#0B0F19]/95 text-white border-cyan-400 shadow-[0_4px_16px_rgba(0,0,0,0.85)] hover:bg-[#161F30]'
                    : 'z-10 bg-[#0B0F19]/95 text-white border-white/30 shadow-xl hover:border-cyan-400'
                }`}
              >
                {lbl.stepIndex !== null && (
                  <span
                    className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-black ${
                      lbl.isActiveStep
                        ? 'bg-white text-slate-950'
                        : lbl.loopGroup === 'outgoing_front'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-cyan-400 text-slate-950'
                    }`}
                  >
                    {lbl.stepIndex}
                  </span>
                )}
                <span className="font-mono font-black tracking-tight text-white">
                  {lbl.code}
                </span>
                <span className="truncate max-w-[92px] font-extrabold text-white">
                  {lbl.nameZh}
                </span>
                {lbl.isActiveStep ? (
                  <span className="rounded bg-white/25 px-1.5 py-0.5 text-[10px] text-white font-black border border-white/60">
                    当前按压
                  </span>
                ) : lbl.isSelected ? (
                  <span className="rounded bg-black/35 px-1.5 py-0.5 text-[10px] text-white font-black border border-white/40">
                    目标痛点
                  </span>
                ) : lbl.roleType === 'CP' ? (
                  <span className="rounded bg-black/35 px-1.5 py-0.5 text-[10px] text-white font-black border border-white/40">
                    受拉痛点
                  </span>
                ) : (
                  <span className="rounded bg-white/15 px-1 py-0.5 text-[10px] text-white font-mono font-extrabold">
                    {Math.round(lbl.adhesion * 100)}%
                  </span>
                )}
              </button>
            )
        )}
      </div>

      {/* Loading Progress Overlay */}
      {!isLoaded && !loadError && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#070A12]/92 backdrop-blur-md">
          <div className="w-72 rounded-2xl border border-white/20 bg-[#0D1322] p-6 shadow-2xl text-center">
            <div className="mb-2 text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
              BodyParts3D 4.0 Medical Mesh Engine
            </div>
            <div className="mb-4 text-sm font-bold text-white">
              正在构建与合并三维肌肉骨骼网格...
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-500 transition-all duration-200"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="mt-2 text-right font-mono text-xs font-bold text-white">
              {loadingProgress}%
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {loadError && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/90 p-6">
          <div className="max-w-md rounded-xl border border-rose-500/40 bg-rose-950/40 p-5 text-white">
            <div className="font-bold mb-1">3D 模型加载异常</div>
            <div className="text-xs opacity-90">{loadError}</div>
          </div>
        </div>
      )}

      {/* Unified Bottom-Left HUD Stack (Hover Inspector + Color Legend, never overlaps Right Dock) */}
      <div
        className={`pointer-events-none absolute bottom-3 left-3 z-20 flex flex-col items-start gap-2 ${
          hasRightFloatingDock
            ? 'max-w-[calc(100%-405px)]'
            : 'max-w-[calc(100%-24px)]'
        }`}
      >
        {hoveredInfo && (
          <div className="flex items-center gap-2.5 rounded-xl border border-white/25 bg-[#0D1322]/95 px-3 py-1.5 text-xs shadow-2xl backdrop-blur-md">
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full animate-pulse ${
                hoveredInfo.mappedNode?.roleType === 'CP'
                  ? 'bg-rose-500'
                  : 'bg-amber-400'
              }`}
            />
            <div className="min-w-0">
              <div className="font-extrabold text-white truncate">
                {hoveredInfo.partName}
              </div>
              {hoveredInfo.mappedNode ? (
                <div className="text-[11px] font-bold text-cyan-300 truncate">
                  {hoveredInfo.mappedNode.roleType === 'CP'
                    ? `被动受拉痛点 (${hoveredInfo.mappedNode.code}) · 请先按压橙/青色源头靶点，最后温和放松此处`
                    : `精准按压靶点 (${hoveredInfo.mappedNode.code}) · 此发光圆点即为需深压松解的筋膜锁扣`}
                </div>
              ) : (
                <div className="text-[11px] font-medium text-white/85 truncate">
                  骨性/肌性参考结构 · 点击自动定位最近 Stecco 筋膜节点
                </div>
              )}
            </div>
          </div>
        )}

        <div className="hidden md:flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-white/20 bg-[#0D1322]/95 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-yellow-400 ring-2 ring-white shadow-[0_0_8px_#facc15]" />
            <span>当前第1优先靶点</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
            <span>前侧去程锁扣(CC)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <span>背侧回程锁扣(CC)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
            <span>勿先按·受拉痛点(CP)</span>
          </div>
          <span className="ml-1 rounded-md border border-cyan-300/60 bg-sky-600/35 px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-cyan-200">
            {zoomLodTier === 'L1_MACRO'
              ? 'L1 全景视图'
              : zoomLodTier === 'L2_MESO'
              ? 'L2 局部视图'
              : 'L3 肌纤维特写'}
          </span>
        </div>
      </div>
    </div>
  );
};
