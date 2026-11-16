export type SegmentCode =
  | 'CP' // Caput (头)
  | 'CL' // Collum (颈)
  | 'TH' // Thorax (胸)
  | 'LU' // Lumbus (腰)
  | 'PV' // Pelvis (骨盆)
  | 'CX' // Coxa (髋)
  | 'SC' // Scapula (肩胛)
  | 'HU' // Humerus (肱骨/上臂)
  | 'CU' // Cubitus (肘/前臂近端)
  | 'CA' // Carpus (腕/前臂远端)
  | 'DI'; // Digiti (手掌/手指)

export type DirectionCode =
  | 'AN' // Antemotion (前向/屈曲)
  | 'RE' // Retromotion (后向/伸展)
  | 'LA' // Lateromotion (外侧/外展)
  | 'ME' // Mediomotion (内侧/内收)
  | 'IR' // Intrarotation (内旋/旋前)
  | 'ER' // Extrarotation (外旋/旋后)
  | 'CF'; // Center of Fusion (跨平面融合中心)

export type NodeRoleType =
  | 'CC' // Center of Coordination (协调中心：深筋膜矢量汇聚点/致密化元凶)
  | 'CF' // Center of Fusion (融合中心：支持带/肌间隔跨平面交汇点)
  | 'CP'; // Center of Perception (感知中心：受远端牵拉产生疼痛的受害区)

export type AnatomicalLayer =
  | 'superficial_muscle'
  | 'deep_muscle'
  | 'fascia_connective'
  | 'skeleton'
  | 'skin';

export type AnatomyTrainId =
  | 'DFAL' // Deep Front Arm Line (手臂前深线：拇指→桡骨/旋前肌→肱二头肌→喙突→胸小肌→肋骨)
  | 'SFAL' // Superficial Front Arm Line (手臂前表线：掌面/腕管→前臂屈肌→内侧肌间隔→胸大肌/背阔肌→胸肋)
  | 'DBAL' // Deep Back Arm Line (手臂后深线：小指/尺骨→肱三头肌→肩袖冈下肌→菱形肌/肩胛提肌→胸椎棘突)
  | 'SBAL' // Superficial Back Arm Line (手臂后表线：手背/腕伸肌→外上髁→三角肌→肩胛冈→斜方肌→胸椎/枕骨)
  | 'SBL'  // Superficial Back Line (后表线：枕下→竖脊肌→胸腰筋膜→骶结节韧带→腘绳肌)
  | 'SFL'  // Superficial Front Line (前表线：胸锁乳突肌→胸骨肌/腹直肌→股直肌)
  | 'SPL'  // Spiral Line (螺旋线：夹肌→对侧菱形肌→前锯肌→腹外斜肌→阔筋膜张肌/髂胫束)
  | 'BFL'  // Back Functional Line (后功能线：背阔肌/大圆肌→胸腰筋膜→对侧臀大肌)
  | 'DFL'; // Deep Front Line (前深线：斜角肌→膈肌→腰大肌/髂肌)

export interface SteccoNode {
  id: string;
  code: string;
  nameZh: string;
  nameEn: string;
  segment: SegmentCode;
  segmentNameZh: string;
  direction: DirectionCode;
  directionNameZh: string;
  roleType: NodeRoleType;
  primaryPartId: string;
  relatedPartIds: string[];
  coords: [number, number, number]; // Calibrated to BodyParts3D 4.0 mesh surface (meters)
  muscleGroupZh: string;
  fasciaStructureZh: string;
  layer: AnatomicalLayer;
  steccoSequence: string;
  anatomyTrains: AnatomyTrainId[];
  sedentaryRole: 'primary_shortened_lock' | 'isometric_fatigue_lock' | 'eccentric_victim_cp' | 'pulley_hub';
  defaultSedentaryAdhesion: number; // 0..1 baseline HA densification in prolonged sitting
  biomechanicalSummary: string;
  palpationLandmark: string;
  releaseTechnique: string;
  releasePriorityOrder: number; // 1 = distal/primary root unlock first, 5 = victim CP balance last
  redTeamWarning: string;
  movementVerification: string;
}

