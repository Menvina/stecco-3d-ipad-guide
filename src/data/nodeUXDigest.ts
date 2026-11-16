import { STECCO_NODES, SteccoNode } from './steccoAtlas';

export type LoopGroup =
  | 'outgoing_front' // 去程：手掌/前臂屈旋前 → 上臂前内侧 → 胸小肌/前胸 (主动缩短锁死)
  | 'returning_back' // 回程：手背/小鱼际 → 前臂伸肌/外旋 → 冈下肌/肩胛提肌 (悬空等长疲劳锁死)
  | 'victim_cp'      // 终点受害痛点：菱形肌/胸椎/腰背/颈后 (被动离心拉长受拉区)
  | 'axial_pelvis';  // 躯干与骨盆底座链：髂腰肌/臀肌/枕下/斜角肌

export interface DigestNodeUX {
  loopGroup: LoopGroup;
  loopGroupLabelZh: string;
  shortTitleZh: string; // e.g. "胸小肌 (头号元凶)"
  oneLineSummaryZh: string; // Max 28 chars: instant takeaway
  palpationSteps: [string, string, string]; // 3 bite-sized steps to find it
  releaseSpec: {
    tool: string;
    direction: string;
    duration: string;
  };
  shortWarningZh: string;
  shortTestZh: string;
}