export const STECCO_NODES: SteccoNode[] = [
  // ============================================================================
  // 1. 远端手掌与手指节段 (DI - Digiti)：往返链的末梢起止锚点
  // ============================================================================
  {
    id: 'AN-DI',
    code: 'AN-DI',
    nameZh: '手掌大鱼际前向协调中心',
    nameEn: 'Ante-Digiti (Thenar CC)',
    segment: 'DI',
    segmentNameZh: '手指/手掌节段 (DI)',
    direction: 'AN',
    directionNameZh: '前向屈曲序列 (AN)',
    roleType: 'CC',
    primaryPartId: 'FJ1483',
    relatedPartIds: ['FJ1483', 'FJ1501', 'FJ1514', 'FJ1481', 'FJ1515'],
    coords: [-0.2814, 0.8687, 0.0485],
    muscleGroupZh: '拇短展肌、拇对掌肌、拇短屈肌（大鱼际肌群）',
    fasciaStructureZh: '大鱼际筋膜（Thenar Fascia）与掌腱膜桡侧束',
    layer: 'superficial_muscle',
    steccoSequence: 'AN（矢状面前向屈曲序列）起点',
    anatomyTrains: ['DFAL'],
    sedentaryRole: 'primary_shortened_lock',
    defaultSedentaryAdhesion: 0.72,
    biomechanicalSummary:
      '【手臂前深线 DFAL 远端锚点】长期捏握鼠标、手机触屏或敲击空格键，导致大鱼际深筋膜发生透明质酸致密化。它的张力经桡骨骨膜与肱二头肌一路向上传导至肩胛骨喙突（胸小肌 AN-SC），是锁死前侧链的末梢源头。',
    palpationLandmark:
      '手掌正面，第一掌骨（大拇指根部）掌侧最饱满的肉垫中央偏桡侧，按压有明显酸胀感处。',
    releaseTechnique:
      '使用对侧拇指指间关节或小型筋膜球，垂直于第一掌骨轴线做深层横向拨动摩擦 60-90 秒，直至鱼际肌群温热松软。',
    releasePriorityOrder: 1,
    redTeamWarning:
      '⚠️ 切勿直接猛掐第一掌骨指骨关节囊；若按压时拇指尖出现刺痛麻木（正中神经返支），请向掌骨中段微移 5mm。',
    movementVerification:
      '【MV 复测】大拇指尽力向小指根部外展张开手掌，对比松解前后掌心张开的轻松度与腕前侧牵拉感。',
  },
  {
    id: 'ME-DI',
    code: 'ME-DI',
    nameZh: '小鱼际内侧协调中心',
    nameEn: 'Medio-Digiti (Hypothenar CC)',
    segment: 'DI',
    segmentNameZh: '手指/手掌节段 (DI)',
    direction: 'ME',
    directionNameZh: '内侧内收序列 (ME)',
    roleType: 'CC',
    primaryPartId: 'FJ1466',
    relatedPartIds: ['FJ1466', 'FJ1470', 'FJ1482', 'FJ1511'],
    coords: [-0.2331, 0.8408, 0.0435],
    muscleGroupZh: '小指展肌、小指短屈肌、小指对掌肌（小鱼际肌群）',
    fasciaStructureZh: '小鱼际筋膜（Hypothenar Fascia）与尺侧腕骨膜连续体',
    layer: 'superficial_muscle',
    steccoSequence: 'ME（冠状面内侧序列）起点',
    anatomyTrains: ['DBAL', 'SFAL'],
    sedentaryRole: 'primary_shortened_lock',
    defaultSedentaryAdhesion: 0.65,
    biomechanicalSummary:
      '【手臂后深线 DBAL 远端起点】用鼠标时手掌尺侧（小鱼际）长期压在桌面上充当支点，导致小鱼际筋膜黏连。该张力沿尺骨骨膜→肱三头肌→冈下肌（ER-HU）→菱形肌（RE-SC）直接回传到胸椎棘突！',
    palpationLandmark:
      '手掌小指侧外缘（第五掌骨掌侧与外侧交界处），豌豆骨远端约 2 指的肌腹中央。',
    releaseTechnique:
      '用对侧指关节抵住第五掌骨内侧缘，向掌骨表面做深层短距摩擦 60 秒。',
    releasePriorityOrder: 1,
    redTeamWarning:
      '⚠️ 避开豌豆骨桡侧紧邻的尺神经腕管（Guyon 管），若小指或无名指尺侧发麻应立即移向远端肌腹。',
    movementVerification:
      '【MV 复测】五指用力张开并做手腕桡偏（向大拇指侧倾斜），观察尺侧紧绷感是否消退。',
  },
  {
    id: 'RE-DI',
    code: 'RE-DI',
    nameZh: '手背骨间肌后向协调中心',
    nameEn: 'Retro-Digiti (Dorsal Interossei CC)',
    segment: 'DI',
    segmentNameZh: '手指/手掌节段 (DI)',
    direction: 'RE',
    directionNameZh: '后向伸展序列 (RE)',
    roleType: 'CC',
    primaryPartId: 'FJ1509',
    relatedPartIds: ['FJ1509', 'FJ1510'],
    coords: [-0.2679, 0.832, 0.0199],
    muscleGroupZh: '第一至第四骨间背侧肌、指伸肌腱帽扩张部',
    fasciaStructureZh: '手背深筋膜（Dorsal Fascia of Hand）',
    layer: 'deep_muscle',
    steccoSequence: 'RE（矢状面后向伸展序列）远端起点',
    anatomyTrains: ['SBAL'],
    sedentaryRole: 'isometric_fatigue_lock',
    defaultSedentaryAdhesion: 0.75,
    biomechanicalSummary:
      '【手臂后表线 SBAL 回程起点】打字和点击鼠标时，手指必须时刻悬空微翘（背伸等长收缩）以防误触键盘，导致手背骨间肌与伸肌腱膜长期疲劳锁死，启动“手背→前臂伸肌→肩胛冈→胸椎”的回程紧绷链。',
    palpationLandmark:
      '手背第 1-2 掌骨之间（合谷区深层靠第 2 掌骨侧）以及第 2-3、3-4 掌骨间隙近端凹陷处。',
    releaseTechnique:
      '用对侧拇指指尖卡进掌骨间隙，贴着掌骨侧壁做纵向及横向小幅深层揉拨 60 秒。',
    releasePriorityOrder: 1,
    redTeamWarning:
      '⚠️ 手背皮下静脉网与桡神经浅支丰富，切忌在手背骨面上野蛮刮蹭表皮，应深压掌骨间隙肌腹。',
    movementVerification:
      '【MV 复测】握拳再完全伸展五指，体会手背与指根的轻盈度。',
  },

  // ============================================================================
  // 2. 腕与前臂远端节段 (CA - Carpus)：前侧屈曲链与后侧伸展链的张力放大器
  // ============================================================================
  {
    id: 'CF-CA',
    code: 'CF-CA',
    nameZh: '腕管屈肌支持带融合中心',
    nameEn: 'Carpal Flexor Retinaculum CF',
    segment: 'CA',
    segmentNameZh: '腕与前臂远端 (CA)',
    direction: 'CF',
    directionNameZh: '跨平面融合中心 (CF)',
    roleType: 'CF',
    primaryPartId: 'FJ1471',
    relatedPartIds: ['FJ1471', 'FJ1502'],
    coords: [-0.2519, 0.8707, 0.0405],
    muscleGroupZh: '腕屈肌支持带（腕横韧带）、掌长肌腱膜汇合部',
    fasciaStructureZh: '腕部深筋膜增厚环（Flexor Retinaculum of Wrist）',
    layer: 'fascia_connective',
    steccoSequence: 'AN-ME-IR 跨平面融合枢纽 (CF)',
    anatomyTrains: ['SFAL', 'DFAL'],
    sedentaryRole: 'pulley_hub',
    defaultSedentaryAdhesion: 0.78,
    biomechanicalSummary:
      '【Stecco 融合中心 CF】腕管支持带是手掌筋膜向小臂深筋膜过渡的力学总闸门。久坐用鼠标时手腕压迫桌沿，导致支持带纤维致密化，同时卡压正中神经并锁死上下游张力传递。',
    palpationLandmark:
      '手腕掌侧横纹远端，豌豆骨与舟骨结节之间的韧带两端附着点（切勿直压正中央神经管）。',
    releaseTechnique:
      '双手拇指分别扣住手腕掌侧内、外侧骨性突起（豌豆骨与大多角骨），向两侧做缓慢横向牵张拉伸（打开腕管屋顶）60 秒。',
    releasePriorityOrder: 1,
    redTeamWarning:
      '🚨 严禁拿筋膜球或硬物直接重压手腕横纹正中央！正下方即是正中神经（腕管），暴力直压会诱发剧烈手麻。只能横向牵拉两侧骨性附着缘。',
    movementVerification:
      '【MV 复测】双手合十做祈祷状手腕背伸（Prayer Stretch），感受腕前侧卡压感是否减轻。',
  },
  {
    id: 'AN-CA',
    code: 'AN-CA',
    nameZh: '前臂掌侧腕屈肌协调中心',
    nameEn: 'Ante-Carpus (Wrist Flexors CC)',
    segment: 'CA',
    segmentNameZh: '腕与前臂远端 (CA)',
    direction: 'AN',
    directionNameZh: '前向屈曲序列 (AN)',
    roleType: 'CC',
    primaryPartId: 'FJ1496',
    relatedPartIds: ['FJ1496', 'FJ1502', 'FJ1475', 'FJ1497', 'FJ1498', 'FJ1499'],
    coords: [-0.2332, 0.9959, 0.0232],
    muscleGroupZh: '桡侧腕屈肌、掌长肌、指浅/指深屈肌',
    fasciaStructureZh: '前臂深筋膜腹侧层（Antebrachial Fascia Anterior）',
    layer: 'superficial_muscle',
    steccoSequence: 'AN（矢状面前向屈曲序列）',
    anatomyTrains: ['SFAL'],
    sedentaryRole: 'primary_shortened_lock',
    defaultSedentaryAdhesion: 0.82,
    biomechanicalSummary:
      '【去程核心锁死点】敲击键盘与抓握鼠标时，前臂屈肌群持续收缩，其张力通过肱骨内上髁与内侧肌间隔直接向上拽动胸大肌（IR-HU）和胸小肌（AN-SC），是造成圆肩和胸椎被拉扯的重要上游推手。',
    palpationLandmark:
      '前臂掌侧（内侧），肘窝横纹与手腕横纹连线的中上 1/3 交界处，握拳时明显隆起的肌腹中央。',
    releaseTechnique:
      '将前臂平放桌面，用对侧肘尖或筋膜球按住该点，配合主动缓慢伸腕、屈腕动作（Pin & Stretch 锚定拉伸）90 秒。',
    releasePriorityOrder: 1,
    redTeamWarning:
      '⚠️ 避开前臂远端桡动脉搏动处（号脉位置）。',
    movementVerification:
      '【MV 复测】手臂伸直、掌心向前、手指朝下做伸腕拉伸，对比小臂内侧紧绷度。',
  },
  {
    id: 'ME-CA',
    code: 'ME-CA',
    nameZh: '前臂尺侧腕屈肌协调中心',
    nameEn: 'Medio-Carpus (Flexor Carpi Ulnaris CC)',
    segment: 'CA',
    segmentNameZh: '腕与前臂远端 (CA)',
    direction: 'ME',
    directionNameZh: '内侧内收序列 (ME)',
    roleType: 'CC',
    primaryPartId: 'FJ1473',
    relatedPartIds: ['FJ1473', 'FJ1518'],
    coords: [-0.2074, 0.994, 0.0051],
    muscleGroupZh: '尺侧腕屈肌（肱骨头与尺骨头）',
    fasciaStructureZh: '前臂尺侧深筋膜与尺骨骨膜扩张部',
    layer: 'superficial_muscle',
    steccoSequence: 'ME（冠状面内侧序列）',
    anatomyTrains: ['SFAL', 'DBAL'],
    sedentaryRole: 'primary_shortened_lock',
    defaultSedentaryAdhesion: 0.70,
    biomechanicalSummary:
      '连接前侧屈肌链与背侧尺骨深线（DBAL）的桥梁。用鼠标时手腕长期尺偏（向小指侧歪斜），导致尺侧腕屈肌极度僵硬，向上通过内上髁与肱三头肌内侧头牵扯肩胛下缘。',
    palpationLandmark:
      '前臂尺侧（小指侧）尺骨锐利骨缘内侧约 1 指宽，前臂中段肌腹处。',
    releaseTechnique:
      '贴着尺骨内侧缘，用拇指或筋膜球向深层做垂直肌纤维的横向拨动 60-90 秒。',
    releasePriorityOrder: 2,
    redTeamWarning:
      '⚠️ 靠近肘部内上髁后方尺神经沟（麻筋）处严禁重压，务必在肘下 4 指以外的肌腹段操作。',
    movementVerification:
      '【MV 复测】手腕向拇指侧做桡偏动作，观察尺侧牵拉感变化。',
  },
  {
    id: 'RE-CA',
    code: 'RE-CA',
    nameZh: '前臂背侧指伸/腕伸肌协调中心',
    nameEn: 'Retro-Carpus (Wrist/Finger Extensors CC)',
    segment: 'CA',
    segmentNameZh: '腕与前臂远端 (CA)',
    direction: 'RE',
    directionNameZh: '后向伸展序列 (RE)',
    roleType: 'CC',
    primaryPartId: 'FJ1492',
    relatedPartIds: ['FJ1492', 'FJ1489', 'FJ1472', 'FJ1517', 'FJ1494', 'FJ1495'],
    coords: [-0.2525, 0.9587, -0.023],
    muscleGroupZh: '指伸肌、桡侧腕短伸肌、尺侧腕伸肌',
    fasciaStructureZh: '前臂背侧深筋膜（Antebrachial Fascia Posterior）',
    layer: 'superficial_muscle',
    steccoSequence: 'RE（矢状面后向伸展序列）',
    anatomyTrains: ['SBAL'],
    sedentaryRole: 'isometric_fatigue_lock',
    defaultSedentaryAdhesion: 0.85,
    biomechanicalSummary:
      '【回程链重灾区！】久坐敲键盘、点鼠标时，手腕长时间处于 15°-30° 背伸悬空状态，前臂背侧伸肌群筋膜严重致密化（常摸到条索结节）。该点张力经外上髁（RE-CU）→三角肌后束/冈下肌（ER-HU）→斜方肌/菱形肌（RE-SC）一路向上死死拽住胸椎！',
    palpationLandmark:
      '前臂背面，肘外侧至手腕背面连线的中上 1/3 处（动一动中指和无名指，能明显摸到跳动的肌腹最高点）。',
    releaseTechnique:
      '用对侧拇指或筋膜球深压条索状结节，同时手腕做缓慢屈曲（垂腕握拳）与伸展动作 90-120 秒。',
    releasePriorityOrder: 1,
    redTeamWarning:
      '⚠️ 若按压时前臂背侧出现向虎口放射的电击麻木感（骨间后神经穿出点），请减轻力度并略向尺侧移动。',
    movementVerification:
      '【MV 复测】手臂前平举，手掌握拳向掌侧屈腕（勾手腕），并尝试扩胸后缩肩胛骨，体会从手背到肩背整条线的松弛感！',
  },

  // ============================================================================
  // 3. 肘与前臂近端节段 (CU - Cubitus)：旋转与屈伸张力的中继站
  // ============================================================================
  {
    id: 'AN-CU',
    code: 'AN-CU',
    nameZh: '肘前肱二头肌腱膜/肱肌协调中心',
    nameEn: 'Ante-Cubitus (Lacertus Fibrosus / Brachialis CC)',
    segment: 'CU',
    segmentNameZh: '肘与前臂近端 (CU)',
    direction: 'AN',
    directionNameZh: '前向屈曲序列 (AN)',
    roleType: 'CC',
    primaryPartId: 'FJ1486',
    relatedPartIds: ['FJ1486', 'FJ1478', 'FJ1512'],
    coords: [-0.2059, 1.1539, -0.0168],
    muscleGroupZh: '肱肌、肱二头肌远端及肱二头肌腱膜（Lacertus Fibrosus）',
    fasciaStructureZh: '肱二头肌腱膜扩张部（将 30% 二头肌张力直接传入前臂筋膜）',
    layer: 'deep_muscle',
    steccoSequence: 'AN（矢状面前向屈曲序列）',
    anatomyTrains: ['DFAL'],
    sedentaryRole: 'primary_shortened_lock',
    defaultSedentaryAdhesion: 0.79,
    biomechanicalSummary:
      '久坐时手肘长期屈曲 90° 放在桌面或扶手上，导致肱肌与肱二头肌腱膜缩短致密。因为肱二头肌短头直接挂在肩胛骨喙突上（与胸小肌同源），这里的锁死会直接把肩胛骨往前下方拽，加剧胸椎后凸拉扯痛。',
    palpationLandmark:
      '肘窝横纹上方约 2-3 指，肱二头肌大肌腹下端深层及内侧斜向延伸的扇形腱膜处。',
    releaseTechnique:
      '屈肘放松肌肉，拇指深入肱二头肌远端外侧与内侧肌间隔，按住后缓慢伸直手肘并旋前前臂，持续 90 秒。',
    releasePriorityOrder: 2,
    redTeamWarning:
      '🚨 肘窝正中央内侧有粗大的肱动脉（可摸到明显脉搏）与正中神经，严禁在脉搏跳动点上重压！应按压肘窝上方肱肌偏外侧或肌腱边缘。',
    movementVerification:
      '【MV 复测】手臂向身体后方伸直并外旋掌心朝外，观察肘窝与肩前侧的拉伸受限感是否解除。',
  },
  {
    id: 'IR-CU',
    code: 'IR-CU',
    nameZh: '前臂旋前圆肌内旋协调中心',
    nameEn: 'Intra-Cubitus (Pronator Teres CC)',
    segment: 'CU',
    segmentNameZh: '肘与前臂近端 (CU)',
    direction: 'IR',
    directionNameZh: '内旋序列 (IR)',
    roleType: 'CC',
    primaryPartId: 'FJ1474',
    relatedPartIds: ['FJ1474', 'FJ1516', 'FJ1503'],
    coords: [-0.2231, 1.0683, -0.0002],
    muscleGroupZh: '旋前圆肌（肱骨头与尺骨头）、旋前方肌',
    fasciaStructureZh: '前臂近端斜行内旋筋膜束',
    layer: 'deep_muscle',
    steccoSequence: 'IR（水平面内旋序列）',
    anatomyTrains: ['DFAL', 'SFAL'],
    sedentaryRole: 'primary_shortened_lock',
    defaultSedentaryAdhesion: 0.84,
    biomechanicalSummary:
      '【键盘/鼠标手隐形元凶】只要你双手放在键盘或普通鼠标上，前臂就处于 100% 的“旋前（手心向下）”位！旋前圆肌长期锁死，不仅卡压正中神经，还会顺着内旋链（IR-CU → IR-HU → IR-SC）迫使整个肱骨内旋、肩胛骨内扣。',
    palpationLandmark:
      '肘窝横纹内侧（肱骨内上髁）斜向桡骨中段走行的肌腹上，约肘横纹下 2 指偏内侧。',
    releaseTechnique:
      '先将前臂旋前放松，拇指按住旋前圆肌肌腹，另一手带动前臂缓慢做“旋后（翻掌心向上）”动作，重复 15-20 次。',
    releasePriorityOrder: 2,
    redTeamWarning:
      '⚠️ 正中神经从旋前圆肌两头之间穿过（旋前圆肌综合征区），按压应以温和“按住+主动翻掌滑动”为主，避免尖锐硬物死顶。',
    movementVerification:
      '【MV 复测】双肘贴紧肋骨，前臂向外翻掌心完全朝天（旋后测试），对比左右两侧翻掌角度与轻松度。',
  },
  {
    id: 'LA-CU',
    code: 'LA-CU',
    nameZh: '肘外侧肱桡肌/腕长伸肌协调中心',
    nameEn: 'Latero-Cubitus (Brachioradialis / ECRL CC)',
    segment: 'CU',
    segmentNameZh: '肘与前臂近端 (CU)',
    direction: 'LA',
    directionNameZh: '外侧序列 (LA)',
    roleType: 'CC',
    primaryPartId: 'FJ1487',
    relatedPartIds: ['FJ1487', 'FJ1490'],
    coords: [-0.2654, 1.0821, -0.0094],
    muscleGroupZh: '肱桡肌、桡侧腕长伸肌',
    fasciaStructureZh: '肱骨外侧肌间隔（Lateral Intermuscular Septum）与前臂外侧筋膜',
    layer: 'superficial_muscle',
    steccoSequence: 'LA（冠状面外侧序列）',
    anatomyTrains: ['SBAL', 'DFAL'],
    sedentaryRole: 'isometric_fatigue_lock',
    defaultSedentaryAdhesion: 0.81,
    biomechanicalSummary:
      '连接前臂与上臂三角肌（LA-HU）、斜角肌（LA-SC）的外侧高速公路。久坐悬臂打字时肱桡肌极易形成高张力结节，向上直接拖拽三角肌和颈侧斜角肌。',
    palpationLandmark:
      '曲肘且大拇指朝上（半握拳啤酒杯姿势）时，肘关节外侧最隆起的那条大肌肉（肘横纹外侧上下 2 指范围）。',
    releaseTechnique:
      '用对侧拇指与食指呈钳形捏住肱桡肌肌腹，或用筋膜球抵在墙上滚动按压 90 秒。',
    releasePriorityOrder: 2,
    redTeamWarning:
      '⚠️ 桡神经浅支与深支在肱桡肌深面下行，捏提肌腹比垂直砸向桡骨小头更安全有效。',
    movementVerification:
      '【MV 复测】伸直手肘并向内旋转手腕，感受肘外侧酸痛是否显著减轻。',
  },
  {
    id: 'ER-CU',
    code: 'ER-CU',
    nameZh: '前臂近端旋后肌外旋协调中心',
    nameEn: 'Extra-Cubitus (Supinator CC)',
    segment: 'CU',
    segmentNameZh: '肘与前臂近端 (CU)',
    direction: 'ER',
    directionNameZh: '外旋序列 (ER)',
    roleType: 'CC',
    primaryPartId: 'FJ1505',
    relatedPartIds: ['FJ1505', 'FJ1485'],
    coords: [-0.2404, 1.0817, -0.0341],
    muscleGroupZh: '旋后肌、肘肌（Anconeus）',
    fasciaStructureZh: '旋后肌弓（Arcade of Frohse）与深层伸肌筋膜',
    layer: 'deep_muscle',
    steccoSequence: 'ER（水平面外旋序列）',
    anatomyTrains: ['DBAL', 'SBAL'],
    sedentaryRole: 'isometric_fatigue_lock',
    defaultSedentaryAdhesion: 0.74,
    biomechanicalSummary:
      '【外旋序列 ER 关键站】由于久坐前臂长期旋前（IR-CU 缩短），旋后肌被长期拉长扭转并发生代偿性致密化。它在 Stecco 外旋序列（ER-CA → ER-CU → ER-HU 冈下肌 → ER-SC 肩胛提肌 → ER-TH 后锯肌）中直接连通肩胛骨与上胸椎！',
    palpationLandmark:
      '肘关节外上髁下方约 2 指、桡骨头后外侧深层（需拨开表层的腕伸肌才能触及贴骨面的旋后肌）。',
    releaseTechnique:
      '拇指深按桡骨头远端后外侧，同时缓慢转动前臂（旋前-旋后交替）60-90 秒。',
    releasePriorityOrder: 2,
    redTeamWarning:
      '⚠️ 骨间后神经（桡神经深支）穿过旋后肌管，按压时若有无名指/手背放射麻感请放轻力道。',
    movementVerification:
      '【MV 复测】前臂旋前旋后流畅度测试，以及同侧肩关节外旋活动度对比。',
  },
  {
    id: 'RE-CU',
    code: 'RE-CU',
    nameZh: '肘后肱三头肌远端协调中心',
    nameEn: 'Retro-Cubitus (Triceps Distal CC)',
    segment: 'CU',
    segmentNameZh: '肘与前臂近端 (CU)',
    direction: 'RE',
    directionNameZh: '后向伸展序列 (RE)',
    roleType: 'CC',
    primaryPartId: 'FJ1477',
    relatedPartIds: ['FJ1477', 'FJ1480', 'FJ1485'],
    coords: [-0.2131, 1.205, -0.0697],
    muscleGroupZh: '肱三头肌外侧头/内侧头远端、肘肌',
    fasciaStructureZh: '肱骨后侧深筋膜与鹰嘴支持带',
    layer: 'superficial_muscle',
    steccoSequence: 'RE（矢状面后向伸展序列）',
    anatomyTrains: ['DBAL'],
    sedentaryRole: 'isometric_fatigue_lock',
    defaultSedentaryAdhesion: 0.68,
    biomechanicalSummary:
      '【手臂后深线 DBAL 中继站】将尺骨与小鱼际的张力向上传递至肱三头肌长头（附着于肩胛骨盂下结节），直接向下拉拽肩胛骨外侧缘。',
    palpationLandmark:
      '手肘尖（尺骨鹰嘴）上方约 3-4 指，大臂后外侧肌腱与肌腹交界处。',
    releaseTechnique:
      '将大臂后侧靠在泡沫轴或筋膜球上，配合手肘屈伸动作滚动松解 60-90 秒。',
    releasePriorityOrder: 2,
    redTeamWarning:
      '⚠️ 避开尺骨鹰嘴内侧的尺神经沟（麻筋）以及大臂中段桡神经沟。',
    movementVerification:
      '【MV 复测】曲肘举手摸对侧肩胛骨（摸背测试），体会大臂后侧延展性。',
  },

  // ============================================================================
  // 4. 肱骨与肩关节节段 (HU - Humerus)：连接手臂与肩胛骨的力学十字路口
  // ============================================================================
  {
    id: 'AN-HU',
    code: 'AN-HU',
    nameZh: '肩前三角肌前束/喙肱肌协调中心',
    nameEn: 'Ante-Humerus (Anterior Deltoid / Coracobrachialis CC)',
    segment: 'HU',
    segmentNameZh: '肱骨/上臂节段 (HU)',
    direction: 'AN',
    directionNameZh: '前向屈曲序列 (AN)',
    roleType: 'CC',
    primaryPartId: 'FJ1468',
    relatedPartIds: ['FJ1468', 'FJ1488', 'FJ1447'],
    coords: [-0.1589, 1.3683, 0.0173],
    muscleGroupZh: '三角肌前束（锁骨部）、喙肱肌、肱二头肌短头近端',
    fasciaStructureZh: '三角肌胸大肌间沟筋膜（Deltopectoral Fascia）',
    layer: 'superficial_muscle',
    steccoSequence: 'AN（矢状面前向屈曲序列）',
    anatomyTrains: ['DFAL', 'SFAL'],
    sedentaryRole: 'primary_shortened_lock',
    defaultSedentaryAdhesion: 0.80,
    biomechanicalSummary:
      '久坐时双臂始终放在身体前方键盘/桌面上（肩前屈位），导致三角肌前束与喙肱肌持续缩短粘连，与胸小肌（AN-SC）合力把肩关节和肩胛骨死死固定在前引位。',
    palpationLandmark:
      '锁骨外 1/3 下方的三角肌胸大肌间沟外侧缘（肩前侧最饱满处偏内侧）。',
    releaseTechnique:
      '用筋膜球抵在墙角，身体微前倾压住肩前侧，手臂缓慢做向后伸展与外旋动作 90 秒。',
    releasePriorityOrder: 2,
    redTeamWarning:
      '⚠️ 三角肌胸大肌间沟内走行头静脉，按压应落在沟外侧的三角肌前束肌腹上。',
    movementVerification:
      '【MV 复测】双手在背后十指交扣向后抬起，对比肩前侧是否不再紧绷卡顿。',
  },
  {
    id: 'IR-HU',
    code: 'IR-HU',
    nameZh: '胸大肌胸肋部肩内旋协调中心',
    nameEn: 'Intra-Humerus (Pectoralis Major CC)',
    segment: 'HU',
    segmentNameZh: '肱骨/上臂节段 (HU)',
    direction: 'IR',
    directionNameZh: '内旋序列 (IR)',
    roleType: 'CC',
    primaryPartId: 'FJ1464',
    relatedPartIds: ['FJ1464', 'FJ1447', 'FJ1446'],
    coords: [-0.103, 1.3188, 0.0943],
    muscleGroupZh: '胸大肌（胸肋部与锁骨部）、肩胛下肌协同筋膜',
    fasciaStructureZh: '胸肌深筋膜（Pectoral Fascia）与腋筋膜前壁',
    layer: 'superficial_muscle',
    steccoSequence: 'IR（水平面内旋序列）',
    anatomyTrains: ['SFAL'],
    sedentaryRole: 'primary_shortened_lock',
    defaultSedentaryAdhesion: 0.86,
    biomechanicalSummary:
      '【圆肩驼背大BOSS之一】胸大肌止于肱骨大结节嵴，久坐双手内收打字时长期处于缩短内旋位。它的浅层筋膜直接覆盖在深层胸小肌（AN-SC）之上，两者发生层间黏连后，会把肱骨和肩胛骨一并锁死在胸前，导致后背菱形肌和胸椎承受全天候的被动牵拉！',
    palpationLandmark:
      '锁骨中段下方约 3-4 指、腋窝前壁内侧的胸大肌厚实肌腹与肌腱过渡区。',
    releaseTechnique:
      '用对侧手指捏拿腋前壁胸大肌肌束，或用筋膜球靠墙按压胸大肌外上象限，同时手臂做“招财猫”外展外旋贴墙滑动 90 秒。',
    releasePriorityOrder: 1,
    redTeamWarning:
      '⚠️ 女性用户请避开乳腺组织，仅在锁骨下方胸大肌锁骨部及腋前壁肌腱侧缘操作。',
    movementVerification:
      '【MV 复测】仰卧或靠墙做手臂 90° 外展外旋（手背能否轻松贴墙），检验圆肩打开程度。',
  },
  {
    id: 'ME-HU',
    code: 'ME-HU',
    nameZh: '上臂内侧喙肱肌/腋壁协调中心',
    nameEn: 'Medio-Humerus (Coracobrachialis / Axillary CC)',
    segment: 'HU',
    segmentNameZh: '肱骨/上臂节段 (HU)',
    direction: 'ME',
    directionNameZh: '内侧内收序列 (ME)',
    roleType: 'CC',
    primaryPartId: 'FJ1488',
    relatedPartIds: ['FJ1488'],
    coords: [-0.1548, 1.334, -0.0047],
    muscleGroupZh: '喙肱肌、肱二头肌短头与背阔肌/胸大肌腋窝筋膜弓',
    fasciaStructureZh: '臂内侧肌间隔近端与腋筋膜弓（Axillary Arch）',
    layer: 'deep_muscle',
    steccoSequence: 'ME（冠状面内侧序列）',
    anatomyTrains: ['DFAL'],
    sedentaryRole: 'primary_shortened_lock',
    defaultSedentaryAdhesion: 0.73,
    biomechanicalSummary:
      '【手臂前深线 DFAL 关键中继站】喙肱肌直接连接肱骨内侧与肩胛骨喙突。久坐夹肘打字时此处致密化，将前臂屈肌的张力直接传导至肩胛骨喙突。',
    palpationLandmark:
      '大臂内侧上 1/3 处，肱二头肌内侧缘后方的条索状肌肉（贴近肱骨内侧骨面）。',
    releaseTechnique:
      '拇指指腹贴着肱二头肌前缘向肱骨方向轻柔拨压（切勿向后方神经血管束深抠）60 秒。',
    releasePriorityOrder: 2,
    redTeamWarning:
      '🚨 极高危神经血管区！大臂内侧肌间隔后方紧贴正中神经、尺神经和肱动脉。触诊时一旦出现手指过电发麻，立即停止并移向肱二头肌前侧！',
    movementVerification:
      '【MV 复测】手臂上举过头顶（肩屈曲 180°），感受腋窝与大臂内侧是否舒展。',
  },
  {
    id: 'LA-HU',
    code: 'LA-HU',
    nameZh: '肩外侧三角肌中束/冈上肌协调中心',
    nameEn: 'Latero-Humerus (Middle Deltoid / Supraspinatus CC)',
    segment: 'HU',
    segmentNameZh: '肱骨/上臂节段 (HU)',
    direction: 'LA',
    directionNameZh: '外侧外展序列 (LA)',
    roleType: 'CC',
    primaryPartId: 'FJ1467',
    relatedPartIds: ['FJ1467'],
    coords: [-0.2264, 1.3531, -0.0289],
    muscleGroupZh: '三角肌中束（肩峰部）、冈上肌远端腱膜',
    fasciaStructureZh: '三角肌深筋膜与肩峰下筋膜连续体',
    layer: 'superficial_muscle',
    steccoSequence: 'LA（冠状面外侧序列）',
    anatomyTrains: ['SBAL'],
    sedentaryRole: 'isometric_fatigue_lock',
    defaultSedentaryAdhesion: 0.77,
    biomechanicalSummary:
      '【手臂后表线 SBAL 肩峰枢纽】右手握鼠标经常向外侧微展悬空（无手托支撑），导致三角肌中束与冈上肌等长收缩疲劳致密，向上直通斜方肌上束（LA-SC），引发肩颈酸痛与肩峰撞击。',
    palpationLandmark:
      '肩峰外侧缘下方约 2-3 指，肱骨大结节前外侧的三角肌中束肌腹中央。',
    releaseTechnique:
      '用筋膜球抵在墙壁上，侧身压住三角肌中束，缓慢做手臂内外旋与小幅外展动作 90 秒。',
    releasePriorityOrder: 3,
    redTeamWarning:
      '⚠️ 避开肩峰下骨缝正中的肩峰下囊急性发炎区，重点按压肩峰下 3 指的肌腹与三角肌粗隆。',
    movementVerification:
      '【MV 复测】手臂侧平举外展至头顶（疼痛弧测试），观察 60°-120° 区间是否顺畅无卡滞。',
  },
  {
    id: 'ER-HU',
    code: 'ER-HU',
    nameZh: '肩胛冈下窝冈下肌/小圆肌协调中心',
    nameEn: 'Extra-Humerus (Infraspinatus / Teres Minor CC)',
    segment: 'HU',
    segmentNameZh: '肱骨/上臂节段 (HU)',
    direction: 'ER',
    directionNameZh: '外旋序列 (ER)',
    roleType: 'CC',
    primaryPartId: 'FJ1500',
    relatedPartIds: ['FJ1500'],
    coords: [-0.1243, 1.342, -0.0909],
    muscleGroupZh: '冈下肌（Infraspinatus）',
    fasciaStructureZh: '冈下筋膜（Infraspinatus Fascia，极厚且富含本体感受器）',
    layer: 'deep_muscle',
    steccoSequence: 'ER（水平面外旋序列）核心枢纽',
    anatomyTrains: ['DBAL'],
    sedentaryRole: 'isometric_fatigue_lock',
    defaultSedentaryAdhesion: 0.89,
    biomechanicalSummary:
      '🔥【解救胸椎痛与肩胛痛的黄金枢纽！】在《解剖列车》手臂后深线（DBAL）与 Stecco 外旋序列（ER）中，冈下肌和小圆肌是连接“手臂背侧链（RE-DI → RE-CA → ER-CU）”与“菱形肌/胸椎（RE-SC → RE-TH）”的唯一必经桥梁！久坐用鼠标时，冈下肌为了稳定内旋前伸的肱骨，处于极度离心紧绷与缺血致密化状态。临床上松解此处（天宗穴深筋膜区），往往能瞬间释放胸椎和肩胛骨内侧缘 50% 以上的拉扯感！',
    palpationLandmark:
      '肩胛骨背面，先摸到横行的“肩胛冈”骨棱，往下移约 2-3 指的冈下窝中央凹陷处（相当于中医天宗穴及外侧小圆肌区）。',
    releaseTechnique:
      '躺姿或靠墙将筋膜球精准垫在肩胛冈下方的冈下窝中央，双臂在胸前交叉抱肩（把肩胛骨拉开），做缓慢的身体微移与手臂内外旋 120 秒（此处通常酸爽剧烈！）。',
    releasePriorityOrder: 2,
    redTeamWarning:
      '⚠️ 按压应在肩胛骨骨面（冈下窝）上进行，切勿滑入肩胛切迹上方压迫肩胛上神经。',
    movementVerification:
      '【MV 复测】测试手臂向后背摸对侧肩胛骨（内旋后伸）及扩胸转体，立即对比胸椎拉扯感是否大幅减轻！',
  },
  {
    id: 'RE-HU',
    code: 'RE-HU',
    nameZh: '腋后壁大圆肌/三角肌后束协调中心',
    nameEn: 'Retro-Humerus (Teres Major / Posterior Deltoid / Long Triceps CC)',
    segment: 'HU',
    segmentNameZh: '肱骨/上臂节段 (HU)',
    direction: 'RE',
    directionNameZh: '后向伸展序列 (RE)',
    roleType: 'CC',
    primaryPartId: 'FJ1507',
    relatedPartIds: ['FJ1507', 'FJ1513'],
    coords: [-0.1245, 1.3052, -0.0897],
    muscleGroupZh: '大圆肌（肩胛右下侧外缘主力）、三角肌后束',
    fasciaStructureZh: '腋窝后壁深筋膜交汇区（Quadrangular Space Margin）',
    layer: 'deep_muscle',
    steccoSequence: 'RE（矢状面后向伸展序列）',
    anatomyTrains: ['SFAL', 'BFL', 'DBAL'],
    sedentaryRole: 'isometric_fatigue_lock',
    defaultSedentaryAdhesion: 0.78,
    biomechanicalSummary:
      '【上肢-躯干背侧交汇枢纽】肱三头肌长头、大圆肌、三角肌后束与背阔肌在此交织。此处致密化不仅锁死肩胛骨外侧缘，还会通过背阔肌与胸腰筋膜（BFL 后功能线）向下牵扯下胸椎、腰椎甚至对侧骨盆！',
    palpationLandmark:
      '腋窝后壁最厚实的肌肉束（肩胛骨外侧缘中下 1/3 处），用对侧手从腋下往后捏即可抓到的大圆肌束。',
    releaseTechnique:
      '侧卧或靠墙，将筋膜球放在肩胛骨外侧缘（腋窝后方），手臂缓慢向上举过头顶再放下，持续 90 秒。',
    releasePriorityOrder: 3,
    redTeamWarning:
      '⚠️ 避开四边孔正中央（腋神经与旋肱后动脉穿出点），若三角肌外侧发麻请略向肩胛骨下角方向移动。',
    movementVerification:
      '【MV 复测】双手高举过头顶贴耳，观察腋后壁是否不再拉扯限制上举。',
  },

  // ============================================================================
  // 5. 肩胛骨节段 (SC - Scapula)：全链张力转换的“滑轮中枢（Pulley Hub）”
  // ============================================================================
  {
    id: 'AN-SC',
    code: 'AN-SC',
    nameZh: '胸小肌喙突前向协调中心',
    nameEn: 'Ante-Scapula (Pectoralis Minor CC)',
    segment: 'SC',
    segmentNameZh: '肩胛与肩带节段 (SC)',
    direction: 'AN',
    directionNameZh: '前向屈曲序列 (AN)',
    roleType: 'CC',
    primaryPartId: 'FJ1456',
    relatedPartIds: ['FJ1456'],
    coords: [-0.102, 1.3313, 0.0519],
    muscleGroupZh: '胸小肌（Pectoralis Minor，起于第 3-5 肋，止于肩胛骨喙突）',
    fasciaStructureZh: '锁骨胸肌筋膜（Clavipectoral Fascia）与喙突筋膜锚点',
    layer: 'deep_muscle',
    steccoSequence: 'AN（矢状面前向序列）核心枢纽',
    anatomyTrains: ['DFAL'],
    sedentaryRole: 'primary_shortened_lock',
    defaultSedentaryAdhesion: 0.94,
    biomechanicalSummary:
      '🚨【久坐胸椎痛/膏肓痛的第一元凶！】为什么你后背胸椎和肩胛骨内侧缝隙痛，揉背却没用？因为深层的**胸小肌（AN-SC）**接收了从大拇指（AN-DI）→腕屈肌/旋前肌（AN-CA/IR-CU）→肱二头肌（AN-CU）传来的全部前侧缩短张力，像钢爪一样死死勾住肩胛骨的**喙突**，把肩胛骨往前、往下、向外拉（肩胛前倾+前引）！结果就是肩胛骨内侧缘的菱形肌（RE-SC）和胸椎竖脊肌（RE-TH）被日夜不停地拉长拖拽！不松开胸小肌 AN-SC，胸椎的拉扯感永远无法解除。',
    palpationLandmark:
      '先在锁骨外 1/3 下方摸到坚硬的圆形骨突——“肩胛骨喙突”，从喙突向内下方（朝向乳头内上方第 3-4 肋骨方向）移动约 2 指，透过表层放松的胸大肌向肋骨面深按，能摸到一条极具酸痛感的斜行条索。',
    releaseTechnique:
      '将同侧手臂搭在桌面上使表层胸大肌完全松弛，用对侧四指指腹或筋膜球（抵在门框墙角）斜向肋骨面深压胸小肌肌腹，配合深吸气挺胸与肩胛骨后缩动作 90-120 秒。',
    releasePriorityOrder: 1,
    redTeamWarning:
      '🚨 胸小肌正后方（喙突下间隙）就是臂丛神经干与腋动静脉！如果按压时整条手臂发麻或过电，说明压到了神经束，请立即向内下方（靠近第 3-4 肋骨侧）移动 1-1.5cm，切勿直接往喙突外下方的神经血管束猛戳！',
    movementVerification:
      '【MV 复测】自然站立或平躺，观察肩膀是否自动向后下沉、呼吸胸廓打开，且后背胸椎间的紧绷拉扯感立即减轻！',
  },
  {
    id: 'IR-SC',
    code: 'IR-SC',
    nameZh: '锁骨下肌内旋协调中心',
    nameEn: 'Intra-Scapula (Subclavius CC)',
    segment: 'SC',
    segmentNameZh: '肩胛与肩带节段 (SC)',
    direction: 'IR',
    directionNameZh: '内旋序列 (IR)',
    roleType: 'CC',
    primaryPartId: 'FJ1460',
    relatedPartIds: ['FJ1460'],
    coords: [-0.0647, 1.4017, 0.0257],
    muscleGroupZh: '锁骨下肌（Subclavius）',
    fasciaStructureZh: '锁骨胸肌筋膜上束',
    layer: 'deep_muscle',
    steccoSequence: 'IR（水平面内旋序列）',
    anatomyTrains: ['DFAL'],
    sedentaryRole: 'primary_shortened_lock',
    defaultSedentaryAdhesion: 0.85,
    biomechanicalSummary:
      '与胸小肌（AN-SC）同属锁骨胸肌筋膜层。久坐含胸耸肩时，锁骨下肌极度僵硬，把锁骨向下向内锁死在第一肋骨上，限制肩胛骨后缩与胸廓上部呼吸扩展。',
    palpationLandmark:
      '锁骨正中央下缘凹陷处，紧贴锁骨下表面（手指需微屈，指尖向上顶向锁骨下缘）。',
    releaseTechnique:
      '低头含胸使表层筋膜松弛，用对侧拇指或食中指指尖紧贴锁骨中段下缘做水平横向轻柔拨动 60 秒。',
    releasePriorityOrder: 1,
    redTeamWarning:
      '⚠️ 力量方向必须“向上顶向锁骨骨面”，严禁向深部第一肋骨方向重压（深面为锁骨下动静脉与臂丛）。',
    movementVerification:
      '【MV 复测】双肩做大幅度向后绕环动作，体会锁骨与肩前侧的活动度是否明显变大。',
  },
  {
    id: 'ME-SC',
    code: 'ME-SC',
    nameZh: '前锯肌侧胸壁内侧协调中心',
    nameEn: 'Medio-Scapula (Serratus Anterior CC)',
    segment: 'SC',
    segmentNameZh: '肩胛与肩带节段 (SC)',
    direction: 'ME',
    directionNameZh: '内侧序列 (ME)',
    roleType: 'CC',
    primaryPartId: 'FJ1459',
    relatedPartIds: ['FJ1459'],
    coords: [-0.1316, 1.2926, -0.0097],
    muscleGroupZh: '前锯肌（Serratus Anterior）中下束',
    fasciaStructureZh: '前锯肌筋膜（与菱形肌在肩胛骨内侧缘形成连续的“菱形-前锯肌吊带”）',
    layer: 'deep_muscle',
    steccoSequence: 'ME（冠状面内侧序列）',
    anatomyTrains: ['SPL'],
    sedentaryRole: 'primary_shortened_lock',
    defaultSedentaryAdhesion: 0.83,
    biomechanicalSummary:
      '【螺旋线 SPL 核心滑轨】在解剖学上，前锯肌和菱形肌其实是一块肌肉被肩胛骨内侧缘分成了两半（合称菱形-前锯肌复合体 Rhomboserratus）！久坐双手前伸时，前锯肌粘连在肋骨外侧壁上，把肩胛骨像吸盘一样粘在侧胸壁，导致肩胛骨内侧缘的菱形肌（RE-SC）被强行拉向两侧，引发顽固性胸椎旁疼痛。',
    palpationLandmark:
      '腋窝正下方（腋中线），第 4 至第 6 肋骨外侧表面（锯齿状肌肉附着在肋骨面上）。',
    releaseTechnique:
      '侧卧压在泡沫轴上，或用对侧手四指紧贴腋下第 4-6 肋骨表面，沿肋骨走向前后拨动筋膜 90 秒，配合深呼吸。',
    releasePriorityOrder: 2,
    redTeamWarning:
      '⚠️ 肋骨骨面较薄，避免使用尖锐工具垂直猛戳肋骨，应贴着肋骨弧面平行滑动摩擦。',
    movementVerification:
      '【MV 复测】深吸气扩胸并做肩胛骨后缩（夹背），感受肩胛骨在胸壁上的滑动是否变得顺滑如涂油。',
  },
  {
    id: 'LA-SC',
    code: 'LA-SC',
    nameZh: '中斜角肌/上斜方肌颈肩外侧协调中心',
    nameEn: 'Latero-Scapula (Scalenus Medius / Upper Trapezius CC)',
    segment: 'SC',
    segmentNameZh: '肩胛与肩带节段 (SC)',
    direction: 'LA',
    directionNameZh: '外侧序列 (LA)',
    roleType: 'CC',
    primaryPartId: 'FJ1593',
    relatedPartIds: ['FJ1593', 'FJ1592', 'FJ1594', 'FJ1521'],
    coords: [-0.0413, 1.4723, -0.0228],
    muscleGroupZh: '中斜角肌、后斜角肌、上斜方肌前缘交汇部',
    fasciaStructureZh: '颈深筋膜椎前层（Prevertebral Fascia）',
    layer: 'deep_muscle',
    steccoSequence: 'LA（冠状面外侧序列）',
    anatomyTrains: ['DFL', 'SBAL'],
    sedentaryRole: 'primary_shortened_lock',
    defaultSedentaryAdhesion: 0.84,
    biomechanicalSummary:
      '🔥【Stecco 临床名点 LA-SC】斜角肌被胸廓出口的神经包绕，当头前伸盯屏幕 + 耸肩打字时，LA-SC 发生严重致密化，不仅向上引发偏头痛、向外沿手臂外侧链（LA-HU → LA-CU）引起手臂酸麻，还会通过肩胛背神经直接诱发肩胛骨内侧缘（菱形肌区）的放射性剧痛！',
    palpationLandmark:
      '脖子外侧下半部，胸锁乳突肌后缘与上斜方肌前缘构成的三角形凹陷区（锁骨上方约 2 指深层）。',
    releaseTechnique:
      '头微微偏向同侧使表层肌肉放松，用食指和中指指腹极其轻柔地贴在胸锁乳突肌后缘做微幅缓慢揉动 45-60 秒（力量宜轻柔精准，切忌暴力）。',
    releasePriorityOrder: 2,
    redTeamWarning:
      '🚨 胸廓出口核心神经区！前、中斜角肌之间正是臂丛神经根穿出点。操作时只用指腹温和慢速摩擦，绝不可用筋膜枪击打颈侧！',
    movementVerification:
      '【MV 复测】头部向对侧侧屈（耳朵找对侧肩膀），对比颈外侧牵拉感与肩胛内侧放射感的变化。',
  },
  {
    id: 'ER-SC',
    code: 'ER-SC',
    nameZh: '肩胛提肌肩胛上角外旋协调中心',
    nameEn: 'Extra-Scapula (Levator Scapulae Superior Angle CC)',
    segment: 'SC',
    segmentNameZh: '肩胛与肩带节段 (SC)',
    direction: 'ER',
    directionNameZh: '外旋序列 (ER)',
    roleType: 'CC',
    primaryPartId: 'FJ1532',
    relatedPartIds: ['FJ1532'],
    coords: [-0.0362, 1.4617, -0.0569],
    muscleGroupZh: '肩胛提肌（Levator Scapulae）与前锯肌上角交汇部',
    fasciaStructureZh: '肩胛上角筋膜交汇点',
    layer: 'deep_muscle',
    steccoSequence: 'ER（水平面外旋序列）',
    anatomyTrains: ['DBAL'],
    sedentaryRole: 'isometric_fatigue_lock',
    defaultSedentaryAdhesion: 0.87,
    biomechanicalSummary:
      '【落枕与肩颈僵痛核心点】在《解剖列车》手臂后深线（DBAL）中，从手部小指和冈下肌（ER-HU）传来的张力跨过肩胛骨后，一路分支直达肩胛骨上角的肩胛提肌（ER-SC），再向上连到颈椎 C1-C4 横突。久坐耸肩时此处极易形成硬结。',
    palpationLandmark:
      '肩井穴后下方，摸到肩胛骨最内上方尖角（肩胛上角）的上缘骨面附着处。',
    releaseTechnique:
      '将筋膜球抵在墙上或椅背上，对准肩胛骨内上角上方，头向对侧前方低头（闻对侧腋窝姿势），缓慢滚动按压 90 秒。',
    releasePriorityOrder: 3,
    redTeamWarning:
      '⚠️ 若本身存在严重翼状肩胛或垂肩体态，必须先松解前侧胸小肌（AN-SC）再松解肩胛提肌。',
    movementVerification:
      '【MV 复测】低头并向左右转头（测试颈椎旋转与屈曲），观察肩胛上角是否不再扯痛。',
  },
  {
    id: 'RE-SC',
    code: 'RE-SC',
    nameZh: '大小菱形肌/中斜方肌肩胛内侧感知与协调中心',
    nameEn: 'Retro-Scapula (Rhomboid Major/Minor & Middle Trapezius CP/CC)',
    segment: 'SC',
    segmentNameZh: '肩胛与肩带节段 (SC)',
    direction: 'RE',
    directionNameZh: '后向伸展序列 (RE)',
    roleType: 'CP',
    primaryPartId: 'FJ1536',
    relatedPartIds: ['FJ1536', 'FJ1537', 'FJ1554'],
    coords: [-0.0383, 1.3488, -0.0978],
    muscleGroupZh: '大菱形肌、小菱形肌、中斜方肌',
    fasciaStructureZh: '菱形肌深筋膜与胸背筋膜浅层',
    layer: 'deep_muscle',
    steccoSequence: 'RE（矢状面后向序列）连接肩胛与胸椎',
    anatomyTrains: ['DBAL', 'SBAL', 'SPL'],
    sedentaryRole: 'eccentric_victim_cp',
    defaultSedentaryAdhesion: 0.76,
    biomechanicalSummary:
      '🎯【你感受到的肩胛内侧缘“膏肓痛”感知中心 CP！】在久坐体态中，菱形肌和中斜方肌是典型的**“被拉长的受害者”**：前方有胸小肌（AN-SC）和前臂屈肌链把肩胛骨往前拽，外侧有冈下肌（ER-HU）和前臂伸肌链（RE-CA）向外拽，导致菱形肌像一根被拉到极限的橡皮筋，内部产生保护性微痉挛和缺血性酸痛。**必须先松解第 1-3 步的前侧与手臂远端节点，第 4 步再来轻柔梳理此处并配合夹背激活**，才能彻底消除拉扯感！',
    palpationLandmark:
      '后背肩胛骨内侧缘与胸椎 T2-T5 棘突之间的肌沟中央（相当于膏肓穴区域）。',
    releaseTechnique:
      '【切记先松前胸与手臂！】完成第 1-3 步远端解锁后，用花生球或筋膜球沿肩胛骨内侧缘轻柔滚动 60 秒，随后立即做 15 次“肩胛后缩外旋（W字扩胸）”主动激活训练。',
    releasePriorityOrder: 4,
    redTeamWarning:
      '🚨 康复红队警告：切勿在未松解胸小肌（AN-SC）和手臂链之前，让人用大力气踩背或用筋膜枪狂轰此处！把已经被拉长的菱形肌砸得更松弛，会导致肩胛骨更加外移，隔天胸椎痛反而加重！',
    movementVerification:
      '【MV 复测】挺胸做双肩向后夹背动作，体会肩胛骨向脊柱靠拢的收缩力与后背轻松感。',
  },
  {
    id: 'CF-SC',
    code: 'CF-SC',
    nameZh: '肩胛下角右下侧多肌交汇融合中心（大圆/背阔/下斜方/前锯）',
    nameEn: 'Centro di Fusione Scapula Inferior (Teres Major / Lower Trap / Serratus Junction CF)',
    segment: 'SC',
    segmentNameZh: '肩胛与肩带节段 (SC)',
    direction: 'CF',
    directionNameZh: '跨平面融合中心 (CF)',
    roleType: 'CF',
    primaryPartId: 'FJ1520',
    relatedPartIds: ['FJ1520'],
    coords: [-0.108, 1.264, -0.098],
    muscleGroupZh: '下斜方肌下角锚点、背阔肌上缘滑膜束、前锯肌下束交汇区',
    fasciaStructureZh: '肩胛下角深筋膜融合垫（下斜方-背阔-前锯-大圆肌四向矢量交汇处）',
    layer: 'superficial_muscle',
    steccoSequence: 'CF（对角线与多平面融合中心 · 冠状+水平+矢状交汇）',
    anatomyTrains: ['BFL', 'SPL', 'DBAL'],
    sedentaryRole: 'isometric_fatigue_lock',
    defaultSedentaryAdhesion: 0.94,
    biomechanicalSummary:
      '🔥【肩胛骨右下侧粘连剧痛的第一核心枢纽 CF-SC！】在意大利 Stecco 筋膜体系中，肩胛下角是前锯肌（ME-SC）、大圆肌（RE-HU）、背阔肌上缘与下斜方肌四大肌群跨平面交汇的超级融合中心！一旦此处发生筋膜致密化，肩胛骨就会像“被胶水粘死在肋骨上”一样无法上回旋和后倾，抬手或松背时肩胛骨右下角就会出现针扎样粘连剧痛与弹响！',
    palpationLandmark:
      '从背后摸到右侧肩胛骨最底端的骨性尖角（肩胛下角），向下外侧偏 0.5-1cm 的厚韧筋膜结节与滑囊区（常呈硬块或弹拨感）。',
    releaseTechnique:
      '双臂交叉抱胸或右手搭对侧肩（将肩胛下角完全旋出），靠墙或仰卧把直径 6-8cm 筋膜球精准顶在肩胛下角外下缘，配合缓慢深呼吸与手臂“仰卧天使/举手划弧”做筋膜剪切滑动 90-120 秒。',
    releasePriorityOrder: 2,
    redTeamWarning:
      '⚠️ 切勿隔着衣物用尖硬物直接在下角骨尖上猛碾（易引起肩胛下角滑囊炎）；球体需微微错开骨尖，压在“下角外下侧肌肉交界软组织处”。',
    movementVerification:
      '【MV 复测】站立双手贴墙向上滑举过头顶（Wall Slide），对比肩胛下角向外滑动时的卡顿或弹响痛是否消除。',
  },
  {
    id: 'CF-HU',
    code: 'CF-HU',
    nameZh: '小圆肌/四边孔肩胛外下缘融合中心',
    nameEn: 'Centro di Fusione Teres Minor / Quadrangular Border (CF)',
    segment: 'HU',
    segmentNameZh: '肱骨/上臂节段 (HU)',
    direction: 'CF',
    directionNameZh: '外旋-后伸跨平面融合 (CF)',
    roleType: 'CF',
    primaryPartId: 'FJ1508',
    relatedPartIds: ['FJ1508'],
    coords: [-0.155, 1.335, -0.070],
    muscleGroupZh: '小圆肌（Teres Minor）、肩袖后下关节囊筋膜',
    fasciaStructureZh: '肩胛外侧缘筋膜隔与四边孔上缘筋膜弓',
    layer: 'deep_muscle',
    steccoSequence: 'CF（ER 外旋 × RE 后伸跨平面融合枢纽）',
    anatomyTrains: ['DBAL'],
    sedentaryRole: 'isometric_fatigue_lock',
    defaultSedentaryAdhesion: 0.91,
    biomechanicalSummary:
      '🎯【肩胛骨外下缘最隐蔽的深层触发点！】小圆肌紧贴在肩胛骨外侧缘中段、大圆肌与冈下肌之间的狭窄缝隙里。右手悬空操控鼠标或含胸打字时，小圆肌长期被拉紧锁死，压迫深层筋膜痛觉神经，让人感觉“肩胛骨右下外侧缘里面有一颗怎么揉都隔靴搔痒的硬钉子”。',
    palpationLandmark:
      '从肩胛骨下角沿着外侧骨缘斜向上摸约 3-4 指（冈下肌外下缘与大圆肌上缘之间的条索状凹槽），按压会有直窜肩后侧的酸胀感。',
    releaseTechnique:
      '侧卧微向后仰 30°，将花生球或小号筋膜球卡在肩胛骨外侧缘偏下方（手臂前伸搭在枕头上），压住最酸痛的硬结维持 30 秒后，缓慢做小幅度手臂内外旋（“雨刷器动作”）60-90 秒。',
    releasePriorityOrder: 2,
    redTeamWarning:
      '🚨 正下方的大圆肌-小圆肌之间即为“四边孔”（腋神经穿行处）。若按压时肩外侧皮肤出现麻木感或电击痛，请立即将球向肩胛骨骨面内上方移 1cm！',
    movementVerification:
      '【MV 复测】站立手臂 90° 外展状态下做“向后倒手外旋（90/90 测试）”，对比肩后外下侧卡压感。',
  },
  {
    id: 'RE-HU2',
    code: 'RE-HU2',
    nameZh: '肱三头肌长头肩胛盂下外侧缘协调中心',
    nameEn: 'Retro-Humerus Long Triceps (Infraglenoid Border CC)',
    segment: 'SC',
    segmentNameZh: '肩胛与肩带节段 (SC)',
    direction: 'RE',
    directionNameZh: '后向伸展序列 (RE)',
    roleType: 'CC',
    primaryPartId: 'FJ1479',
    relatedPartIds: ['FJ1479'],
    coords: [-0.166, 1.292, -0.065],
    muscleGroupZh: '肱三头肌长头近端（附着于肩胛骨盂下结节）、大圆肌外侧交界',
    fasciaStructureZh: '腋后皱襞筋膜鞘与三边孔/四边孔间隔带',
    layer: 'superficial_muscle',
    steccoSequence: 'RE（矢状面后向序列）跨肩肘双关节桥梁',
    anatomyTrains: ['DBAL'],
    sedentaryRole: 'isometric_fatigue_lock',
    defaultSedentaryAdhesion: 0.89,
    biomechanicalSummary:
      '【肩胛右下外侧拉扯手臂的竖向钢索！】肱三头肌长头是唯一跨过肩关节、直接生根在肩胛骨外侧缘顶端的肌束，并正好从大圆肌与小圆肌之间穿过！当它和腋后壁大圆肌发生层间粘连时，每次抬手肘或伸懒腰都会像绳索一样猛扯肩胛骨外下侧。',
    palpationLandmark:
      '大臂后内侧最靠近腋窝后皱襞处（大圆肌与三角肌后束交汇的竖行粗壮肌腱束），举起手臂时在腋后壁能清晰摸到绷紧的柱状肌腹。',
    releaseTechnique:
      '举起右臂屈肘抱头，用左手拇指食指捏住腋窝后下方刚出肩胛骨的那段肱三头肌长头横向拨揉 60 秒；或靠门框垂直边缘压住大臂上段后侧做屈伸肘释放 90 秒。',
    releasePriorityOrder: 2,
    redTeamWarning:
      '⚠️ 勿向腋窝深处前方血管搏动处抠抓，手指着力方向始终朝向后方的肱三头肌长头与肩胛外侧缘。',
    movementVerification:
      '【MV 复测】屈肘举手让大臂贴近耳朵（测试肱三头肌长头延展度），对比腋后外侧与肩胛外缘是否顺畅打开。',
  },
  {
    id: 'IR-SC2',
    code: 'IR-SC2',
    nameZh: '肩胛下肌肋面深层协调中心（肩胛底面内旋锁）',
    nameEn: 'Intra-Scapula Subscapularis (Costal Fossa Deep CC)',
    segment: 'SC',
    segmentNameZh: '肩胛与肩带节段 (SC)',
    direction: 'IR',
    directionNameZh: '内旋序列 (IR)',
    roleType: 'CC',
    primaryPartId: 'FJ1504',
    relatedPartIds: ['FJ1504'],
    coords: [-0.140, 1.330, -0.032],
    muscleGroupZh: '肩胛下肌（Subscapularis，贴附于肩胛骨前肋面）',
    fasciaStructureZh: '肩胛下筋膜与腋后壁深层滑动面（肩胛胸壁关节底衬）',
    layer: 'deep_muscle',
    steccoSequence: 'IR（水平面内旋序列）核心深层锁',
    anatomyTrains: ['DFAL', 'SFAL'],
    sedentaryRole: 'primary_shortened_lock',
    defaultSedentaryAdhesion: 0.92,
    biomechanicalSummary:
      '🚨【肩胛骨深面“摸不到但剧痛”的黏连黑洞！】肩胛下肌藏在肩胛骨与胸廓肋骨之间，是最强大的肩关节内旋肌，也与背面的冈下肌/大圆肌（RE-HU/CF-SC）隔骨相望、直接导致“肩胛骨右下侧夹在肋骨上动弹不得”。不从腋窝侧缘进去松解肩胛下肌外缘，肩胛骨背面的粘连松了也很快被它从底面重新拽回去！',
    palpationLandmark:
      '举起手臂放松搭在额头上，用对侧四指从腋窝正中偏后方贴着胸壁肋骨往肩胛骨“底面（前面）”斜向内上方轻轻扣入，在腋后壁深处（大圆肌与背阔肌前方）可触及极度酸胀的肌肉底板。',
    releaseTechnique:
      '【安全柔和扣压法】仰卧或坐姿手放桌面使背阔肌松弛，用对侧四指指腹贴着肩胛骨外侧缘的“前表面（肋骨那一面）”做微幅呼吸式静压等待 60-90 秒，让肌肉在呼气中融化变软；或将软筋膜球置于腋后线靠墙轻压微晃。',
    releasePriorityOrder: 1,
    redTeamWarning:
      '🚨 腋窝中央前部布满臂丛神经、腋动脉和腋窝淋巴结！手指必须紧贴靠后的“肩胛骨前骨面”进入，绝不可朝腋窝顶部或前上方血管搏动区深抠；若有手麻立即退出调整角度偏后。',
    movementVerification:
      '【MV 复测】大臂紧贴躯干屈肘 90°，做小臂向外打开的外旋动作（External Rotation），对比外旋角度与肩胛下深处松快感。',
  },
  {
    id: 'LA-SC2',
    code: 'LA-SC2',
    nameZh: '冈上肌冈上窝外展协调中心（肩胛上缘深锁）',
    nameEn: 'Latero-Scapula Supraspinatus (Supraspinous Fossa CC)',
    segment: 'SC',
    segmentNameZh: '肩胛与肩带节段 (SC)',
    direction: 'LA',
    directionNameZh: '外侧外展序列 (LA)',
    roleType: 'CC',
    primaryPartId: 'FJ1506',
    relatedPartIds: ['FJ1506'],
    coords: [-0.116, 1.404, -0.060],
    muscleGroupZh: '冈上肌（Supraspinatus，居于肩胛冈上方深层骨槽）',
    fasciaStructureZh: '冈上筋膜骨纤维鞘（深藏于上斜方肌下方）',
    layer: 'deep_muscle',
    steccoSequence: 'LA（冠状面外侧序列）肩胛上部核心枢纽',
    anatomyTrains: ['SBAL'],
    sedentaryRole: 'isometric_fatigue_lock',
    defaultSedentaryAdhesion: 0.85,
    biomechanicalSummary:
      '【肩胛骨上缘隐形吊索】冈上肌深埋在上斜方肌下方、肩胛冈正上方的骨槽中。一旦下方肩胛骨右下侧粘连锁死导致肩胛上回旋受阻，抬手时冈上肌就不得不超负荷代偿收缩，引起肩胛骨上方隐痛和肩峰弹响。',
    palpationLandmark:
      '先摸到肩胛骨背面横行的“肩胛冈”骨棱，手指向上翻过骨棱半指进入的深凹槽（冈上窝中央）。',
    releaseTechnique:
      '将小号筋膜球/花生球靠墙卡在肩胛冈上方的凹槽里（身体微前倾弯腰 30° 使球能吃进深处），配合低头吐气停留 60-90 秒。',
    releasePriorityOrder: 3,
    redTeamWarning:
      '⚠️ 按压位于斜方肌深层，力度以“深沉酸胀（4-6/10分）”为准，不可用筋膜枪直角暴击骨棱边缘。',
    movementVerification:
      '【MV 复测】手臂从体侧贴耳缓慢上举，感受肩顶部是否不再出现耸肩代偿或卡顿。',
  },

  // ============================================================================
  // 6. 胸椎与胸廓节段 (TH - Thorax)：往返张力链汇聚的最终疼痛感知中心 (CP)
  // ============================================================================
  {
    id: 'RE-TH',
    code: 'RE-TH',
    nameZh: '胸椎中段竖脊肌（髂肋肌/最长肌/棘肌）疼痛感知中心',
    nameEn: 'Retro-Thorax (Thoracic Erector Spinae CP/CC)',
    segment: 'TH',
    segmentNameZh: '胸椎与胸廓节段 (TH)',
    direction: 'RE',
    directionNameZh: '后向伸展序列 (RE)',
    roleType: 'CP',
    primaryPartId: 'FJ1528',
    relatedPartIds: ['FJ1528', 'FJ1535', 'FJ1544', 'FJ1540', 'FJ1551', 'FJ3169', 'FJ3171', 'FJ3173'],
    coords: [-0.0674, 1.298, -0.0957],
    muscleGroupZh: '胸髂肋肌、胸最长肌、胸棘肌、胸半棘肌（T4-T8 胸椎段）',
    fasciaStructureZh: '胸腰筋膜胸段（Thoracolumbar Fascia Thoracic Part）与胸椎棘上韧带',
    layer: 'deep_muscle',
    steccoSequence: 'RE（矢状面后向序列）躯干核心站',
    anatomyTrains: ['SBL', 'DBAL', 'SBAL'],
    sedentaryRole: 'eccentric_victim_cp',
    defaultSedentaryAdhesion: 0.74,
    biomechanicalSummary:
      '🎯【久坐胸椎痛的核心感知中心 CP！】这正是你所描述的“胸椎痛是因为肩胛骨连带的那条线，从手到肩胛骨再回去的线路上各个节点都僵硬”的**张力终点站**！在三维力学网络中，T4-T8 胸椎棘突及两旁的胸段竖脊肌同时承受着：① 去程前侧链（手掌 AN-DI → 腕屈肌 AN-CA → 肱二头肌 AN-CU → 胸小肌 AN-SC）造成的胸椎屈曲后凸拉力；② 回程背侧链（手背 RE-DI → 腕伸肌 RE-CA → 冈下肌 ER-HU → 菱形肌 RE-SC）直接锚定在胸椎棘突上的横向拖拽力；③ 下方久坐骨盆后倾与腰大肌（AN-CX）向下的纵向拉力。只有顺着去回程把上游 CC 节点逐一松解，胸椎才能真正卸下千斤重担！',
    palpationLandmark:
      '后背两块肩胛骨下角连线（T7）至肩胛冈连线（T3）之间，脊柱正中棘突旁开 1.5-3 指的竖脊肌隆起处。',
    releaseTechnique:
      '在完成第 1-4 步（手部、前臂、冈下肌、胸小肌、前锯肌）松解后，将花生球或泡沫轴垫在 T4-T8 胸椎段下方，双手抱头支撑颈部，配合深吸气做温和的“胸椎后伸（Thoracic Extension）”滚动 60 秒。',
    releasePriorityOrder: 5,
    redTeamWarning:
      '🚨 严禁直接暴力按压胸椎正中央棘突骨尖；做泡沫轴胸椎伸展时务必收住下肋骨（避免用腰椎过度反弓代偿胸椎伸展）。',
    movementVerification:
      '【MV 终极复测】坐姿双手抱胸，向左、向右旋转胸椎至最大角度，并做一次深呼吸挺胸——对比整条“手-肩胛-胸椎”往返链松解前后的拉扯感是否彻底消失！',
  },
  {
    id: 'AN-TH',
    code: 'AN-TH',
    nameZh: '前胸剑突肋弓前向协调中心',
    nameEn: 'Ante-Thorax (Rectus Abdominis Upper / Pectoralis Abdominal CC)',
    segment: 'TH',
    segmentNameZh: '胸椎与胸廓节段 (TH)',
    direction: 'AN',
    directionNameZh: '前向屈曲序列 (AN)',
    roleType: 'CC',
    primaryPartId: 'FJ1446',
    relatedPartIds: ['FJ1446', 'FJ1452', 'FJ3131'],
    coords: [-0.0945, 1.2384, 0.1028],
    muscleGroupZh: '胸大肌腹侧部、腹直肌上段前鞘、腹外斜肌上齿、膈肌前缘',
    fasciaStructureZh: '腹直肌鞘上端与胸骨剑突筋膜交汇区',
    layer: 'superficial_muscle',
    steccoSequence: 'AN（矢状面前向屈曲序列）躯干段',
    anatomyTrains: ['SFL', 'SFAL'],
    sedentaryRole: 'primary_shortened_lock',
    defaultSedentaryAdhesion: 0.85,
    biomechanicalSummary:
      '【前表线 SFL 含胸驼背锁扣】久坐窝在椅子里（胸椎屈曲坍塌）时，前胸第 5-7 肋软骨与剑突周围的筋膜长期折叠缩短，把整个前胸廓往下拉，使你想要挺直胸椎时感到前胸有根绳子拽着，后背胸椎（RE-TH）被迫承担双倍抗重力负荷。',
    palpationLandmark:
      '胸骨最下端（剑突）外侧约 2-3 指，第 5-7 肋软骨表面（胸大肌下缘与上腹肌交界处）。',
    releaseTechnique:
      '用手指指腹沿第 5-7 肋软骨下缘表面做横向摩擦松解 60 秒，随后做双手上举吸气扩展肋弓动作。',
    releasePriorityOrder: 2,
    redTeamWarning:
      '⚠️ 切勿直接垂直按压胸骨正中的剑突软骨尖（易损伤剑突），应按压两侧第 5-7 肋骨与肋软骨表面。',
    movementVerification:
      '【MV 复测】挺胸抬头并深吸气，感受肋弓能否轻松向上向外打开。',
  },
  {
    id: 'ER-TH',
    code: 'ER-TH',
    nameZh: '上后锯肌/下后锯肌胸廓外旋协调中心',
    nameEn: 'Extra-Thorax (Serratus Posterior Superior/Inferior CC)',
    segment: 'TH',
    segmentNameZh: '胸椎与胸廓节段 (TH)',
    direction: 'ER',
    directionNameZh: '外旋序列 (ER)',
    roleType: 'CC',
    primaryPartId: 'FJ1542',
    relatedPartIds: ['FJ1542', 'FJ1541'],
    coords: [-0.0504, 1.3936, -0.0822],
    muscleGroupZh: '上后锯肌（隐藏在菱形肌深面）、下后锯肌',
    fasciaStructureZh: '胸腰筋膜中间层（连接上下后锯肌的呼吸筋膜带）',
    layer: 'deep_muscle',
    steccoSequence: 'ER（水平面外旋序列）',
    anatomyTrains: ['SPL'],
    sedentaryRole: 'isometric_fatigue_lock',
    defaultSedentaryAdhesion: 0.72,
    biomechanicalSummary:
      '位于菱形肌正深面、附着于第 2-5 肋角的深层呼吸与旋转肌。许多患者以为的“肩胛骨缝深层刺痛、吸气时后背痛”，其实就位于菱形肌深面的上后锯肌（ER-TH），它与肩胛提肌（ER-SC）和冈下肌（ER-HU）在同一条 Stecco 外旋序列上。',
    palpationLandmark:
      '肩胛骨内侧缘上段（T2-T4 水平），需将手臂抱胸使肩胛骨外移拉开菱形肌后，才能触及第 2-5 肋角表面。',
    releaseTechnique:
      '手臂充分抱胸拉开肩胛骨，用筋膜球抵住上胸段肋角处，配合深长吸气与呼气进行筋膜释放 60 秒。',
    releasePriorityOrder: 3,
    redTeamWarning:
      '⚠️ 按压力度以诱发舒适酸胀为度，切勿屏气硬顶肋骨角以防肋间肌痉挛。',
    movementVerification:
      '【MV 复测】深吸气满肺并旋转上半身，检查后背深层吸气牵扯痛是否消失。',
  },
  {
    id: 'CF-TH',
    code: 'CF-TH',
    nameZh: '斜方肌下束尾端 T12 棘突融合中心（下斜方肌-胸腰交界核心锚点）',
    nameEn: 'Centro di Fusione Inferior Trapezius Apex / T12 Spinous Hub (CF)',
    segment: 'TH',
    segmentNameZh: '胸椎与胸廓节段 (TH)',
    direction: 'CF',
    directionNameZh: '跨平面融合中心 (CF)',
    roleType: 'CF',
    primaryPartId: 'FJ1520',
    relatedPartIds: ['FJ1520', 'FJ1528', 'FJ1544'],
    coords: [-0.018, 1.148, -0.095],
    muscleGroupZh: '斜方肌下束（升部）最末端腱膜、胸腰筋膜浅层上界、T11-T12 棘上韧带交汇部',
    fasciaStructureZh: '第 12 胸椎（T12）斜方肌下端骨膜-腱膜锚定垫',
    layer: 'superficial_muscle',
    steccoSequence: 'CF（连接肩胛冈、枕骨头尾与胸腰交界 T12 的纵向总锚点）',
    anatomyTrains: ['SBAL', 'SBL', 'BFL'],
    sedentaryRole: 'isometric_fatigue_lock',
    defaultSedentaryAdhesion: 0.93,
    biomechanicalSummary:
      '🔥【下斜方肌尾端 T12 棘突核心锚点】斜方肌下束的最末端（尾端）死死附着在**第 12 胸椎（T12）棘突**上！当肩胛骨长期被向上向前吊起时，下斜方肌被迫持续牵拉 T12 棘突，极易在此处形成厚韧的筋膜致密化硬结，产生纵贯全背与胸椎的弓弦拉扯感。松开此结节可有效释放胸椎纵向张力，帮助肩胛骨恢复下沉归位。',
    palpationLandmark:
      '后背正中线，顺着胸椎棘突往下摸到最后一根肋骨（第12肋）水平，即第 11-12 胸椎棘突右侧紧邻的厚韧三角形肌腱结节处。',
    releaseTechnique:
      '仰卧或靠墙，将筋膜球精准压在 T11-T12 棘突右侧旁开 1 指的下斜方肌尾端结节上（避开正中骨尖），配合缓慢深呼气与右肩下沉动作维持 90 秒。',
    releasePriorityOrder: 2,
    redTeamWarning:
      '🚨 只可用筋膜球或指腹贴在 T12 棘突旁侧软组织结节上温和慢速释放，严禁在胸腰交界棘突正中央做暴力踩背或冲击枪猛砸！',
    movementVerification:
      '【MV 复测】坐直做右肩缓慢下沉（远离耳朵）并向左侧屈头颈，体会从脖子、肩胛到下胸椎 T12 那根纵向“大弓弦”是否彻底松开。',
  },

  // ============================================================================
  // 7. 颈椎与头部节段 (CL / CP - Collum & Caput)：上延代偿链
  // ============================================================================
  {
    id: 'AN-CL',
    code: 'AN-CL',
    nameZh: '胸锁乳突肌/前斜角肌颈前协调中心',
    nameEn: 'Ante-Collum (Sternocleidomastoid / Anterior Scalene CC)',
    segment: 'CL',
    segmentNameZh: '颈椎节段 (CL)',
    direction: 'AN',
    directionNameZh: '前向屈曲序列 (AN)',
    roleType: 'CC',
    primaryPartId: 'FJ1595',
    relatedPartIds: ['FJ1595', 'FJ1592'],
    coords: [-0.0216, 1.4691, 0.02],
    muscleGroupZh: '胸锁乳突肌（SCM）、前斜角肌',
    fasciaStructureZh: '颈深筋膜浅层（Investing Layer of Deep Cervical Fascia）',
    layer: 'superficial_muscle',
    steccoSequence: 'AN（矢状面前向序列）颈段',
    anatomyTrains: ['SFL'],
    sedentaryRole: 'primary_shortened_lock',
    defaultSedentaryAdhesion: 0.82,
    biomechanicalSummary:
      '【探颈盯屏幕元凶】久坐头部前探（下颈段屈曲+上颈段仰头）时，胸锁乳突肌极度缩短致密，通过胸骨柄直接与前胸筋膜（AN-TH）相连，把头颅往前下方拽，迫使颈后肌群（RE-CL）和上胸椎（RE-TH）承受高达 20-30 公斤的杠杆拉力！',
    palpationLandmark:
      '头转向对侧时，从耳后乳突斜向胸骨柄和锁骨内侧端隆起的那条粗大肌肉中段。',
    releaseTechnique:
      '头微转向对侧并略低头，用拇指和食指指腹像捏面团一样将胸锁乳突肌肌腹轻轻向体表提起揉捏 60 秒（严禁向颈内侧深按）。',
    releasePriorityOrder: 1,
    redTeamWarning:
      '🚨 绝对安全红线：只能用手指将胸锁乳突肌“向外捏起”松解，严禁向内深压颈动脉窦与颈内静脉！严禁双侧同时按压颈前！',
    movementVerification:
      '【MV 复测】收下巴做颈椎后缩（Chin Tuck）及仰头动作，感受颈前是否松开、头颈归位是否轻松。',
  },
  {
    id: 'RE-CL',
    code: 'RE-CL',
    nameZh: '头夹肌/头半棘肌颈后感知与协调中心',
    nameEn: 'Retro-Collum (Splenius & Semispinalis Capitis CP/CC)',
    segment: 'CL',
    segmentNameZh: '颈椎节段 (CL)',
    direction: 'RE',
    directionNameZh: '后向伸展序列 (RE)',
    roleType: 'CP',
    primaryPartId: 'FJ1545',
    relatedPartIds: ['FJ1545', 'FJ1546', 'FJ1538', 'FJ1539'],
    coords: [-0.0135, 1.4595, -0.0693],
    muscleGroupZh: '头夹肌、颈夹肌、头半棘肌',
    fasciaStructureZh: '项筋膜（Nuchal Fascia）与项韧带外侧缘',
    layer: 'deep_muscle',
    steccoSequence: 'RE（矢状面后向序列）颈段',
    anatomyTrains: ['SBL', 'SPL'],
    sedentaryRole: 'eccentric_victim_cp',
    defaultSedentaryAdhesion: 0.77,
    biomechanicalSummary:
      '连接枕骨与上胸椎（C7-T6 棘突）的关键桥梁。头夹肌在《解剖列车》螺旋线（SPL）中跨过棘突直接与对侧菱形肌（RE-SC）相连！当颈前（AN-CL）和前胸（AN-SC）锁死时，颈后肌群被迫长期离心拉扯来吊住前倾的脑袋。',
    palpationLandmark:
      '脖子后方中段（C4-C7 棘突旁开 2 指），上斜方肌深面的肌束上。',
    releaseTechnique:
      '先松解胸锁乳突肌（AN-CL）与胸小肌（AN-SC）后，双手四指扣住颈后棘突两旁肌肉，配合缓慢点头与仰头动作温和梳理 60 秒。',
    releasePriorityOrder: 4,
    redTeamWarning:
      '⚠️ 颈椎棘突正中央与横突尖切勿暴力扳拧。',
    movementVerification:
      '【MV 复测】低头下巴找胸口及左右转头，观察颈后连带胸椎上段的牵扯感是否消除。',
  },
  {
    id: 'RE-CP',
    code: 'RE-CP',
    nameZh: '枕下肌群头后协调中心',
    nameEn: 'Retro-Caput (Suboccipital Muscles CC/CP)',
    segment: 'CP',
    segmentNameZh: '头部节段 (CP)',
    direction: 'RE',
    directionNameZh: '后向伸展序列 (RE)',
    roleType: 'CC',
    primaryPartId: 'FJ1589',
    relatedPartIds: ['FJ1589', 'FJ1590', 'FJ1584', 'FJ1585'],
    coords: [-0.0167, 1.5436, -0.0704],
    muscleGroupZh: '头后大直肌、头后小直肌、头上斜肌、头下斜肌（枕下三角）',
    fasciaStructureZh: '枕下深筋膜与硬脊膜肌桥（Myodural Bridge）',
    layer: 'deep_muscle',
    steccoSequence: 'RE（矢状面后向序列）颅底最高锚点',
    anatomyTrains: ['SBL'],
    sedentaryRole: 'isometric_fatigue_lock',
    defaultSedentaryAdhesion: 0.83,
    biomechanicalSummary:
      '【后表线 SBL 陀螺仪中枢】枕下肌群每克肌肉含有的肌梭（本体感受器）密度高达全身肌肉之首（是臀大肌的近 100 倍），且与眼球运动神经耦合！久坐盯紧电脑屏幕时，枕下肌群持续微收缩锁死，通过后表线（SBL）一路向下调控胸椎与腰背竖脊肌的张力！松开此处常能让整条脊柱竖脊肌瞬间放松。',
    palpationLandmark:
      '后脑勺颅底枕骨下缘凹陷处（风池穴至哑门穴水平深层）。',
    releaseTechnique:
      '平躺将花生球垫在后脑勺枕骨下缘（不要垫在颈椎上），闭眼做缓慢微小的“点头（收下巴）”动作，并配合眼球缓慢左右转动 90 秒。',
    releasePriorityOrder: 3,
    redTeamWarning:
      '🚨 枕下三角深处有椎动脉穿过寰枕膜进入颅内！严禁仰头位暴力戳刺或使用冲击枪，必须采用平躺花生球自重温和释放。',
    movementVerification:
      '【MV 复测】弯腰摸脚尖或坐姿低头抱胸，感受从后脑勺到胸椎、腰椎的整条后表线是否同步变松！',
  },
  {
    id: 'LA-CP',
    code: 'LA-CP',
    nameZh: '耳周/耳后乳突与颞肌-茎突深筋膜外侧协调中心（颅侧悬吊总挂钩）',
    nameEn: 'Latero-Caput (Periauricular / Mastoid / Temporalis-Styloid Fascia CC)',
    segment: 'CP',
    segmentNameZh: '头部节段 (CP)',
    direction: 'LA',
    directionNameZh: '外侧序列 (LA)',
    roleType: 'CC',
    primaryPartId: 'FJ1533',
    relatedPartIds: ['FJ1533', 'FJ1595', 'FJ1579', 'FJ1598', 'FJ1545'],
    coords: [-0.056, 1.565, -0.032],
    muscleGroupZh: '耳后乳突附着肌群（胸锁乳突肌上端、头最长肌、头夹肌）、耳下二腹肌后腹/茎突肌群、耳上颞肌筋膜',
    fasciaStructureZh: '耳周帽状腱膜-颞深筋膜-颈深筋膜浅层（乳突骨膜交汇环）',
    layer: 'deep_muscle',
    steccoSequence: 'LA（冠状面外侧序列）颅侧最高挂钩',
    anatomyTrains: ['SBL', 'SFL', 'SPL', 'DFL'],
    sedentaryRole: 'primary_shortened_lock',
    defaultSedentaryAdhesion: 0.90,
    biomechanicalSummary:
      '🔥【为什么肩胛与颈肩紧绷的人「耳朵周围」也会极其紧绷？】在人体筋膜张拉网中，耳朵周围（尤其是耳垂正后方的硬骨凸起“颞骨乳突”及耳上颞肌区）是吊起脖子和肩胛骨的**“颅骨车顶总挂钩”**！① 胸锁乳突肌（AN-CL）、头夹肌（RE-CL）和头最长肌全部生根在**耳后乳突**上；② 办公紧盯屏幕或抬臂操作键鼠时，常会无意识咬紧牙关与绷紧耳上颞肌、耳后乳突及耳下深筋膜。松开耳朵周围这一圈“挂钩”，下方的颈肩与肩胛骨才会彻底下沉放松！',
    palpationLandmark:
      '环绕右耳的 3 个黄金点：① 耳后点（耳垂后方摸到硬骨凸起“乳突”的下缘与后缘凹陷）；② 耳下点（耳垂正下方与下颌角之间的深凹陷“翳风穴”）；③ 耳上点（耳朵正上方发际线内 1-2 指的颞肌筋膜，咬牙时鼓起处）。',
    releaseTechnique:
      '用右手食指与中指呈“剪刀手（V字）”夹住右耳根前后，先沿耳后乳突骨缘做小幅深层画圈揉拨 45 秒；再用指腹贴住耳上方发际线（颞肌）微张嘴画圈放松 45 秒；最后轻轻捏住耳廓向外上方、后下方做缓慢牵拉 30 秒。',
    releasePriorityOrder: 1,
    redTeamWarning:
      '🚨 耳垂正下方凹陷（翳风穴）深处有面神经干穿出及颈内静脉，此处只宜用指腹轻柔画圈或向外提拉耳廓筋膜，切勿用尖锐按摩棒向耳下深孔内暴力猛戳（主要的深压点应放在耳后硬骨“乳突”骨面上）！',
    movementVerification:
      '【MV 复测】松完右耳周围一圈后，自然垂下右手并把头轻轻倒向左侧，你会惊奇地发现右侧脖子根部到右肩胛上角（LA-SC）瞬间鬆下一大截！',
  },

  // ============================================================================
  // 8. 腰椎、骨盆与髋节段 (LU / PV / CX)：久坐下背痛与交叉传导至胸肩的底座链
  // ============================================================================
  {
    id: 'AN-CX',
    code: 'AN-CX',
    nameZh: '髂腰肌/股直肌屈髋前向协调中心',
    nameEn: 'Ante-Coxa (Iliopsoas / Rectus Femoris CC)',
    segment: 'CX',
    segmentNameZh: '髋关节节段 (CX)',
    direction: 'AN',
    directionNameZh: '前向屈曲序列 (AN)',
    roleType: 'CC',
    primaryPartId: 'FJ1431',
    relatedPartIds: ['FJ1431', 'FJ1422', 'FJ1433'],
    coords: [-0.0677, 0.9594, 0.0068],
    muscleGroupZh: '腰大肌（Psoas Major）、髂肌（Iliacus）、股直肌近端',
    fasciaStructureZh: '髂腰筋膜（Iliopsoas Fascia，向上与膈肌脚及前纵韧带直接相连）',
    layer: 'deep_muscle',
    steccoSequence: 'AN（矢状面前向序列）核心底座锁扣',
    anatomyTrains: ['DFL', 'SFL'],
    sedentaryRole: 'primary_shortened_lock',
    defaultSedentaryAdhesion: 0.91,
    biomechanicalSummary:
      '🔥【久坐腰背痛与下胸椎拉扯的底座元凶】久坐 8 小时意味着髋关节持续处于 90° 屈曲缩短位，导致腰大肌、髂肌与股直肌近端严重致密化。腰大肌直接附着在 T12-L5 椎体和椎间盘上，并通过筋膜与膈肌相连：当你坐直或站起来时，缩短的髂腰肌从前方死死拽住腰椎和下胸椎，导致后背的腰胸段竖脊肌（RE-LU / RE-TH）承受巨大的拮抗拉力！',
    palpationLandmark:
      '髂前上棘（骨盆前外侧最突出的骨尖）向内侧（肚脐方向）移动约 2 指，深层贴近髂窝内壁处；以及髂前上棘正下方 2 指的股直肌起点。',
    releaseTechnique:
      '仰卧屈膝使腹肌完全松弛，四指从髂前上棘内侧顺着骨盆内壁向深后方温和沉入，配合同侧腿缓慢伸直滑动 90 秒；随后做单膝跪姿弓步伸髋拉伸。',
    releasePriorityOrder: 1,
    redTeamWarning:
      '🚨 腹股沟韧带中点正下方有股动脉（可摸到强脉搏）与股神经，按压点必须选在髂前上棘紧内侧（髂窝）或正下方（股直肌起点），严禁压迫腹股沟中点脉搏区！',
    movementVerification:
      '【MV 复测】从久坐椅子上站起并做单腿后伸，对比腰骶部是否不再酸痛僵硬、站立是否立刻挺拔。',
  },
  {
    id: 'RE-LU',
    code: 'RE-LU',
    nameZh: '腰段竖脊肌/胸腰筋膜感知与协调中心',
    nameEn: 'Retro-Lumbus (Lumbar Erector Spinae & Thoracolumbar Fascia CP/CC)',
    segment: 'LU',
    segmentNameZh: '腰椎节段 (LU)',
    direction: 'RE',
    directionNameZh: '后向伸展序列 (RE)',
    roleType: 'CP',
    primaryPartId: 'FJ1527',
    relatedPartIds: ['FJ1527', 'FJ1535', 'FJ3157', 'FJ3159', 'FJ3162'],
    coords: [-0.0511, 1.0776, -0.08],
    muscleGroupZh: '腰髂肋肌、胸最长肌腰部、多裂肌',
    fasciaStructureZh: '胸腰筋膜后层（Thoracolumbar Fascia Posterior Layer）',
    layer: 'deep_muscle',
    steccoSequence: 'RE（矢状面后向序列）腰段',
    anatomyTrains: ['SBL', 'BFL'],
    sedentaryRole: 'eccentric_victim_cp',
    defaultSedentaryAdhesion: 0.78,
    biomechanicalSummary:
      '【久坐下背痛感知中心 CP】受到前方髂腰肌（AN-CX）缩短下拽，以及上方含胸驼背（AN-TH / AN-SC）的双重拉扯。同时，胸腰筋膜将下背与对侧上肢（RE-HU 大圆肌/背阔肌）连成一个巨型“X”交叉网，腰部筋膜粘连会直接向下拖拽对侧肩膀和胸椎！',
    palpationLandmark:
      '腰部第 2-4 腰椎棘突旁开 2-3 指，竖脊肌最厚实的肌腹外侧缘（肋骨下缘与骨盆髂嵴之间）。',
    releaseTechnique:
      '务必先松解前侧髂腰肌（AN-CX）和臀肌（RE-PV / ER-CX）后，再用花生球或网球靠墙温和按压腰椎旁肌腹 60 秒（切忌直接把硬泡沫轴垫在腰椎下反弓猛滚）。',
    releasePriorityOrder: 4,
    redTeamWarning:
      '⚠️ 切勿在双腿悬空仰卧位用硬泡沫轴猛顶下腰椎（会导致腰椎超伸剪切力过大），应靠墙或先解锁髋前侧。',
    movementVerification:
      '【MV 复测】站立位缓慢弯腰再逐节卷动起身，评估下背部拉扯感变化。',
  },
  {
    id: 'ER-CX',
    code: 'ER-CX',
    nameZh: '臀深层梨状肌/臀中肌后束外旋协调中心',
    nameEn: 'Extra-Coxa (Piriformis / Posterior Gluteus Medius CC)',
    segment: 'CX',
    segmentNameZh: '髋关节节段 (CX)',
    direction: 'ER',
    directionNameZh: '外旋序列 (ER)',
    roleType: 'CC',
    primaryPartId: 'FJ1428',
    relatedPartIds: ['FJ1428', 'FJ1419', 'FJ1426', 'FJ1416', 'FJ1417'],
    coords: [-0.0775, 0.913, -0.0639],
    muscleGroupZh: '梨状肌（Piriformis）、臀中肌后束、髋深层外旋六肌',
    fasciaStructureZh: '臀深筋膜与骶结节韧带交汇部',
    layer: 'deep_muscle',
    steccoSequence: 'ER（水平面外旋序列）骨盆髋部枢纽',
    anatomyTrains: ['SBL', 'SPL'],
    sedentaryRole: 'isometric_fatigue_lock',
    defaultSedentaryAdhesion: 0.84,
    biomechanicalSummary:
      '久坐时椅子长期压迫臀部（且男士常习惯性二郎腿或八字脚外旋坐姿），导致梨状肌与臀中肌深筋膜缺血致密化，锁死骶髂关节，并向上顺着外旋序列（ER-CX → ER-TH → ER-SC → ER-HU）引起腰背与胸肩旋转受限。',
    palpationLandmark:
      '尾骨尖与髋外侧大转子连线的中点稍上方（臀部外上象限深层）。',
    releaseTechnique:
      '坐或躺在筋膜球上，把同侧脚踝架在对侧膝盖上（“4”字翘腿姿势拉开臀肌），缓慢滚动寻找最酸痛结节停留 90 秒。',
    releasePriorityOrder: 2,
    redTeamWarning:
      '⚠️ 坐骨神经从梨状肌下孔穿出，若按压时出现沿大腿后侧直达小腿的剧烈放电麻痛，应立即将球向上外侧（臀中肌区）移开 2cm。',
    movementVerification:
      '【MV 复测】坐姿翘“4”字腿向下压膝盖，对比髋部外旋内旋活动度与腰骶轻松感。',
  },
  {
    id: 'RE-PV',
    code: 'RE-PV',
    nameZh: '臀大肌骶髂部后向协调中心',
    nameEn: 'Retro-Pelvis (Gluteus Maximus Sacral Origin CC)',
    segment: 'PV',
    segmentNameZh: '骨盆节段 (PV)',
    direction: 'RE',
    directionNameZh: '后向伸展序列 (RE)',
    roleType: 'CC',
    primaryPartId: 'FJ1418',
    relatedPartIds: ['FJ1418', 'FJ3393'],
    coords: [-0.0692, 0.8939, -0.1172],
    muscleGroupZh: '臀大肌上部与骶骨/胸腰筋膜附着部',
    fasciaStructureZh: '臀筋膜与胸腰筋膜后层对角线交汇部',
    layer: 'superficial_muscle',
    steccoSequence: 'RE（矢状面后向序列）及对角线后功能线',
    anatomyTrains: ['BFL', 'SBL'],
    sedentaryRole: 'isometric_fatigue_lock',
    defaultSedentaryAdhesion: 0.79,
    biomechanicalSummary:
      '【后功能线 BFL 对角线发动机】在《解剖列车》后功能线与 Stecco 螺旋对角线中，一侧臀大肌（RE-PV）的胶原纤维跨过骶骨中线，通过胸腰筋膜直接延续为对侧的背阔肌与大圆肌（RE-HU）！久坐压迫臀大肌上部筋膜粘连，会沿对角线斜向拉扯你的下胸椎与肩胛骨下角！',
    palpationLandmark:
      '骶骨外侧缘（腰窝/髂后上棘内下方约 2 指）臀大肌最厚实的起始部。',
    releaseTechnique:
      '用筋膜球或泡沫轴压在臀部内上方（靠近骶骨外侧缘），身体微侧倾滚动按压 90 秒。',
    releasePriorityOrder: 2,
    redTeamWarning:
      '⚠️ 避免直接压迫尾骨尖与骶骨正中骨嵴。',
    movementVerification:
      '【MV 复测】站立向对侧转体伸展手臂，体会臀部到后背对角线的牵拉感是否释放。',
  },
  {
    id: 'LA-CX',
    code: 'LA-CX',
    nameZh: '阔筋膜张肌/髂胫束体侧协调中心',
    nameEn: 'Latero-Coxa (Tensor Fasciae Latae / Iliotibial Tract CC)',
    segment: 'CX',
    segmentNameZh: '髋关节节段 (CX)',
    direction: 'LA',
    directionNameZh: '外侧序列 (LA)',
    roleType: 'CC',
    primaryPartId: 'FJ1438',
    relatedPartIds: ['FJ1438', 'FJ1423'],
    coords: [-0.1553, 0.9131, 0.0174],
    muscleGroupZh: '阔筋膜张肌（TFL）、髂胫束近端（Iliotibial Tract）',
    fasciaStructureZh: '阔筋膜（Fascia Lata）外侧增厚带',
    layer: 'superficial_muscle',
    steccoSequence: 'LA（冠状面外侧序列）髋部站',
    anatomyTrains: ['SPL', 'DFL'],
    sedentaryRole: 'primary_shortened_lock',
    defaultSedentaryAdhesion: 0.81,
    biomechanicalSummary:
      '【螺旋线 SPL 下半身锚点】阔筋膜张肌处于屈髋位时极易缩短锁死，向上通过腹外斜肌与前锯肌（ME-SC）及菱形肌（RE-SC）相连！当它锁死骨盆前倾/侧倾时，这股拉力会沿螺旋线一路传到上胸椎和肩胛骨。',
    palpationLandmark:
      '裤兜口外侧，髂前上棘外下方约 2-3 指，大腿外侧最靠前方的饱满肌腹（屈髋内旋大腿时明显鼓起处）。',
    releaseTechnique:
      '侧卧或俯卧斜侧，将泡沫轴或筋膜球精准压在裤兜口外侧的阔筋膜张肌肌腹（而非大腿外侧中段的骨性髂胫束），停留深呼吸 90 秒。',
    releasePriorityOrder: 2,
    redTeamWarning:
      '⚠️ 不要拿狼牙棒疯狂滚压大腿外侧中段的纯腱性髂胫束（无法被滚松且易引发滑囊炎），必须按压近端髋前外侧的阔筋膜张肌肌腹！',
    movementVerification:
      '【MV 复测】自然站立做骨盆左右摆动与侧屈伸展，感受髋外侧与侧腰的轻松感。',
  },
];

export const STECCO_NODES_BY_ID: Record<string, SteccoNode> = Object.fromEntries(
  STECCO_NODES.map((n) => [n.id, n])
);

/**
 * Maps any BodyParts3D mesh partId (both Right FJxxxx and Left mirrored FJxxxxM)
 * to the corresponding SteccoNode(s) for instant 3D raycast lookup.
 */
export function findSteccoNodesByPartId(partId: string): SteccoNode[] {
  const normalizedId = partId.endsWith('M') ? partId.slice(0, -1) : partId;
  return STECCO_NODES.filter(
    (node) =>
      node.primaryPartId === partId ||
      node.primaryPartId === normalizedId ||
      node.relatedPartIds.includes(partId) ||
      node.relatedPartIds.includes(normalizedId)
  );
}