export const NODE_UX_DIGEST: Record<string, DigestNodeUX> = {
  'AN-SC': {
    loopGroup: 'outgoing_front',
    loopGroupLabelZh: '去程前侧链 · 锁死核心',
    shortTitleZh: '胸小肌 (拉扯胸椎的头号元凶)',
    oneLineSummaryZh: '死死勾住肩胛骨喙突往前拽，导致后背菱形肌与胸椎全天被拉长扯痛',
    palpationSteps: [
      '1. 锁骨外1/3下方摸到圆硬骨突（喙突）',
      '2. 向乳头内上方（第3-4肋）移2指',
      '3. 放松胸大肌，向肋骨深按酸痛条索',
    ],
    releaseSpec: {
      tool: '筋膜球靠门框 / 对侧四指',
      direction: '斜向肋骨深压 + 吸气挺胸后缩肩胛',
      duration: '90–120 秒',
    },
    shortWarningZh: '若整条手臂发麻说明压到臂丛神经，请向内下方移 1cm',
    shortTestZh: '松后自然站立，肩膀会自动下沉打开，后背紧绷感立减',
  },
  'ER-HU': {
    loopGroup: 'returning_back',
    loopGroupLabelZh: '回程背侧链 · 黄金枢纽',
    shortTitleZh: '冈下肌/小圆肌 (手背连胸椎的必经桥)',
    oneLineSummaryZh: '将前臂与手背的僵硬跨过肩胛骨直接拽在菱形肌和胸椎棘突上',
    palpationSteps: [
      '1. 摸到肩胛骨背面横行的“肩胛冈”骨棱',
      '2. 往下移 2-3 指进入冈下窝凹陷中央',
      '3. 按压最酸胀的结节（天宗穴深层）',
    ],
    releaseSpec: {
      tool: '筋膜球靠墙 / 平躺垫球',
      direction: '双臂抱胸拉开肩胛，压球做手臂内外旋',
      duration: '90–120 秒',
    },
    shortWarningZh: '在肩胛骨骨面上滚动，勿滑入上方切迹压迫神经',
    shortTestZh: '做扩胸转体与摸对侧肩胛动作，胸椎拉扯感会立刻松开大半',
  },
  'RE-CA': {
    loopGroup: 'returning_back',
    loopGroupLabelZh: '回程背侧链 · 远端源头',
    shortTitleZh: '前臂指伸肌/腕伸肌 (悬腕打字重灾区)',
    oneLineSummaryZh: '敲键盘鼠标时手腕长期悬空背伸，僵硬张力一路向上拽紧肩背与胸椎',
    palpationSteps: [
      '1. 前臂背面，手肘外侧到手腕连线中上1/3',
      '2. 动一动中指，摸到明显跳动的肌腹最高点',
      '3. 横向拨动可摸到硬条索结节',
    ],
    releaseSpec: {
      tool: '对侧大拇指 / 筋膜球压桌面',
      direction: '深压结节 + 主动缓慢勾手腕/伸手腕',
      duration: '90 秒',
    },
    shortWarningZh: '若有虎口放射麻感（桡神经深支），请减轻力度略偏尺侧',
    shortTestZh: '手臂前伸勾手腕并夹背，整条小臂到后背瞬间变轻盈',
  },
  'AN-CA': {
    loopGroup: 'outgoing_front',
    loopGroupLabelZh: '去程前侧链 · 远端源头',
    shortTitleZh: '前臂腕屈肌群 (抓握鼠标/键盘锁死点)',
    oneLineSummaryZh: '手指抓握屈曲张力经此上传至肱二头肌与胸小肌，把肩膀往前拽',
    palpationSteps: [
      '1. 小臂掌侧（内侧），肘窝到腕横纹中上1/3',
      '2. 用力握拳时最隆起的肌腹中央',
      '3. 深按寻找酸胀硬结',
    ],
    releaseSpec: {
      tool: '对侧肘尖 / 大拇指按压',
      direction: '按住肌腹 + 主动缓慢张手伸腕（锚定拉伸）',
      duration: '60–90 秒',
    },
    shortWarningZh: '避开手腕近端桡动脉号脉搏动点',
    shortTestZh: '伸直手臂掌心向前压手腕，小臂内侧不再紧绷',
  },
  'IR-CU': {
    loopGroup: 'outgoing_front',
    loopGroupLabelZh: '去程前侧链 · 旋前锁扣',
    shortTitleZh: '旋前圆肌 (双手放键盘鼠标必锁死)',
    oneLineSummaryZh: '只要手心向下用键鼠它就100%缩短，顺着内旋链迫使大臂内旋、圆肩内扣',
    palpationSteps: [
      '1. 肘窝横纹内侧（肱骨内上髁）往下移2指',
      '2. 斜向小臂中央走行的厚实肌条',
      '3. 翻手掌时能感觉到它在指下滑动',
    ],
    releaseSpec: {
      tool: '对侧大拇指指腹',
      direction: '手心朝下放松时按住它，再缓慢翻掌心朝天 15 次',
      duration: '60–90 秒',
    },
    shortWarningZh: '正中神经从此穿过，以“按住+主动翻掌”为主，勿用尖物死顶',
    shortTestZh: '双肘贴肋骨向外翻掌心朝天，翻掌角度明显变大',
  },
  'AN-CU': {
    loopGroup: 'outgoing_front',
    loopGroupLabelZh: '去程前侧链 · 肘前中继',
    shortTitleZh: '肱肌与二头肌腱膜 (曲肘打字锁扣)',
    oneLineSummaryZh: '长期曲肘90°打字使其缩短，经二头肌短头直接下拉肩胛骨喙突',
    palpationSteps: [
      '1. 肘窝横纹上方 2-3 指',
      '2. 肱二头肌大肌腹下端深层及内侧扇形腱膜',
      '3. 屈肘放松时向深层触及',
    ],
    releaseSpec: {
      tool: '对侧拇指指腹',
      direction: '屈肘按住深层肌腹 → 缓慢伸直手肘并旋前',
      duration: '60–90 秒',
    },
    shortWarningZh: '避开肘窝正中央内侧明显的肱动脉脉搏跳动处',
    shortTestZh: '手臂向身体后方伸直外旋，肘窝与肩前不再卡住',
  },
  'IR-HU': {
    loopGroup: 'outgoing_front',
    loopGroupLabelZh: '去程前侧链 · 圆肩主锁',
    shortTitleZh: '胸大肌胸肋部 (圆肩含胸表层大锁)',
    oneLineSummaryZh: '将大臂锁死在内旋前伸位，与深层胸小肌粘连在一起共同拉扯后背',
    palpationSteps: [
      '1. 锁骨下方 3-4 指、靠近腋窝前壁内侧',
      '2. 用对侧手可以一把抓起的厚实胸肌束',
      '3. 重点找靠近腋前壁肌腱过渡区的痛点',
    ],
    releaseSpec: {
      tool: '对侧手捏拿 / 筋膜球靠墙角',
      direction: '压住胸肌外上侧 + 手臂做“招财猫”贴墙上下滑动',
      duration: '90 秒',
    },
    shortWarningZh: '仅在锁骨下方与腋前壁肌束操作，避开乳腺组织',
    shortTestZh: '靠墙站立做双臂90°外展，手背能轻松贴墙无拉扯',
  },
  'ME-SC': {
    loopGroup: 'outgoing_front',
    loopGroupLabelZh: '螺旋滑轨链 · 肩胛吸盘',
    shortTitleZh: '前锯肌 (把肩胛骨粘在侧胸壁的吸盘)',
    oneLineSummaryZh: '与菱形肌像拔河一样连在肩胛骨内侧缘，它缩短粘连会把菱形肌往外扯痛',
    palpationSteps: [
      '1. 举起手臂，找到腋窝正下方侧胸壁',
      '2. 第 4-6 肋骨外侧表面（锯齿状贴骨肌肉）',
      '3. 沿肋骨表面前后拨动寻找酸痛点',
    ],
    releaseSpec: {
      tool: '泡沫轴侧卧 / 对侧四指指腹',
      direction: '紧贴腋下第4-6肋骨弧面做前后横向滑动 + 深吸气',
      duration: '90 秒',
    },
    shortWarningZh: '贴着肋骨弧面平行摩擦，切勿用尖锐硬物垂直猛戳肋骨',
    shortTestZh: '做夹背扩胸动作，肩胛骨在后背滑动瞬间顺滑无阻',
  },
  'AN-DI': {
    loopGroup: 'outgoing_front',
    loopGroupLabelZh: '去程前侧链 · 手掌起点',
    shortTitleZh: '大鱼际肌群 (捏鼠标/敲空格末梢锚点)',
    oneLineSummaryZh: '手臂前深线最远端起点，拇指捏握僵硬会顺着桡骨一路传到胸小肌',
    palpationSteps: [
      '1. 手掌正面大拇指根部最饱满的肉垫',
      '2. 靠近第一掌骨骨缘中央',
      '3. 深按有明显酸胀感处',
    ],
    releaseSpec: {
      tool: '对侧拇指指关节 / 小筋膜球',
      direction: '垂直于大拇指掌骨做深层横向拨动',
      duration: '60 秒',
    },
    shortWarningZh: '若拇指尖发麻请避开指根神经支，往肉垫中央移 5mm',
    shortTestZh: '五指尽力张开，掌心与大拇指根部紧绷感消失',
  },
  'RE-DI': {
    loopGroup: 'returning_back',
    loopGroupLabelZh: '回程背侧链 · 手背起点',
    shortTitleZh: '手背骨间肌 (悬指敲键盘末梢锚点)',
    oneLineSummaryZh: '打字时手指时刻微翘悬空，从手背启动直达肩胛与胸椎的回程紧绷链',
    palpationSteps: [
      '1. 手背大拇指与食指掌骨之间（合谷区靠食指掌骨侧）',
      '2. 以及第2-3、3-4掌骨之间的骨缝凹陷',
      '3. 指尖卡入掌骨间隙贴骨壁按压',
    ],
    releaseSpec: {
      tool: '对侧拇指指尖',
      direction: '卡进掌骨骨缝贴着骨壁做深层揉拨',
      duration: '60 秒',
    },
    shortWarningZh: '深压骨缝肌腹，不要在手背表皮静脉和骨面上野蛮刮擦',
    shortTestZh: '握拳再张开五指，手背与腕背明显变轻松',
  },
  'ME-DI': {
    loopGroup: 'returning_back',
    loopGroupLabelZh: '回程背侧链 · 尺侧起点',
    shortTitleZh: '小鱼际肌群 (手掌外侧压桌面支点)',
    oneLineSummaryZh: '手臂后深线起点，沿尺骨→肱三头肌→冈下肌→菱形肌直接回传到胸椎',
    palpationSteps: [
      '1. 手掌小指侧外缘肉垫',
      '2. 手腕豌豆骨往小指方向移 2 指',
      '3. 贴着第五掌骨内侧缘按压',
    ],
    releaseSpec: {
      tool: '对侧指关节',
      direction: '向第五掌骨骨面做深层短距摩擦',
      duration: '60 秒',
    },
    shortWarningZh: '避开手腕豌豆骨旁尺神经管，防止小指发麻',
    shortTestZh: '手腕向大拇指侧倾斜，尺侧紧绷感消退',
  },
  'CF-CA': {
    loopGroup: 'outgoing_front',
    loopGroupLabelZh: '去程前侧链 · 腕管融合中心',
    shortTitleZh: '腕屈肌支持带 (手掌到小臂的总闸门)',
    oneLineSummaryZh: '手腕压桌沿导致支持带致密化，锁死手掌与前臂之间的张力滑行',
    palpationSteps: [
      '1. 手腕掌侧横纹正上方',
      '2. 摸到两侧突出的豌豆骨（尺侧）与舟骨结节（桡侧）',
      '3. 定位两侧骨突附着缘（勿按正中央）',
    ],
    releaseSpec: {
      tool: '双手大拇指指腹',
      direction: '扣住手腕两侧骨突，向左右两侧做横向牵拉开合',
      duration: '60 秒',
    },
    shortWarningZh: '严禁拿硬球重压手腕横纹正中央（正中神经腕管区）！',
    shortTestZh: '双手合十做祈祷状压手腕，腕前卡压感明显减轻',
  },
  'ME-CA': {
    loopGroup: 'outgoing_front',
    loopGroupLabelZh: '去程/回程交汇 · 尺侧链',
    shortTitleZh: '尺侧腕屈肌 (手腕向小指歪斜用鼠标)',
    oneLineSummaryZh: '连接小鱼际与肱骨内上髁，把鼠标手尺偏张力上传至大臂与肩胛',
    palpationSteps: [
      '1. 小臂小指侧（尺骨骨棱内侧约1指）',
      '2. 小臂中段肌腹处',
      '3. 贴着尺骨内侧壁深按',
    ],
    releaseSpec: {
      tool: '对侧拇指 / 筋膜球',
      direction: '垂直尺骨走向做横向拨动',
      duration: '60 秒',
    },
    shortWarningZh: '远离手肘内侧麻筋（尺神经沟），在肘下4指以外操作',
    shortTestZh: '手腕向拇指侧偏斜，小臂尺侧牵拉感解除',
  },
  'LA-CU': {
    loopGroup: 'returning_back',
    loopGroupLabelZh: '回程背侧链 · 肘外侧枢纽',
    shortTitleZh: '肱桡肌/腕长伸肌 (网球肘/鼠标臂核心点)',
    oneLineSummaryZh: '悬臂用鼠标时极易形成结节，沿外侧肌间隔直接向上拉拽三角肌与颈侧',
    palpationSteps: [
      '1. 曲肘90°且大拇指朝上（端啤酒杯姿势）',
      '2. 手肘外侧最隆起的那条粗肌束',
      '3. 肘横纹外侧上下 2 指处捏按极酸',
    ],
    releaseSpec: {
      tool: '对侧拇食指钳形捏提 / 筋膜球靠墙',
      direction: '捏住肌腹横向揉拨，或压球配合手腕旋转',
      duration: '90 秒',
    },
    shortWarningZh: '捏提肌腹比垂直硬砸桡骨头更安全（避开桡神经分支）',
    shortTestZh: '伸直手肘向内转手腕，肘外侧酸痛感立减',
  },
  'ER-CU': {
    loopGroup: 'returning_back',
    loopGroupLabelZh: '回程背侧链 · 外旋中继',
    shortTitleZh: '旋后肌 (被旋前打字长期扭转锁死的深肌)',
    oneLineSummaryZh: '在前臂深层被长期拉长扭转，顺着外旋序列直接引爆肩胛冈下肌(ER-HU)',
    palpationSteps: [
      '1. 手肘外上髁往下移 2 指',
      '2. 桡骨头后外侧深层（拨开表层伸肌）',
      '3. 旋转小臂时能感到深层贴骨肌肉收缩',
    ],
    releaseSpec: {
      tool: '对侧大拇指深按',
      direction: '深按桡骨头远端后外侧 + 缓慢交替翻手掌',
      duration: '60–90 秒',
    },
    shortWarningZh: '若出现手背/无名指放射麻感请放轻力度',
    shortTestZh: '小臂旋前旋后更加顺畅，肩外旋同步变轻松',
  },
  'RE-CU': {
    loopGroup: 'returning_back',
    loopGroupLabelZh: '回程背侧链 · 大臂后侧',
    shortTitleZh: '肱三头肌远端 (尺骨到肩胛盂下结节桥梁)',
    oneLineSummaryZh: '将尺侧手腕的僵硬向上传至肱三头肌长头，直接下拉肩胛骨外侧缘',
    palpationSteps: [
      '1. 手肘尖（鹰嘴）往上移 3-4 指',
      '2. 大臂后外侧肌腹与肌腱交界处',
      '3. 按压寻找酸胀点',
    ],
    releaseSpec: {
      tool: '泡沫轴 / 筋膜球压桌面或墙面',
      direction: '压住大臂后外侧 + 缓慢屈伸手肘',
      duration: '60 秒',
    },
    shortWarningZh: '避开手肘内侧麻筋与大臂中段桡神经沟',
    shortTestZh: '举手曲肘摸后背对侧肩胛，大臂后侧不再紧绷',
  },
  'AN-HU': {
    loopGroup: 'outgoing_front',
    loopGroupLabelZh: '去程前侧链 · 肩前锁扣',
    shortTitleZh: '三角肌前束/喙肱肌 (手臂前伸键盘锁死点)',
    oneLineSummaryZh: '双手长期放在身前桌面导致肩前侧缩短，与胸小肌合力把肩膀往前拉',
    palpationSteps: [
      '1. 锁骨外 1/3 正下方',
      '2. 肩前侧最饱满处偏内侧（三角肌胸大肌间沟外缘）',
      '3. 按压有明显酸胀感',
    ],
    releaseSpec: {
      tool: '筋膜球抵墙角',
      direction: '身体微前倾压球 + 手臂缓慢向后背伸展',
      duration: '60–90 秒',
    },
    shortWarningZh: '按在三角肌前束肌腹上，避开沟正中的头静脉',
    shortTestZh: '双手背后十指交扣后抬，肩前侧不再卡滞',
  },
  'ME-HU': {
    loopGroup: 'outgoing_front',
    loopGroupLabelZh: '去程前侧链 · 喙突直通车',
    shortTitleZh: '喙肱肌 (连接大臂内侧与肩胛喙突的捷径)',
    oneLineSummaryZh: '夹肘打字时缩短，跨过肩关节直接拽紧肩胛骨喙突上的胸小肌',
    palpationSteps: [
      '1. 大臂内侧上 1/3（腋窝下方）',
      '2. 肱二头肌内侧缘贴骨面的条索肌',
      '3. 轻柔贴二头肌前内缘触及',
    ],
    releaseSpec: {
      tool: '对侧拇指指腹（轻柔）',
      direction: '贴着二头肌前缘向肱骨骨面温和慢速拨压',
      duration: '45–60 秒',
    },
    shortWarningZh: '高危区！后方紧邻正中/尺神经束，一旦手麻立即移向二头肌前侧',
    shortTestZh: '手臂高举过头顶，腋下与大臂内侧不再牵拉',
  },
  'LA-HU': {
    loopGroup: 'returning_back',
    loopGroupLabelZh: '回程背侧链 · 肩峰枢纽',
    shortTitleZh: '三角肌中束/冈上肌 (悬空握鼠标肩外展锁扣)',
    oneLineSummaryZh: '右手向外悬空握鼠标导致肩外侧疲劳致密，跨过肩峰直拉斜方肌与斜角肌',
    palpationSteps: [
      '1. 肩膀最外侧骨尖（肩峰）往下移 2-3 指',
      '2. 三角肌中束最饱满的肌腹中央',
      '3. 深按常有明显酸痛结节',
    ],
    releaseSpec: {
      tool: '筋膜球侧身靠墙',
      direction: '侧压三角肌中束 + 手臂缓慢内外旋转',
      duration: '60–90 秒',
    },
    shortWarningZh: '按压肩峰下3指肌腹，勿死顶肩峰下骨缝滑囊区',
    shortTestZh: '手臂侧平举到头顶，肩膀外侧酸痛感减轻',
  },
  'RE-HU': {
    loopGroup: 'returning_back',
    loopGroupLabelZh: '回程背侧链 · 腋后枢纽',
    shortTitleZh: '大圆肌/三角肌后束 (连接上臂与胸腰筋膜)',
    oneLineSummaryZh: '锁死肩胛骨外侧缘，并通过背阔肌向下斜向拉拽中下胸椎与腰背',
    palpationSteps: [
      '1. 腋窝后壁最厚实的肌肉束',
      '2. 肩胛骨外侧缘中下 1/3 处',
      '3. 用对侧手从腋下往后一把捏住处',
    ],
    releaseSpec: {
      tool: '筋膜球侧卧或靠墙 / 对侧手捏拿',
      direction: '压住肩胛外侧缘腋后壁 + 手臂缓慢举过头顶',
      duration: '90 秒',
    },
    shortWarningZh: '若肩膀外侧发麻（四边孔腋神经），请略往肩胛下角方向移',
    shortTestZh: '双手举过头顶贴耳，腋窝后方不再紧绷拉扯',
  },
  'IR-SC': {
    loopGroup: 'outgoing_front',
    loopGroupLabelZh: '去程前侧链 · 锁骨锚点',
    shortTitleZh: '锁骨下肌 (胸小肌的孪生锁扣)',
    oneLineSummaryZh: '与胸小肌包在同一层筋膜里，把锁骨向下锁死，限制扩胸与肩胛后缩',
    palpationSteps: [
      '1. 锁骨正中央下缘的凹陷沟',
      '2. 含胸低头让表层放松',
      '3. 指尖向上顶向锁骨下表面',
    ],
    releaseSpec: {
      tool: '对侧食中指指尖',
      direction: '力量向上顶住锁骨下缘，做水平横向轻拨',
      duration: '60 秒',
    },
    shortWarningZh: '力量必须“向上顶向锁骨”，严禁向深部第一肋神经血管束重压',
    shortTestZh: '双肩向后大绕环，锁骨与前胸立刻感觉打开',
  },
  'LA-SC': {
    loopGroup: 'axial_pelvis',
    loopGroupLabelZh: '头颈肩臂链 · 胸廓出口核心',
    shortTitleZh: '中斜角肌/上斜方肌 (引爆膏肓痛与手麻的名点)',
    oneLineSummaryZh: '探颈耸肩时锁死，既向外拉扯手臂，又经肩胛背神经直接放射到肩胛内侧痛',
    palpationSteps: [
      '1. 脖子侧面下半部（锁骨上方约2指）',
      '2. 胸锁乳突肌后缘与上斜方肌前缘之间的凹陷',
      '3. 头微偏同侧，指腹轻触即可摸到紧绷肌束',
    ],
    releaseSpec: {
      tool: '食中指指腹（极轻柔）',
      direction: '头偏同侧放松，指腹贴肌腹做极温和慢速微揉',
      duration: '45–60 秒',
    },
    shortWarningZh: '臂丛神经穿出区！只用指腹温和轻揉，绝对禁用筋膜枪打颈侧！',
    shortTestZh: '耳朵找对侧肩膀做侧屈，颈侧与肩胛骨缝放射痛同步减轻',
  },
  'ER-SC': {
    loopGroup: 'returning_back',
    loopGroupLabelZh: '回程背侧链 · 肩胛上角',
    shortTitleZh: '肩胛提肌 (耸肩打字与落枕重灾区)',
    oneLineSummaryZh: '承接冈下肌(ER-HU)传来的手臂外旋张力，向上悬吊拉扯肩胛上角与颈椎',
    palpationSteps: [
      '1. 肩膀上方（肩井穴）往后下方摸',
      '2. 触及肩胛骨最内上方尖角（肩胛上角）骨缘',
      '3. 按压骨角上方的硬结',
    ],
    releaseSpec: {
      tool: '筋膜球靠高背椅或墙面',
      direction: '压住肩胛上角 + 向对侧腋窝方向低头拉伸',
      duration: '60–90 秒',
    },
    shortWarningZh: '务必先松开前胸胸小肌(AN-SC)，再松解肩胛提肌',
    shortTestZh: '低头并左右转头，肩颈交界处不再扯痛',
  },
  'RE-SC': {
    loopGroup: 'victim_cp',
    loopGroupLabelZh: '受拉受害痛点 (CP) · 肩胛内侧',
    shortTitleZh: '大小菱形肌/中斜方肌 (膏肓痛感知中心 CP)',
    oneLineSummaryZh: '被前方胸小肌和外侧手臂链双向拉长的“受害者”，必须先松前胸手臂再处理它',
    palpationSteps: [
      '1. 后背肩胛骨内侧缘与胸椎棘突之间的肌沟',
      '2. 约与肩胛冈至肩胛下角中点齐平（膏肓区）',
      '3. 可摸到被拉紧如琴弦的条索',
    ],
    releaseSpec: {
      tool: '花生球温和滚动 + 主动夹背训练',
      direction: '先完成前3步解锁！再温和滚压此处60秒并做15次W字扩胸激活',
      duration: '60 秒 + 15 次激活',
    },
    shortWarningZh: '切忌在未松胸小肌前暴力踩背或筋膜枪猛砸此处，否则越按越痛！',
    shortTestZh: '挺胸向后夹背，肩胛骨能轻松靠拢且无拉扯痛',
  },
  'RE-TH': {
    loopGroup: 'victim_cp',
    loopGroupLabelZh: '受拉受害痛点 (CP) · 胸椎终点',
    shortTitleZh: '胸椎中段竖脊肌 (久坐胸椎痛终端感知中心 CP)',
    oneLineSummaryZh: '手到肩胛去回程两条锁死链的最终受力终点，只有解锁上游节点才能彻底卸力',
    palpationSteps: [
      '1. 后背两肩胛骨之间（T4–T8 中胸段）',
      '2. 脊柱正中棘突旁开 1.5–3 指的竖脊肌隆起',
      '3. 久坐后常感整片僵硬伴随深层拉扯感',
    ],
    releaseSpec: {
      tool: '花生球 / 泡沫轴（最后一步执行）',
      direction: '在解锁手部、前臂、胸小肌、冈下肌后，垫球做温和胸椎后伸呼吸',
      duration: '60–90 秒',
    },
    shortWarningZh: '勿直接暴力砸正中棘突骨尖；后伸时收住肋骨勿用腰椎反弓代偿',
    shortTestZh: '坐姿双手抱胸左右转体+深吸气，胸椎拉扯感彻底释放！',
  },
  'AN-TH': {
    loopGroup: 'outgoing_front',
    loopGroupLabelZh: '去程前侧链 · 前胸折叠锁',
    shortTitleZh: '胸大肌腹侧部/上腹直肌鞘 (含胸窝坐锁扣)',
    oneLineSummaryZh: '久坐窝在椅子里使前胸肋弓筋膜缩短下拽，让你挺胸时像被绳子拉住',
    palpationSteps: [
      '1. 胸骨最下端（剑突）往外侧移 2-3 指',
      '2. 第 5-7 肋软骨表面（胸肌下缘与上腹交界）',
      '3. 按压肋软骨表面筋膜',
    ],
    releaseSpec: {
      tool: '双手指腹横向拨揉',
      direction: '沿第5-7肋弓表面横向摩擦 + 双手上举深吸气展腹',
      duration: '60 秒',
    },
    shortWarningZh: '按压两侧肋弓表面，切勿垂直按压正中剑突软骨尖',
    shortTestZh: '挺胸深吸气，感觉前胸肋弓轻松向上打开',
  },
  'ER-TH': {
    loopGroup: 'returning_back',
    loopGroupLabelZh: '回程背侧链 · 深层呼吸刺痛点',
    shortTitleZh: '上后锯肌 (藏在菱形肌深面的吸气刺痛源)',
    oneLineSummaryZh: '位于菱形肌正下方的肋角上，与冈下肌同属外旋链，锁死时深吸气后背如刀割',
    palpationSteps: [
      '1. 双臂在胸前交叉抱肩（把肩胛骨往外拉开）',
      '2. 暴露肩胛骨内上缘深面的第 2-5 肋骨角',
      '3. 按压肋骨转角处深层肌束',
    ],
    releaseSpec: {
      tool: '筋膜球抵墙（双臂抱胸位）',
      direction: '拉开肩胛骨后压球，配合深慢吸气与呼气释放',
      duration: '60 秒',
    },
    shortWarningZh: '以舒适酸胀为度，勿屏气硬顶肋骨角',
    shortTestZh: '深吸气满肺并转体，后背深层吸气扯痛消失',
  },
  'AN-CL': {
    loopGroup: 'axial_pelvis',
    loopGroupLabelZh: '头颈前链 · 探颈元凶',
    shortTitleZh: '胸锁乳突肌 (探颈盯屏幕把头往前拽的元凶)',
    oneLineSummaryZh: '长期探头看屏幕使其缩短，把头颅往前拉，迫使颈后与上胸椎承受30公斤拉力',
    palpationSteps: [
      '1. 头转向对侧，摸到耳后斜向锁骨内侧隆起的大筋',
      '2. 用拇指和食指将其从脖子表面轻轻捏起',
      '3. 从下往上逐段捏找酸痛结节',
    ],
    releaseSpec: {
      tool: '拇指与食指指腹捏提',
      direction: '头微偏同侧放松，将肌腹“向外捏起”轻柔搓揉',
      duration: '60 秒',
    },
    shortWarningZh: '只能用手指“向外捏起”肌肉，严禁向颈内侧动脉窦深按！',
    shortTestZh: '做收下巴（Chin Tuck）与仰头动作，颈前紧绷感消失',
  },
  'RE-CL': {
    loopGroup: 'victim_cp',
    loopGroupLabelZh: '受拉受害痛点 (CP) · 颈后段',
    shortTitleZh: '头夹肌/头半棘肌 (颈后僵痛感知中心 CP)',
    oneLineSummaryZh: '被前方胸锁乳突肌和下方圆肩拉长的受害区，跨棘突直接连向菱形肌',
    palpationSteps: [
      '1. 脖子后方中段（C4-C7 棘突两旁约2指）',
      '2. 按压上斜方肌深层的纵向肌束',
      '3. 仰头低头时能感到深层张力变化',
    ],
    releaseSpec: {
      tool: '双手四指指腹梳理',
      direction: '先松颈前(AN-CL)与胸小肌(AN-SC)！再扣住颈后配合缓慢点头梳理',
      duration: '60 秒',
    },
    shortWarningZh: '切勿暴力扳拧颈椎或直压正中棘突',
    shortTestZh: '低头下巴找胸口并左右转头，颈后连带胸椎上段不再扯痛',
  },
  'RE-CP': {
    loopGroup: 'axial_pelvis',
    loopGroupLabelZh: '后表线中枢 · 颅底陀螺仪',
    shortTitleZh: '枕下肌群 (盯屏幕眼疲劳与整条脊柱张力总控)',
    oneLineSummaryZh: '与眼球运动神经相连，盯屏幕锁死后会顺着后表线一路拉紧胸椎与腰背竖脊肌',
    palpationSteps: [
      '1. 后脑勺颅底骨缘正下方凹陷处（风池穴水平）',
      '2. 贴着枕骨下表面向上向深层按压',
      '3. 闭眼转动眼球能感到指下肌肉微动',
    ],
    releaseSpec: {
      tool: '平躺垫花生球',
      direction: '枕骨下缘垫花生球，闭眼做微小收下巴点头 + 眼球左右慢转',
      duration: '90 秒',
    },
    shortWarningZh: '深处有椎动脉！严禁仰头暴力戳刺或用筋膜枪，必须平躺温和垫球',
    shortTestZh: '坐姿低头抱胸或弯腰，后脑勺到胸椎整条后表线同步变松',
  },
  'AN-CX': {
    loopGroup: 'axial_pelvis',
    loopGroupLabelZh: '久坐底座链 · 屈髋头号锁扣',
    shortTitleZh: '髂腰肌/股直肌 (久坐8小时腰背与下胸椎被拉的底座元凶)',
    oneLineSummaryZh: '久坐屈髋90°使其严重缩短，直接从前方死死拽住T12-L5椎体，导致起身腰背痛',
    palpationSteps: [
      '1. 摸到骨盆前外侧最突出的骨尖（髂前上棘）',
      '2. 往肚脐方向移2指（髂窝内壁）及正下方2指（股直肌）',
      '3. 仰卧屈膝放松腹肌后向深层骨盆内壁沉入',
    ],
    releaseSpec: {
      tool: '四指深按 + 单膝弓步拉伸',
      direction: '仰卧深按髂窝内壁配合伸腿滑动60秒 + 弓步伸髋拉伸30秒',
      duration: '90 秒',
    },
    shortWarningZh: '按在髂前上棘紧内侧或正下方，避开腹股沟中点股动脉搏动区',
    shortTestZh: '从椅子站起并后伸大腿，腰骶部酸痛消失、站立立刻挺拔',
  },
  'RE-LU': {
    loopGroup: 'victim_cp',
    loopGroupLabelZh: '受拉受害痛点 (CP) · 下腰背',
    shortTitleZh: '腰段竖脊肌/胸腰筋膜 (久坐下背痛感知中心 CP)',
    oneLineSummaryZh: '受前方髂腰肌下拽与上方圆肩上拉的夹击，向上顺竖脊肌直接拉紧胸椎(RE-TH)',
    palpationSteps: [
      '1. 腰部第2-4腰椎棘突旁开 2-3 指',
      '2. 肋骨下缘与骨盆髂嵴之间最厚实的肌腹',
      '3. 按压外侧缘筋膜交汇处',
    ],
    releaseSpec: {
      tool: '花生球/网球靠墙滚动',
      direction: '先解锁前侧髂腰肌(AN-CX)与臀肌！再靠墙温和滚压腰旁肌腹',
      duration: '60 秒',
    },
    shortWarningZh: '切勿在双腿平放仰卧位用硬泡沫轴猛顶下腰椎反弓',
    shortTestZh: '站立缓慢弯腰再逐节起身，腰背部拉扯感明显消退',
  },
  'ER-CX': {
    loopGroup: 'axial_pelvis',
    loopGroupLabelZh: '久坐底座链 · 骨盆外旋锁',
    shortTitleZh: '梨状肌/臀中肌深层 (久坐压迫臀部与二郎腿锁死点)',
    oneLineSummaryZh: '久坐缺血粘连锁死骨盆与骶髂关节，向上经胸腰筋膜牵扯腰椎与胸肩',
    palpationSteps: [
      '1. 尾骨尖与大腿外侧大转子连线中点稍上方',
      '2. 臀部外上象限深层',
      '3. 翘二郎腿压球时酸胀最明显处',
    ],
    releaseSpec: {
      tool: '筋膜球坐压/躺压',
      direction: '同侧脚架对侧膝盖（4字腿拉开臀肌），压球停留深呼吸',
      duration: '90 秒',
    },
    shortWarningZh: '若出现沿大腿后侧放射麻痛（坐骨神经），将球向外上方移 2cm',
    shortTestZh: '坐姿翘4字腿下压膝盖，髋部与腰骶部瞬间松快',
  },
  'RE-PV': {
    loopGroup: 'axial_pelvis',
    loopGroupLabelZh: '后功能线 · 跨躯干对角线起点',
    shortTitleZh: '臀大肌上部 (经胸腰筋膜斜向拉拽对侧肩膀与下胸椎)',
    oneLineSummaryZh: '后功能线发动机，臀部筋膜粘连会跨过骶骨经背阔肌斜向拉扯中下胸椎',
    palpationSteps: [
      '1. 骨盆后方腰窝（髂后上棘）内下方约 2 指',
      '2. 骶骨外侧缘臀大肌最厚实的起始部',
      '3. 侧倾压球寻找酸痛点',
    ],
    releaseSpec: {
      tool: '筋膜球 / 泡沫轴',
      direction: '身体微向同侧倾，压住骶骨外侧臀肌上部缓慢滚动',
      duration: '60–90 秒',
    },
    shortWarningZh: '避开尾骨尖与骶骨正中骨棱',
    shortTestZh: '站立向对侧转体伸展手臂，后背对角线牵拉感释放',
  },
  'LA-CX': {
    loopGroup: 'axial_pelvis',
    loopGroupLabelZh: '螺旋线 · 骨盆侧方锁扣',
    shortTitleZh: '阔筋膜张肌 (屈髋锁死骨盆并经螺旋线拉拽前锯肌)',
    oneLineSummaryZh: '久坐屈髋使其缩短，向上经腹外斜肌连至前锯肌(ME-SC)，间接拉扯肩胛与胸椎',
    palpationSteps: [
      '1. 裤兜口外侧（髂前上棘外下方 2-3 指）',
      '2. 大腿外侧最靠前方的饱满肌腹',
      '3. 抬腿内旋时明显鼓起处',
    ],
    releaseSpec: {
      tool: '泡沫轴 / 筋膜球侧卧斜压',
      direction: '精准压在裤兜口外侧肌腹（勿滚大腿中段骨性髂胫束）',
      duration: '60–90 秒',
    },
    shortWarningZh: '只按近端髋前外侧肌腹，不要拿狼牙棒猛滚大腿外侧中段髂胫束',
    shortTestZh: '站立做侧腰伸展，髋外侧与侧腹紧绷感消退',
  },
  'CF-SC': {
    loopGroup: 'returning_back',
    loopGroupLabelZh: '肩胛右下侧 · 四肌交汇融合中心 (CF)',
    shortTitleZh: '肩胛下角右下侧融合点 (下斜方/大圆/背阔/前锯)',
    oneLineSummaryZh: '四大肌群跨平面交汇点，致密化会把肩胛下角像胶水一样粘死在肋骨上引起刺痛',
    palpationSteps: [
      '1. 背后摸到右侧肩胛骨最底端骨尖（肩胛下角）',
      '2. 向外下侧偏 0.5-1cm 的厚韧筋膜交界结节',
      '3. 双臂抱胸拉开肩胛下角后再按压最酸痛点',
    ],
    releaseSpec: {
      tool: '6-8cm 筋膜球靠墙或仰卧',
      direction: '抱胸旋出下角，球顶在骨尖外下软组织处 + 举手划弧剪切滑动',
      duration: '90–120 秒',
    },
    shortWarningZh: '错开骨尖直接硬碾（防滑囊炎），压在骨尖外下 1cm 软组织融合垫上',
    shortTestZh: '面对墙壁做双手贴墙向上滑举（Wall Slide），肩胛下角滑动不再卡顿弹响',
  },
  'CF-HU': {
    loopGroup: 'returning_back',
    loopGroupLabelZh: '肩胛右下外侧 · 小圆肌与四边孔融合点',
    shortTitleZh: '小圆肌 / 肩胛外下缘 (外旋-后伸融合锁)',
    oneLineSummaryZh: '深藏于大圆肌与冈下肌之间的肩胛外下缘深层钉子，控制肩外旋与后外侧酸痛',
    palpationSteps: [
      '1. 从肩胛下角沿外侧骨缘斜向上摸 3-4 指',
      '2. 冈下肌下缘与大圆肌上缘之间的紧绷条索缝隙',
      '3. 侧卧微后仰 30° 顶住最酸胀的硬结',
    ],
    releaseSpec: {
      tool: '小号筋膜球 / 花生球',
      direction: '侧卧顶住肩胛外侧缘偏下方，小臂做雨刷器式缓慢内外旋',
      duration: '60–90 秒',
    },
    shortWarningZh: '正下方缝隙有四边孔腋神经，若肩外侧发麻电击请向内上方移 1cm 贴骨面',
    shortTestZh: '手臂侧平举 90° 后做向后倒手外旋，肩后外下侧拉扯卡压感立减',
  },
  'RE-HU2': {
    loopGroup: 'returning_back',
    loopGroupLabelZh: '肩胛外下缘 · 肱三头肌长头纵行锚点',
    shortTitleZh: '肱三头肌长头近端 (盂下结节-腋后壁钢索)',
    oneLineSummaryZh: '跨肩肘双关节直接挂在肩胛外侧缘，与大圆肌层间粘连会猛拽肩胛右下侧',
    palpationSteps: [
      '1. 抬手摸大臂后内侧靠近腋窝后皱襞的粗肌束',
      '2. 顺着肌束向上追溯至肩胛骨外侧缘顶端',
      '3. 捏拿或按压紧贴腋后皱襞的条索结节',
    ],
    releaseSpec: {
      tool: '对侧拇食指捏揉 / 靠门框垂直压',
      direction: '举手抱头拉开长头，横向拨揉或靠门框做屈伸肘释放',
      duration: '60–90 秒',
    },
    shortWarningZh: '勿向腋窝深处前方动脉搏动处深抠，着力朝向后方腋后壁肌束',
    shortTestZh: '高举手臂屈肘摸后背（大臂贴耳），腋后外侧紧绷下拉感消退',
  },
  'IR-SC2': {
    loopGroup: 'outgoing_front',
    loopGroupLabelZh: '肩胛骨底面 · 深层肋面内旋锁',
    shortTitleZh: '肩胛下肌深面 (藏在肩胛底下的粘连黑洞)',
    oneLineSummaryZh: '贴在肩胛骨前肋面与后方冈下/大圆肌夹击粘连，让整块肩胛死死贴在肋骨上',
    palpationSteps: [
      '1. 右手放桌面或搭额头使腋窝表面肌肉完全松弛',
      '2. 对侧四指从腋后壁贴着肋骨斜向后内方肩胛骨底面滑入',
      '3. 指腹贴着肩胛骨前表面寻找深沉酸胀点（非硬抠）',
    ],
    releaseSpec: {
      tool: '对侧四指指腹温和静压（核心）',
      direction: '紧贴肩胛骨前骨面深吸气-吐气静压融化，配合微幅小臂外旋',
      duration: '60–90 秒',
    },
    shortWarningZh: '🚨 避开腋窝前上方血管与臂丛神经！指尖方向始终靠后贴在肩胛骨肋骨面上，手麻即退出',
    shortTestZh: '大臂夹紧身体屈肘 90° 向外打开（外旋），外旋角度显著增大且肩胛下不夹痛',
  },
  'LA-SC2': {
    loopGroup: 'returning_back',
    loopGroupLabelZh: '肩胛上缘 · 冈上窝外展深锁',
    shortTitleZh: '冈上肌冈上窝 (上斜方肌下方的外展吊索)',
    oneLineSummaryZh: '肩胛右下侧卡死时常迫使上方冈上肌超负荷代偿收缩，导致肩顶隐痛与抬手耸肩',
    palpationSteps: [
      '1. 先在肩胛背面摸到横行的“肩胛冈”硬骨棱',
      '2. 手指向上翻过骨棱半指进入的深凹槽',
      '3. 在上斜方肌下方摸到深层酸硬肌腹',
    ],
    releaseSpec: {
      tool: '小号筋膜球靠墙 / 对侧中指叠按',
      direction: '微前倾把球卡进肩胛冈上方凹槽，低头吐气深压停留',
      duration: '60–90 秒',
    },
    shortWarningZh: '力度以 4-6 分酸胀为准，勿用筋膜枪直角暴击肩胛冈骨棱',
    shortTestZh: '手臂从体侧缓慢贴耳高举过头，肩顶部顺滑无耸肩卡顿',
  },
  'CF-TH': {
    loopGroup: 'returning_back',
    loopGroupLabelZh: '后表背链 · 斜方肌尾端 T12 核心锚点',
    shortTitleZh: '斜方肌末尾 T12 棘突结节 (下斜方肌尾端锚点)',
    oneLineSummaryZh: '斜方肌最底端止于第12胸椎棘突，结节致密化会向上拽紧肩胛并拉紧整条胸椎弓弦',
    palpationSteps: [
      '1. 顺后背脊柱正中往下摸到第12肋骨交界处 (T11-T12棘突)',
      '2. 在棘突右侧紧邻处摸到厚韧的三角形肌腱结节',
      '3. 顺着旁侧软组织可触及厚韧的三角形肌腱硬结',
    ],
    releaseSpec: {
      tool: '筋膜球靠墙 / 平躺垫球 (避开正中骨尖)',
      direction: '压在T11-T12棘突右旁1指软组织结节，配合深呼气与沉肩',
      duration: '90 秒',
    },
    shortWarningZh: '🚨 只压棘突旁侧软组织结节，严禁暴力猛砸胸椎正中骨尖',
    shortTestZh: '松后右肩能自然向下沉落，整条后背纵向紧绷弓弦感立减',
  },
  'LA-CP': {
    loopGroup: 'axial_pelvis',
    loopGroupLabelZh: '颅颈外侧链 · 耳周/耳后乳突「车顶总挂钩」',
    shortTitleZh: '耳周围/耳后乳突筋膜 (吊起颈肩与肩胛的颅侧挂钩)',
    oneLineSummaryZh: '胸锁乳突肌与头夹肌全挂在耳后乳突上，耳周紧绷会不断从上方把右肩胛吊起来',
    palpationSteps: [
      '1. 耳后点：摸到右耳垂正后方硬骨凸起（乳突）下缘与后缘凹陷',
      '2. 耳上点：右耳正上方发际线内1-2指（咬牙时鼓起的颞肌筋膜）',
      '3. 耳周环：轻轻捏住右耳根向外上方提拉，感受紧绷牵扯感',
    ],
    releaseSpec: {
      tool: '食指+中指“剪刀手”指腹 + 手指提拉耳廓',
      direction: '沿耳后乳突骨面画圈深揉45秒 + 耳上颞肌画圈45秒 + 提拉耳廓30秒',
      duration: '90–120 秒',
    },
    shortWarningZh: '🚨 耳垂正下方深凹（翳风穴）有面神经，切勿拿尖硬物往耳下深洞里猛戳，重点揉耳后硬骨面',
    shortTestZh: '松完右耳周围一圈后向左侧偏头，右侧脖子根部到右肩胛上角瞬间松下一大截',
  },
};

export function getNodeUX(node: SteccoNode): DigestNodeUX {
  return (
    NODE_UX_DIGEST[node.id] ?? {
      loopGroup: node.roleType === 'CP' ? 'victim_cp' : 'outgoing_front',
      loopGroupLabelZh: node.steccoSequence,
      shortTitleZh: node.nameZh,
      oneLineSummaryZh: node.biomechanicalSummary.slice(0, 36),
      palpationSteps: [
        node.palpationLandmark,
        '深按寻找条索状酸痛点',
        '配合关节微动确认肌腹位置',
      ],
      releaseSpec: {
        tool: '筋膜球 / 指腹',
        direction: node.releaseTechnique.slice(0, 28),
        duration: '60–90 秒',
      },
      shortWarningZh: node.redTeamWarning.replace(/^🚨|⚠️\s*/, ''),
      shortTestZh: node.movementVerification.replace(/^【MV.*?】/, ''),
    }
  );
}
