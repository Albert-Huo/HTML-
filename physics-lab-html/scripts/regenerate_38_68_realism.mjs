#!/usr/bin/env node
import fs from "fs";
import path from "path";

const ROOT = path.resolve("/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents");

const specs = [
  {
    id: 38,
    title: "探究平面镜成像的特点",
    scene: "planeMirror",
    family: "光学",
    textbook: "八年级上册 第四章 光现象；结构化索引 EXP007；PDF 第105页起 raw_text 可提取",
    apparatus: "玻璃板、两支相同蜡烛、白纸、刻度尺、光屏",
    keyPoint: "移动替身蜡烛与玻璃板中像重合，比较像距、物距和大小。",
    conclusion: "平面镜所成的像是虚像，像与物大小相等，像和物到镜面的距离相等。",
    scenarios: [
      { key: "near", label: "近处蜡烛", action: "拖动前方蜡烛到 8 cm，移动替身蜡烛重合", note: "像距约等于物距，像和物关于玻璃板对称。", value: 0 },
      { key: "far", label: "远处蜡烛", action: "把前方蜡烛移到 14 cm，再移动替身蜡烛", note: "像随物体等距后移，像的大小不变。", value: 1 },
      { key: "screen", label: "光屏检验", action: "把光屏放到像的位置", note: "光屏上承接不到像，说明平面镜成的是虚像。", value: 2 }
    ]
  },
  {
    id: 39,
    title: "探究凸透镜成像的规律",
    scene: "convexLens",
    family: "光学",
    textbook: "八年级上册 第五章 透镜及其应用；结构化索引 EXP008；PDF 第129页起 raw_text 可提取",
    apparatus: "光具座、凸透镜、蜡烛、光屏、刻度尺",
    keyPoint: "沿光具座移动蜡烛和光屏，比较物距与焦距关系下的像。",
    conclusion: "物距不同，凸透镜可成倒立缩小、等大、放大实像，也可成正立放大虚像。",
    scenarios: [
      { key: "far", label: "u > 2f", action: "拖动蜡烛到 2f 以外并调光屏", note: "光屏上得到倒立、缩小的实像。", value: 0 },
      { key: "middle", label: "f < u < 2f", action: "把蜡烛移到 f 和 2f 之间", note: "光屏上得到倒立、放大的实像。", value: 1 },
      { key: "inside", label: "u < f", action: "把蜡烛移到焦点以内并移走光屏", note: "不能在光屏上成像，只能观察到正立、放大的虚像。", value: 2 }
    ]
  },
  {
    id: 40,
    title: "用凸透镜设计与制作简易照相机",
    scene: "camera",
    family: "光学",
    textbook: "八年级上册 第五章 透镜及其应用；PDF 搜索命中“照相机”第121、125-129页",
    apparatus: "凸透镜、硬纸盒、半透明纸屏、远近物体模型、滑动镜筒",
    keyPoint: "调节镜头与半透明屏距离，让远近物体都能在屏上清晰成像。",
    conclusion: "照相机利用凸透镜成倒立、缩小的实像；物距改变时需要调节像距。",
    scenarios: [
      { key: "box", label: "组装暗箱", action: "把凸透镜装在纸盒前端，半透明纸作屏", note: "纸盒遮光后，屏上能观察到倒立的景物像。", value: 0 },
      { key: "focusFar", label: "远景调焦", action: "拖动纸屏靠近镜头", note: "远处物体成较小、倒立、清晰的像。", value: 1 },
      { key: "focusNear", label: "近景调焦", action: "把纸屏向后移以重新清晰", note: "物体靠近镜头时，像距增大，需要后移纸屏。", value: 2 }
    ]
  },
  {
    id: 41,
    title: "模拟近视眼和远视眼的矫正",
    scene: "eyeCorrection",
    family: "光学",
    textbook: "八年级上册 第五章 透镜及其应用；PDF 搜索命中“近视眼/远视眼”第134-136页",
    apparatus: "眼球模型、凸透镜、凹透镜、光屏、蜡烛或平行光源",
    keyPoint: "改变晶状体等效焦距，观察像落在视网膜前后，再加矫正透镜。",
    conclusion: "近视眼用凹透镜矫正，远视眼用凸透镜矫正，使像重新落在视网膜上。",
    scenarios: [
      { key: "normal", label: "正常眼", action: "调节眼球模型使像落在视网膜", note: "平行光经晶状体后会聚在视网膜上。", value: 0 },
      { key: "myopia", label: "近视矫正", action: "加凹透镜使过早会聚的光后移", note: "凹透镜先发散光线，像回到视网膜。", value: 1 },
      { key: "hyperopia", label: "远视矫正", action: "加凸透镜使会聚不足的光提前", note: "凸透镜增强会聚，像回到视网膜。", value: 2 }
    ]
  },
  {
    id: 42,
    title: "观察白光的色散现象",
    scene: "dispersion",
    family: "光学",
    textbook: "八年级上册 第四章 光现象；PDF 搜索命中“色散”第114-116页",
    apparatus: "白光光源、狭缝、三棱镜、白屏、支架",
    keyPoint: "让白光通过狭缝照到三棱镜，在白屏上观察连续色带。",
    conclusion: "白光可以分解为多种色光，不同色光通过三棱镜偏折程度不同。",
    scenarios: [
      { key: "align", label: "对准光路", action: "调狭缝和三棱镜，使白光照入棱镜", note: "屏上开始出现被拉开的彩色光带。", value: 0 },
      { key: "spectrum", label: "展开光谱", action: "缓慢转动三棱镜寻找最清晰色带", note: "红、橙、黄、绿、蓝、靛、紫依次排列。", value: 1 },
      { key: "compare", label: "比较偏折", action: "观察红光和紫光的位置", note: "紫光偏折较大，红光偏折较小。", value: 2 }
    ]
  },
  {
    id: 43,
    title: "观察色光的混合",
    scene: "colorMix",
    family: "光学",
    textbook: "八年级上册 第四章 光现象；PDF 搜索命中“色光”第114、115、117页",
    apparatus: "红绿蓝三色光源、白屏、调光旋钮、遮光板",
    keyPoint: "分别打开红、绿、蓝色光，观察两两叠加和三色叠加区域。",
    conclusion: "红、绿、蓝是色光的三原色，三色适当混合可得到白光。",
    scenarios: [
      { key: "redGreen", label: "红绿叠加", action: "打开红光和绿光并调到屏幕同一区域", note: "重叠区域呈黄色。", value: 0 },
      { key: "blueGreen", label: "蓝绿叠加", action: "打开蓝光和绿光", note: "重叠区域呈青色。", value: 1 },
      { key: "rgb", label: "三色叠加", action: "同时打开红、绿、蓝三束光", note: "中心重叠区接近白色。", value: 2 }
    ]
  },
  {
    id: 44,
    title: "观察摩擦起电现象",
    scene: "static",
    family: "静电",
    textbook: "九年级全一册 第十五章 第1节 两种电荷；图片版目录页定位，具体实验页待核图",
    apparatus: "塑料棒、毛皮、碎纸屑、验电器、放电导线",
    keyPoint: "摩擦塑料棒后靠近纸屑和验电器，观察吸引与金属箔张开。",
    conclusion: "物体摩擦后可以带电，带电体能吸引轻小物体，同种电荷相互排斥。",
    scenarios: [
      { key: "rub", label: "摩擦塑料棒", action: "拖动塑料棒在毛皮上往复摩擦", note: "塑料棒带电后能吸引碎纸屑。", value: 0 },
      { key: "electroscope", label: "接触验电器", action: "用带电棒接触验电器金属球", note: "两片金属箔张开，说明带同种电荷相互排斥。", value: 1 },
      { key: "discharge", label: "放电复位", action: "用手或导线接触金属球", note: "金属箔张角变小，电荷转移。", value: 2 }
    ]
  },
  {
    id: 45,
    title: "用小磁针和铁屑观测磁场的方向和分布情况",
    scene: "magneticField",
    family: "磁学",
    textbook: "九年级全一册 第二十章 第1节 磁现象 磁场；图片版目录页定位，具体实验页待核图",
    apparatus: "条形磁铁、小磁针、铁屑、透明板、轻敲棒",
    keyPoint: "把铁屑均匀撒在透明板上，轻敲后观察磁感线形状，再用小磁针判定方向。",
    conclusion: "磁体周围存在磁场，小磁针北极所指方向为该点磁场方向。",
    scenarios: [
      { key: "filings", label: "撒铁屑", action: "轻敲透明板，让铁屑沿磁场排列", note: "铁屑在两极附近最密，显示磁场分布。", value: 0 },
      { key: "compass", label: "移动小磁针", action: "把小磁针放到不同位置", note: "小磁针 N 极沿磁场方向偏转。", value: 1 },
      { key: "reverse", label: "翻转磁铁", action: "把条形磁铁 N/S 极对调", note: "小磁针方向随磁极改变而反向。", value: 2 }
    ]
  },
  {
    id: 46,
    title: "观察通电导体周围产生磁场的现象",
    scene: "wireField",
    family: "电磁",
    textbook: "九年级全一册 第二十章 第2节 电生磁；图片版目录页定位，具体实验页待核图",
    apparatus: "直导线、电池组、开关、小磁针、导线支架",
    keyPoint: "闭合开关让直导线通电，观察附近小磁针偏转，并改变电流方向比较。",
    conclusion: "通电导体周围存在磁场，磁场方向与电流方向有关。",
    scenarios: [
      { key: "off", label: "断电基准", action: "断开开关，观察小磁针原方向", note: "没有电流时，小磁针只指示地磁方向。", value: 0 },
      { key: "on", label: "闭合开关", action: "让直导线通电", note: "导线旁小磁针发生偏转。", value: 1 },
      { key: "reverse", label: "反接电源", action: "交换电源正负极", note: "小磁针偏转方向反向。", value: 2 }
    ]
  },
  {
    id: 47,
    title: "探究通电螺线管外部磁场的方向",
    scene: "solenoid",
    family: "电磁",
    textbook: "九年级全一册 第二十章 第2节 电生磁；图片版目录页定位，具体实验页待核图",
    apparatus: "螺线管、电池组、开关、小磁针、铁芯、导线",
    keyPoint: "闭合电路后在螺线管两端和周围移动小磁针，比较电流方向改变前后。",
    conclusion: "通电螺线管外部磁场像条形磁铁，极性与电流方向有关。",
    scenarios: [
      { key: "northLeft", label: "左端为 N", action: "按第一种接法通电并移动小磁针", note: "小磁针显示左端相当于 N 极。", value: 0 },
      { key: "ironCore", label: "插入铁芯", action: "把铁芯插入螺线管", note: "磁场增强，小磁针偏转更明显。", value: 1 },
      { key: "reverse", label: "改变电流方向", action: "交换电源正负极", note: "螺线管 N、S 极互换。", value: 2 }
    ]
  },
  {
    id: 48,
    title: "观察通电导线在磁场中的受力情况",
    scene: "motorForce",
    family: "电磁",
    textbook: "九年级全一册 第二十章 第4节 电动机；图片版目录页定位，具体实验页待核图",
    apparatus: "U 形磁铁、导体棒、导轨、电源、开关、换向接线",
    keyPoint: "把通电导体放入磁场，观察导体棒运动，并改变电流或磁场方向。",
    conclusion: "通电导体在磁场中会受到力，受力方向与电流方向和磁场方向有关。",
    scenarios: [
      { key: "forceRight", label: "向右受力", action: "闭合开关，让导体棒通电", note: "导体棒沿导轨向右运动。", value: 0 },
      { key: "reverseCurrent", label: "反接电流", action: "交换电源接线", note: "导体棒运动方向反向。", value: 1 },
      { key: "reverseMagnet", label: "调换磁极", action: "翻转 U 形磁铁", note: "磁场方向改变，导体棒受力方向也改变。", value: 2 }
    ]
  },
  {
    id: 49,
    title: "设计与制作简易直流电动机模型",
    scene: "dcMotor",
    family: "电磁",
    textbook: "九年级全一册 第二十章 第5节 跨学科实践：制作简易直流电动机；目录页定位，具体实验页待核图",
    apparatus: "线圈、永久磁铁、电池、支架、换向器、漆包线刮漆端",
    keyPoint: "把线圈放入磁场并接通电源，调整支架和刮漆端让线圈连续转动。",
    conclusion: "直流电动机把电能转化为机械能，换向结构使线圈持续受同向转矩。",
    scenarios: [
      { key: "assemble", label: "组装线圈", action: "把线圈架在支架上并放到磁铁之间", note: "线圈能自由转动是启动前提。", value: 0 },
      { key: "scrape", label: "处理漆包线", action: "刮去一侧绝缘漆并接入电池", note: "接触时线圈受力开始转动。", value: 1 },
      { key: "spin", label: "连续转动", action: "轻拨线圈并调整接触点", note: "线圈持续转动，电能转化为机械能。", value: 2 }
    ]
  },
  {
    id: 50,
    title: "探究导体在磁场中运动时产生感应电流的条件",
    scene: "induction",
    family: "电磁",
    textbook: "九年级全一册 第二十章 第6节 磁生电；结构化索引 EXP028；条目标注需核对",
    apparatus: "线圈、条形磁铁、灵敏电流计、导线、开关",
    keyPoint: "让磁铁与闭合线圈发生相对运动，观察电流计指针偏转。",
    conclusion: "闭合电路的一部分导体切割磁感线时产生感应电流，方向与运动方向有关。",
    scenarios: [
      { key: "insert", label: "插入磁铁", action: "把条形磁铁快速插入线圈", note: "电流计指针向一侧偏转。", value: 0 },
      { key: "still", label: "相对静止", action: "让磁铁停在线圈内", note: "指针回零，没有持续感应电流。", value: 1 },
      { key: "pull", label: "拔出磁铁", action: "把磁铁快速拔出线圈", note: "指针向相反方向偏转。", value: 2 }
    ]
  },
  {
    id: 51,
    title: "设计与制作简易直流发电机模型",
    scene: "generator",
    family: "电磁",
    textbook: "九年级全一册 第二十章 第6节 磁生电；图片版目录页定位，具体实验页待核图",
    apparatus: "线圈、磁铁、手摇转轴、换向/集流环、小灯泡、灵敏电流计",
    keyPoint: "转动线圈切割磁感线，观察电流计或小灯泡变化。",
    conclusion: "发电机利用电磁感应把机械能转化为电能，转速越快输出越明显。",
    scenarios: [
      { key: "slow", label: "慢速转动", action: "缓慢摇动线圈", note: "电流计轻微摆动，小灯泡不明显。", value: 0 },
      { key: "fast", label: "快速转动", action: "加快手摇转速", note: "电流计摆幅增大，小灯泡变亮。", value: 1 },
      { key: "reverse", label: "反向转动", action: "反向摇动线圈", note: "感应电流方向改变，指针偏转方向反向。", value: 2 }
    ]
  },
  {
    id: 52,
    title: "观察内能转化为机械能的实验现象",
    scene: "steamPop",
    family: "热学/能量",
    textbook: "九年级全一册 第十四章 第2节 热机；图片版目录页定位，具体实验页待核图",
    apparatus: "试管、少量水、橡皮塞、酒精灯、铁架台、防护屏",
    keyPoint: "加热试管中少量水，观察水蒸气把橡皮塞推出。",
    conclusion: "水蒸气膨胀对塞子做功，内能转化为塞子的机械能。",
    scenarios: [
      { key: "warm", label: "开始加热", action: "点燃酒精灯加热试管底部", note: "水温升高，试管内出现水蒸气。", value: 0 },
      { key: "shake", label: "塞子振动", action: "继续加热并观察橡皮塞", note: "管内压强增大，塞子开始晃动。", value: 1 },
      { key: "pop", label: "塞子弹出", action: "水蒸气膨胀推动塞子", note: "塞子被推出，内能转化为机械能。", value: 2 }
    ]
  },
  {
    id: 53,
    title: "观察机械能转化为内能的实验现象",
    scene: "frictionHeat",
    family: "热学/能量",
    textbook: "九年级全一册 第十三章 第3节 内能；图片版目录页定位，具体实验页待核图",
    apparatus: "铜管或金属筒、绳子、温度贴、塞子、酒精棉",
    keyPoint: "快速摩擦金属管或压缩气体，观察温度升高的现象。",
    conclusion: "对物体做功可以改变内能，机械能可转化为内能。",
    scenarios: [
      { key: "rubSlow", label: "慢速摩擦", action: "慢慢拉动绳子摩擦金属管", note: "温度变化不明显。", value: 0 },
      { key: "rubFast", label: "快速摩擦", action: "快速往复拉动绳子", note: "金属管温度升高，温度贴变色。", value: 1 },
      { key: "compare", label: "比较前后", action: "停止摩擦后触摸温度贴读数", note: "机械能通过摩擦转化为内能。", value: 2 }
    ]
  },
  {
    id: 54,
    title: "观察电能转化为机械能的实验现象",
    scene: "motorEnergy",
    family: "能量",
    textbook: "九年级全一册 第二十章 第4节 电动机；图片版目录页定位，具体实验页待核图",
    apparatus: "电池组、开关、小电动机、风扇叶片、导线",
    keyPoint: "闭合电路让小电动机带动风扇转动，改变电压观察转速。",
    conclusion: "电动机工作时把电能转化为机械能。",
    scenarios: [
      { key: "open", label: "接好电路", action: "连接电池、开关和小电动机", note: "开关断开时风扇不转。", value: 0 },
      { key: "run", label: "闭合开关", action: "闭合开关让电动机通电", note: "风扇开始转动。", value: 1 },
      { key: "fast", label: "增大电压", action: "增加一节电池或提高电压", note: "电动机转速增大，机械能输出更明显。", value: 2 }
    ]
  },
  {
    id: 55,
    title: "观察电能转化为内能的实验现象",
    scene: "electricHeat",
    family: "能量",
    textbook: "九年级全一册 第十八章 第4节 焦耳定律；图片版目录页定位，具体实验页待核图",
    apparatus: "电热丝、低压电源、开关、温度计、烧杯或绝热盒",
    keyPoint: "让电流通过电热丝，观察温度升高和电热丝发热。",
    conclusion: "电流通过电阻时产生热量，电能转化为内能。",
    scenarios: [
      { key: "off", label: "断电读数", action: "记录通电前温度", note: "温度计示数保持初始值。", value: 0 },
      { key: "heat", label: "通电加热", action: "闭合开关让电流通过电热丝", note: "电热丝发热，温度计上升。", value: 1 },
      { key: "strong", label: "增大电流", action: "调小电阻或提高电压", note: "单位时间产生的热量更多，升温更快。", value: 2 }
    ]
  },
  {
    id: 56,
    title: "观察动能和势能相互转化的实验现象",
    scene: "energyTrack",
    family: "机械能",
    textbook: "八年级下册 机械能相关内容；本地目录实验映射，具体教材页待核",
    apparatus: "轨道、小球、刻度尺、释放挡板、能量标尺",
    keyPoint: "让小球从不同高度释放，观察高度、速度和到达位置的变化。",
    conclusion: "小球下落时重力势能转化为动能，上升时动能转化为重力势能。",
    scenarios: [
      { key: "high", label: "高处释放", action: "把小球拉到轨道高处松手", note: "小球速度逐渐增大。", value: 0 },
      { key: "bottom", label: "最低点", action: "观察小球经过最低点", note: "最低点速度最大，动能最大。", value: 1 },
      { key: "rise", label: "上升过程", action: "观察小球冲上另一侧", note: "速度减小，高度增加，动能转化为势能。", value: 2 }
    ]
  },
  {
    id: 57,
    title: "测量某种简单机械的机械效率",
    scene: "pulleyEfficiency",
    family: "机械",
    textbook: "八年级下册 第十二章 机械效率；结构化索引 EXP021；PDF 第124页 raw_text 可提取",
    apparatus: "滑轮组、弹簧测力计、钩码、刻度尺、细绳",
    keyPoint: "匀速拉动弹簧测力计，记录物重、拉力、物体上升距离和绳端移动距离。",
    conclusion: "机械效率小于 100%，同一滑轮组提升较重物体时效率通常较高。",
    scenarios: [
      { key: "setup", label: "组装滑轮组", action: "挂好钩码并调直测力计", note: "读出物重 G 和初始高度。", value: 0 },
      { key: "pull", label: "匀速提升", action: "竖直匀速拉动弹簧测力计", note: "记录拉力 F、钩码上升 h 和绳端移动 s。", value: 1 },
      { key: "calculate", label: "计算效率", action: "比较 Gh 和 Fs", note: "η = Gh / Fs，实际效率小于 1。", value: 2 }
    ]
  },
  {
    id: 58,
    title: "探究物体吸收的热量跟物体质量、温度变化的关系",
    scene: "heatCapacity",
    family: "热学",
    textbook: "九年级全一册 第十三章 第1节 热量 比热容；结构化索引 EXP022；条目基于课标知识，需核对",
    apparatus: "两只烧杯、等质量水和食用油、电加热器、温度计、天平、秒表",
    keyPoint: "用相同加热器加热等质量不同液体，比较温度升高和加热时间。",
    conclusion: "物体吸收的热量与质量、温度变化和物质种类有关。",
    scenarios: [
      { key: "equalMass", label: "等质量装液", action: "用天平量取等质量水和食用油", note: "控制质量相同，准备比较吸热情况。", value: 0 },
      { key: "sameHeat", label: "同时加热", action: "用相同电加热器加热相同时间", note: "食用油温度升高较快，水升温较慢。", value: 1 },
      { key: "sameRise", label: "升高同温", action: "比较升高相同温度所需时间", note: "水需要更长时间，说明吸收热量更多。", value: 2 }
    ]
  },
  {
    id: 59,
    title: "观察热机的工作过程",
    scene: "heatEngine",
    family: "热机",
    textbook: "九年级全一册 第十四章 第2节 热机；图片版目录页定位，具体实验页待核图",
    apparatus: "透明汽油机模型、活塞、连杆、飞轮、进气/排气示意阀",
    keyPoint: "转动飞轮，依次观察吸气、压缩、做功、排气四个冲程。",
    conclusion: "热机通过做功冲程把内能转化为机械能，飞轮维持循环运行。",
    scenarios: [
      { key: "intake", label: "吸气冲程", action: "转动飞轮使活塞下行", note: "进气阀打开，混合气进入汽缸。", value: 0 },
      { key: "power", label: "做功冲程", action: "点火后高温气体推动活塞", note: "内能转化为机械能，飞轮获得动力。", value: 1 },
      { key: "exhaust", label: "排气冲程", action: "继续转动飞轮排出废气", note: "排气阀打开，废气排出。", value: 2 }
    ]
  },
  {
    id: 61,
    title: "用电流表测量电流",
    scene: "ammeter",
    family: "电学",
    textbook: "九年级全一册 第十五章 第4节 电流的测量；结构化索引 EXP023；条目标注需核对",
    apparatus: "电流表、电池组、开关、小灯泡、导线",
    keyPoint: "把电流表串联接入被测电路，先大量程试触，再选择合适量程读数。",
    conclusion: "电流表必须串联接入电路，电流从正接线柱流入，并选择合适量程。",
    scenarios: [
      { key: "series", label: "串联接入", action: "把电流表串联到灯泡支路", note: "指针正向偏转，可以读出电流。", value: 0 },
      { key: "range", label: "选择量程", action: "先 3 A 试触，再改用 0.6 A 量程", note: "指针偏转适中，读数更准确。", value: 1 },
      { key: "wrong", label: "错误接法", action: "演示并联接入的风险后立即断开", note: "电流表内阻很小，并联会造成大电流风险。", value: 2 }
    ]
  },
  {
    id: 62,
    title: "用电压表测量电压",
    scene: "voltmeter",
    family: "电学",
    textbook: "九年级全一册 第十六章 第1节 电压；结构化索引 EXP024；条目标注需核对",
    apparatus: "电压表、电池组、开关、小灯泡、导线",
    keyPoint: "把电压表并联在被测元件两端，注意正负接线柱和量程。",
    conclusion: "电压表应并联在被测电路两端，并选择合适量程读数。",
    scenarios: [
      { key: "parallel", label: "并联接入", action: "把电压表并联在灯泡两端", note: "电压表显示灯泡两端电压。", value: 0 },
      { key: "range", label: "选择量程", action: "先用 15 V 试触，再选 3 V 量程", note: "指针偏转合适，读数更精确。", value: 1 },
      { key: "battery", label: "测电源电压", action: "把电压表并联在电池组两端", note: "读出电源两端电压。", value: 2 }
    ]
  },
  {
    id: 63,
    title: "连接串联电路和并联电路",
    scene: "seriesParallel",
    family: "电学",
    textbook: "九年级全一册 第十五章 第3节 串联电路和并联电路；图片版目录页定位，具体实验页待核图",
    apparatus: "电池组、两个小灯泡、开关、导线、接线柱板",
    keyPoint: "按电路图连接串联和并联电路，比较开关控制和灯泡工作情况。",
    conclusion: "串联电路只有一条电流路径，并联电路有多条支路，各支路可相对独立工作。",
    scenarios: [
      { key: "series", label: "串联连接", action: "把两个灯泡首尾相接成一条回路", note: "断开任一处，两灯都熄灭。", value: 0 },
      { key: "parallel", label: "并联连接", action: "把两个灯泡分别接到两条支路", note: "一支路断开，另一支路仍可发光。", value: 1 },
      { key: "switch", label: "开关控制", action: "分别移动总开关和支路开关", note: "总开关控制整个电路，支路开关只控制对应支路。", value: 2 }
    ]
  },
  {
    id: 64,
    title: "用电流表和电压表测量电阻",
    scene: "resistanceMeasure",
    family: "电学",
    textbook: "九年级全一册 第十七章 第3节 电阻的测量；结构化索引 EXP026；条目标注需核对",
    apparatus: "电流表、电压表、滑动变阻器、被测电阻、电池组、开关、导线",
    keyPoint: "调节滑动变阻器，记录多组 U 和 I，计算 R=U/I 并取平均。",
    conclusion: "用伏安法测电阻时，多次测量取平均值可以减小偶然误差。",
    scenarios: [
      { key: "low", label: "低电压测量", action: "调滑片使电压较低并读出 U、I", note: "计算得到一次电阻值。", value: 0 },
      { key: "mid", label: "中等电压测量", action: "继续调滑片，记录第二组 U、I", note: "第二次计算值应接近前一次。", value: 1 },
      { key: "avg", label: "平均电阻", action: "记录第三组并求平均值", note: "多次测量求平均，减小偶然误差。", value: 2 }
    ]
  },
  {
    id: 65,
    title: "探究串联电路和并联电路中电流、电压的特点",
    scene: "circuitLaws",
    family: "电学",
    textbook: "九年级全一册 第十五章 第5节 + 第十六章 第2节；目录页定位，具体实验页待核图",
    apparatus: "电池组、两个小灯泡、电流表、电压表、开关、导线",
    keyPoint: "在串联和并联电路不同位置接入电表，比较电流和电压关系。",
    conclusion: "串联电路电流处处相等、电压分配；并联电路各支路两端电压相等、电流分流。",
    scenarios: [
      { key: "seriesCurrent", label: "串联电流", action: "把电流表接到串联电路不同位置", note: "各处电流示数相等。", value: 0 },
      { key: "seriesVoltage", label: "串联电压", action: "分别测总电压和各灯电压", note: "总电压约等于各部分电压之和。", value: 1 },
      { key: "parallel", label: "并联规律", action: "测并联支路电流和电压", note: "各支路电压相等，总电流约等于支路电流之和。", value: 2 }
    ]
  },
  {
    id: 66,
    title: "探究电流产生热量与哪些因素有关",
    scene: "jouleHeat",
    family: "电学/热学",
    textbook: "九年级全一册 第十八章 第4节 焦耳定律；图片版目录页定位，具体实验页待核图",
    apparatus: "两个透明容器、电阻丝、温度计、低压电源、滑动变阻器、开关",
    keyPoint: "控制电流、通电时间和电阻，比较温度计或液面变化。",
    conclusion: "电流产生的热量与电流大小、电阻大小和通电时间有关。",
    scenarios: [
      { key: "resistance", label: "比较电阻", action: "让不同电阻丝串联通电相同时间", note: "电阻较大的容器升温更明显。", value: 0 },
      { key: "current", label: "改变电流", action: "移动滑动变阻器增大电流", note: "电流越大，升温越快。", value: 1 },
      { key: "time", label: "延长时间", action: "保持条件不变延长通电时间", note: "通电时间越长，产生热量越多。", value: 2 }
    ]
  },
  {
    id: 67,
    title: "用低压电模拟家庭电路中的安全用电",
    scene: "safetyCircuit",
    family: "生活用电",
    textbook: "九年级全一册 第十九章 生活用电；图片版目录页定位，具体实验页待核图",
    apparatus: "低压电源、模拟火线零线、开关、保险丝、三孔插座、接地线、用电器模型",
    keyPoint: "用低压模型演示开关接火线、保险丝保护和接地保护。",
    conclusion: "家庭电路要正确接线，保险装置和接地线能降低触电和过载风险。",
    scenarios: [
      { key: "switchLive", label: "开关接火线", action: "把开关串接在模拟火线上", note: "断开开关后用电器与火线隔离。", value: 0 },
      { key: "fuse", label: "过载保护", action: "增加负载模拟过载", note: "保险丝熔断，电路断开。", value: 1 },
      { key: "ground", label: "接地保护", action: "把金属外壳接到地线端", note: "漏电时电流经地线导走，保护人体。", value: 2 }
    ]
  },
  {
    id: 68,
    title: "利用新能源设计并制作一种模型",
    scene: "renewable",
    family: "能源",
    textbook: "九年级全一册 第二十二章 第3节 跨学科实践：为节约能源设计方案；目录页定位，具体实验页待核图",
    apparatus: "太阳能电池板、小电机、风扇叶片、LED、储能模块、导线",
    keyPoint: "改变光照角度或风速，观察模型输出电压和电机转速。",
    conclusion: "新能源装置可以把太阳能、风能等转化为电能，并驱动模型工作。",
    scenarios: [
      { key: "weak", label: "弱光输出", action: "让太阳能板受弱光照射", note: "电机转速慢，LED 较暗。", value: 0 },
      { key: "strong", label: "强光输出", action: "调整太阳能板角度增强光照", note: "输出电压增大，电机转速加快。", value: 1 },
      { key: "store", label: "储能运行", action: "接入储能模块后短时遮光", note: "模型仍可短时间运行，说明能量被暂时储存。", value: 2 }
    ]
  }
];

function page(spec) {
  const json = JSON.stringify(spec);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <title>初中物理实验${spec.id}｜${spec.title}</title>
  <style>
    :root{--bg:#1a1a1a;--ink:#fff;--card-bg:rgba(255,255,255,.08);--panel-bg:rgba(15,15,15,.58);--line:rgba(255,255,255,.12);--accent:#3ddc97;--warn:#ffb74d;--dockShadow:0 14px 36px rgba(0,0,0,.42);}
    *{box-sizing:border-box} html,body{min-height:100%}
    body{margin:0;padding:10px;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,Helvetica,sans-serif;display:flex;flex-direction:column;align-items:center;letter-spacing:0}
    #app{width:100%;max-width:980px;margin:0 auto 34px} button{font:inherit;touch-action:manipulation}
    button.main,button.sub{border:none;border-radius:8px;padding:8px 12px;color:#fff;cursor:pointer;transition:background .2s,transform .05s,opacity .2s;user-select:none;-webkit-tap-highlight-color:transparent;font-size:13px;background:#444}
    button.main{background:#2e7d32} button.main:hover,button.sub:hover{background:#5a5a5a} button:disabled{opacity:.5;cursor:not-allowed}
    #spectrum{position:relative;width:100%;max-width:980px;height:40px;border-radius:10px;overflow:hidden;box-shadow:0 0 15px rgba(255,255,255,.15);margin:0 0 12px;background:#000;flex-shrink:0}
    #spectrum:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000);background-size:200% 100%;animation:flowRainbow 6s linear infinite}
    @keyframes flowRainbow{0%{background-position:0 0}100%{background-position:-100% 0}}
    .task-card{width:100%;max-width:980px;background:var(--card-bg);border:1px solid var(--line);border-radius:12px;padding:12px 14px;backdrop-filter:blur(6px);display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px}
    .task-step{background:rgba(255,255,255,.16);border-radius:8px;padding:6px 10px;font-weight:700;white-space:nowrap}.task-text{min-width:0;line-height:1.55}#taskHint{color:#ffd54f;font-size:12px;opacity:.95;margin-top:2px}
    .progress-dots{display:flex;gap:6px;align-items:center}.dot{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.26);outline:2px solid rgba(255,255,255,.12)}.dot.active{background:var(--warn)}.dot.done{background:var(--accent);outline-color:rgba(61,220,151,.45)}.dot.warn{background:#ff4d4f;box-shadow:0 0 10px rgba(255,77,79,.62)}
    #stage{width:100%;max-width:980px;height:66vh;max-height:660px;min-height:500px;margin-top:10px;border-radius:12px;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.08);background:#0b0f14;box-shadow:0 10px 26px rgba(0,0,0,.35);touch-action:pan-y pinch-zoom;background-image:radial-gradient(circle at 76% 25%,rgba(255,255,255,.06),transparent 42%),radial-gradient(circle at 22% 78%,rgba(0,255,255,.05),transparent 46%)}
    .lab-area{position:absolute;inset:54px 10px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(5,10,16,.82);overflow:hidden}
    #labCanvas{width:100%;height:100%;display:block;touch-action:pan-y pinch-zoom;cursor:crosshair}
    .hud{position:absolute;left:10px;top:10px;z-index:20;display:flex;gap:8px;flex-wrap:wrap;align-items:center;background:rgba(0,0,0,.48);border:1px solid var(--line);border-radius:10px;padding:7px 10px;font-size:12px}
    .tag{border:1px solid rgba(255,255,255,.26);border-radius:999px;padding:2px 8px;font-weight:700;color:#dce9ff;background:rgba(255,255,255,.06)}
    .hint-lamp{position:absolute;left:10px;top:56px;z-index:22;width:34px;height:34px;border-radius:8px;display:grid;place-items:center;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);color:#ffd54f;font-size:16px;cursor:pointer;padding:0}
    .hint-lamp.flash{animation:lampFlash .6s ease}@keyframes lampFlash{50%{box-shadow:0 0 22px rgba(255,77,79,.86);border-color:#ff4d4f;color:#ffb0b0}}
    .hint-pop{position:absolute;left:10px;top:96px;z-index:23;width:min(360px,calc(100% - 24px));display:none;padding:10px 12px;border:1px solid rgba(255,209,102,.36);border-radius:10px;background:rgba(16,18,20,.9);color:#f4efe2;font-size:13px;line-height:1.55}.hint-pop.open{display:block}
    .dock{position:absolute;width:min(94%,380px);border-radius:12px;border:1px solid var(--line);background:var(--panel-bg);backdrop-filter:blur(6px);box-shadow:var(--dockShadow);overflow:hidden;touch-action:none;z-index:30}.dock-header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);cursor:grab;user-select:none;touch-action:none}.dockTitle{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:#e7f0ff;white-space:nowrap}.iconBtn{border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#e8f1ff;border-radius:7px;padding:4px 8px;font-size:12px;cursor:pointer;white-space:nowrap}.dock-body{padding:10px;max-height:360px;overflow:auto;-webkit-overflow-scrolling:touch}.collapsed .dock-body{display:none}
    .read-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}.readout{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);border-radius:8px;padding:8px;min-height:56px}.readout b{display:block;color:#cfe4ff;font-size:12px;margin-bottom:5px}.readout span{color:#fff;font-size:13px;line-height:1.4}.controls{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}.controls button{flex:1 1 98px}.analysis{margin-top:9px;border:1px solid rgba(91,188,255,.32);background:rgba(91,188,255,.08);color:#d9ecff;border-radius:8px;padding:8px 10px;font-size:13px;line-height:1.55}.analysis.ok{border-color:rgba(61,220,151,.55);background:rgba(61,220,151,.12);color:#e7fff3}
    .badge{display:inline-grid;place-items:center;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:#ef476f;color:#fff;font-size:12px;transform:scale(0);opacity:0;transition:.15s}.badge.show{transform:scale(1);opacity:1;animation:badgePulse .9s ease-in-out infinite}@keyframes badgePulse{50%{transform:scale(1.14)}}
    table.record{width:100%;border-collapse:collapse;font-size:12px;color:#e8f1ff}table.record th,table.record td{border:1px solid rgba(255,255,255,.1);padding:6px;vertical-align:top;line-height:1.45;text-align:left}table.record th{background:rgba(255,255,255,.08);color:#cfe4ff}.empty{margin:8px 2px;color:#aebbd0;font-size:12px}
    .toolbar{width:100%;max-width:980px;display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 0}.toast{position:absolute;left:50%;bottom:24px;transform:translateX(-50%) translateY(18px);opacity:0;pointer-events:none;padding:10px 16px;border-radius:999px;background:rgba(0,0,0,.72);border:1px solid rgba(255,255,255,.12);color:#fff;font-weight:800;transition:.18s ease;z-index:80}.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}.checkmark{position:absolute;left:50%;top:50%;width:64px;height:64px;border-radius:50%;transform:translate(-50%,-50%) scale(.7);opacity:0;pointer-events:none;background:rgba(37,194,119,.96);box-shadow:0 0 24px rgba(37,194,119,.55);z-index:82;transition:.18s ease}.checkmark:before{content:"";position:absolute;left:19px;top:16px;width:24px;height:13px;border-left:5px solid #fff;border-bottom:5px solid #fff;transform:rotate(-45deg)}.checkmark.active{opacity:1;transform:translate(-50%,-50%) scale(1)}
    .modal-mask{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.58);z-index:90;padding:16px}.modal{width:min(430px,92vw);padding:18px 16px;border-radius:10px;border:1px solid rgba(255,255,255,.15);background:#101317;text-align:center;box-shadow:0 18px 44px rgba(0,0,0,.42)}.modal h3{margin:4px 0 8px;font-size:21px}.modal p{margin:0;color:#cdd7e0;line-height:1.55}.modal .ok{margin-top:14px;border:none;border-radius:8px;padding:8px 18px;background:var(--accent);color:#07170f;font-weight:800;cursor:pointer}.demo-cursor{position:absolute;left:0;top:0;width:20px;height:20px;border-radius:50%;border:2px solid #fff;background:rgba(91,188,255,.8);box-shadow:0 0 14px rgba(91,188,255,.8);opacity:0;z-index:72;pointer-events:none;transition:opacity .15s}.demo-cursor.click{animation:cursorClick .28s ease}@keyframes cursorClick{50%{transform:scale(1.8);opacity:.55}}
    .explanation{width:100%;max-width:980px;margin:14px 0 22px;color:#e8f4ff;line-height:1.66;font-size:15px}.explanation h2{margin:0 0 8px;color:#9bd3ff;font-size:20px}.explanation ul{margin:0;padding-left:22px}
    @media(max-width:720px){body{padding:8px}#app,#spectrum,.task-card,#stage,.toolbar,.explanation{max-width:100%}.task-card{grid-template-columns:1fr;gap:7px}.task-step{width:fit-content}#stage{height:78vh;min-height:680px}.lab-area{inset:96px 8px 10px}.dock{width:calc(100% - 24px)}.toolbar button{flex:1 1 132px}}
  </style>
</head>
<body>
  <div id="app">
    <div id="spectrum"></div>
    <section class="task-card"><div class="task-step" id="taskStep">步骤 1 / 4</div><div class="task-text"><div id="taskText"></div><div id="taskHint"></div></div><div class="progress-dots" id="dots"></div></section>
    <main id="stage" aria-label="${spec.title}实验台">
      <div class="hud"><span class="tag" id="modeTag">模式：引导</span><span class="tag" id="statusTag">状态：待操作</span></div>
      <button class="hint-lamp" id="hintLamp" type="button" aria-label="查看提示">💡</button><div class="hint-pop" id="hintPop"></div>
      <div class="lab-area" id="labArea"><canvas id="labCanvas"></canvas></div>
      <section class="dock drawer control collapsed" id="controlDock"><div class="dock-header" data-drag-handle><span class="dockTitle">实验面板</span><button class="iconBtn" id="controlToggleBtn" type="button">展开</button></div><div class="dock-body">
        <div class="read-grid"><div class="readout"><b>器材</b><span id="apparatusReadout"></span></div><div class="readout"><b>教材对应</b><span id="sourceReadout"></span></div><div class="readout"><b>当前操作</b><span id="scenarioReadout"></span></div><div class="readout"><b>现象</b><span id="phenomenonReadout"></span></div></div>
        <div class="controls"><button class="sub" id="operateBtn" type="button">操作器材</button><button class="main" id="recordBtn" type="button">记录观察</button><button class="sub" id="analyzeBtn" type="button">分析结论</button></div><div class="analysis" id="analysisText">按步骤操作并记录三组关键现象，再归纳结论。</div>
      </div></section>
      <section class="dock drawer data collapsed" id="dataDock"><div class="dock-header" data-drag-handle><span class="dockTitle">数据面板 <span class="badge" id="dataNotice">0</span></span><button class="iconBtn" id="dataToggleBtn" type="button">展开</button></div><div class="dock-body"><table class="record"><thead><tr><th>步骤</th><th>操作</th><th>观察现象</th><th>教材对应</th></tr></thead><tbody id="recordBody"></tbody></table><div class="empty" id="emptyRecords">还没有记录。按步骤操作后点击“记录观察”。</div></div></section>
      <div class="toast" id="toast">提示</div><div class="checkmark" id="checkmark"></div><div class="demo-cursor" id="demoCursor"></div><div class="modal-mask" id="doneMask"><div class="modal"><h3>实验完成</h3><p>你已经完成“${spec.title}”：${spec.conclusion}</p><button class="ok" id="okBtn" type="button">OK</button></div></div>
    </main>
    <div class="toolbar"><button class="sub" id="resetBtn" type="button">步骤重置</button><button class="sub" id="autoDemoBtn" type="button">自动演示</button><button class="sub" id="freeBtn" type="button">自由模式</button></div>
    <section class="explanation"><h2>实验名：${spec.title}</h2><ul><li><b>关键操作与现象：</b>${spec.keyPoint}</li><li><b>教材对应：</b>${spec.textbook}</li><li><b>实验结论：</b>${spec.conclusion}</li></ul></section>
  </div>
  <script>
  (() => {
    "use strict";
    const SPEC = ${json};
    const $ = s => document.querySelector(s);
    const stage = $("#stage"), labArea = $("#labArea"), canvas = $("#labCanvas"), ctx = canvas.getContext("2d");
    const taskStep = $("#taskStep"), taskText = $("#taskText"), taskHint = $("#taskHint"), dots = $("#dots"), modeTag = $("#modeTag"), statusTag = $("#statusTag");
    const hintLamp = $("#hintLamp"), hintPop = $("#hintPop"), controlDock = $("#controlDock"), dataDock = $("#dataDock"), controlToggleBtn = $("#controlToggleBtn"), dataToggleBtn = $("#dataToggleBtn");
    const apparatusReadout = $("#apparatusReadout"), sourceReadout = $("#sourceReadout"), scenarioReadout = $("#scenarioReadout"), phenomenonReadout = $("#phenomenonReadout");
    const operateBtn = $("#operateBtn"), recordBtn = $("#recordBtn"), analyzeBtn = $("#analyzeBtn"), analysisText = $("#analysisText"), recordBody = $("#recordBody"), emptyRecords = $("#emptyRecords"), dataNotice = $("#dataNotice");
    const resetBtn = $("#resetBtn"), autoDemoBtn = $("#autoDemoBtn"), freeBtn = $("#freeBtn"), toast = $("#toast"), checkmark = $("#checkmark"), doneMask = $("#doneMask"), okBtn = $("#okBtn"), demoCursor = $("#demoCursor");
    const state = { currentTask:0, completed:false, freeMode:false, autoPlaying:false, autoCancel:false, drawerDrag:null, stepWarning:false, successCooldown:false, timers:new Set(), scenarioIndex:0, operationCount:0, records:[], unseenRecords:0, analysisDone:false, width:0, height:0, stageWidth:0, stageHeight:0, drag:false, phase:0 };
    const tasks = SPEC.scenarios.map((s, i) => ({ text:"操作真实器材并记录：“" + s.label + "”。", hint:s.action, detail:s.note, expected:s.key, check:() => hasRecord(s.key) })).concat([{ text:"点击“分析结论”，归纳实验规律。", hint:"需要三组观察记录都已完成。", detail:SPEC.conclusion, check:() => state.analysisDone }]);
    function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
    function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
    function schedule(fn, ms){ const id = setTimeout(() => { state.timers.delete(id); fn(); }, ms); state.timers.add(id); return id; }
    function clearTimers(){ for (const id of state.timers) clearTimeout(id); state.timers.clear(); }
    function currentScenario(){ return SPEC.scenarios[state.scenarioIndex]; }
    function hasRecord(key){ return state.records.some(r => r.key === key); }
    function initDots(){ dots.innerHTML = ""; tasks.forEach(() => { const d = document.createElement("span"); d.className = "dot"; dots.appendChild(d); }); }
    function updateDots(){ Array.from(dots.children).forEach((dot, i) => { dot.classList.toggle("done", state.completed || i < state.currentTask); dot.classList.toggle("active", !state.completed && i === state.currentTask && !state.stepWarning); dot.classList.toggle("warn", !state.completed && i === state.currentTask && state.stepWarning); }); }
    function setStepUI(i){ state.currentTask = clamp(i, 0, tasks.length - 1); state.stepWarning = false; const t = tasks[state.currentTask]; taskStep.textContent = "步骤 " + (state.currentTask + 1) + " / " + tasks.length; taskText.textContent = t.text; taskHint.textContent = t.hint; hintPop.textContent = t.detail; updateDots(); updateReadouts(); draw(); }
    function setModeLabel(){ modeTag.textContent = state.autoPlaying ? "模式：自动演示" : (state.freeMode ? "模式：自由" : "模式：引导"); }
    function updateStatus(text){ statusTag.textContent = "状态：" + (text || (state.completed ? "已完成" : state.autoPlaying ? "自动演示" : currentScenario().label)); }
    function showToast(msg){ toast.textContent = msg; toast.classList.add("show"); clearTimeout(showToast.t); showToast.t = setTimeout(() => toast.classList.remove("show"), 1500); }
    function showCheck(){ checkmark.classList.add("active"); clearTimeout(showCheck.t); showCheck.t = setTimeout(() => checkmark.classList.remove("active"), 520); }
    function warnStep(msg){ state.stepWarning = true; updateDots(); hintLamp.classList.remove("flash"); void hintLamp.offsetWidth; hintLamp.classList.add("flash"); showToast(msg); schedule(() => { state.stepWarning = false; updateDots(); }, 1200); }
    function setScenario(i, mark){ state.scenarioIndex = clamp(i, 0, SPEC.scenarios.length - 1); if (mark) state.operationCount += 1; updateReadouts(); updateStatus(currentScenario().label); draw(); }
    function operateNext(){ setScenario((state.scenarioIndex + 1) % SPEC.scenarios.length, true); }
    function updateReadouts(){ const s = currentScenario(); apparatusReadout.textContent = SPEC.apparatus; sourceReadout.textContent = SPEC.textbook; scenarioReadout.textContent = s.label + "：" + s.action; phenomenonReadout.textContent = s.note; operateBtn.textContent = "操作：" + s.label; }
    function passStepIfReady(opts){ if (state.freeMode || state.completed || state.successCooldown) return false; if (!tasks[state.currentTask].check()) { if (!opts || !opts.quiet) warnStep("当前步骤的证据还不完整。"); return false; } state.successCooldown = true; schedule(() => { state.successCooldown = false; }, 360); showCheck(); if (state.currentTask >= tasks.length - 1) { state.completed = true; setDrawerCollapsed(controlDock, true); setDrawerCollapsed(dataDock, false); doneMask.style.display = "flex"; updateStatus(); updateDots(); } else setStepUI(state.currentTask + 1); return true; }
    function recordObservation(opts){ if (!state.operationCount && !(opts && opts.auto)) { warnStep("请先在实验台操作器材，再记录观察。"); return false; } const s = currentScenario(); const task = tasks[state.currentTask]; if (!state.freeMode && task.expected && task.expected !== s.key) { warnStep("当前步骤需要记录：“" + task.hint + "”。"); return false; } if (!hasRecord(s.key)) { state.records.push({ key:s.key, step:s.label, action:s.action, note:s.note, source:SPEC.textbook }); if (dataDock.classList.contains("collapsed")) { state.unseenRecords += 1; updateBadge(); } renderRecords(); showToast("已记录观察"); } else if (!opts || !opts.auto) showToast("这组现象已经记录过"); passStepIfReady({ quiet:true }); return true; }
    function analyzeConclusion(){ if (!SPEC.scenarios.every(s => hasRecord(s.key))) { warnStep("请先补齐三组观察记录。"); return false; } state.analysisDone = true; analysisText.classList.add("ok"); analysisText.textContent = "结论成立：" + SPEC.conclusion; showToast("已归纳实验结论"); passStepIfReady({ quiet:true }); return true; }
    function renderRecords(){ recordBody.innerHTML = ""; state.records.forEach(r => { const tr = document.createElement("tr"); [r.step, r.action, r.note, r.source].forEach(v => { const td = document.createElement("td"); td.textContent = v; tr.appendChild(td); }); recordBody.appendChild(tr); }); emptyRecords.style.display = state.records.length ? "none" : "block"; }
    function updateBadge(){ dataNotice.textContent = String(state.unseenRecords); dataNotice.classList.toggle("show", state.unseenRecords > 0 && dataDock.classList.contains("collapsed")); }
    function resizeCanvas(){ const sr = stage.getBoundingClientRect(), r = labArea.getBoundingClientRect(), dpr = window.devicePixelRatio || 1; state.width = r.width; state.height = r.height; state.stageWidth = sr.width; state.stageHeight = sr.height; canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr); canvas.style.width = r.width + "px"; canvas.style.height = r.height + "px"; ctx.setTransform(dpr,0,0,dpr,0,0); fitDrawers(); draw(); }
    function setDrawerCollapsed(drawer, collapsed){ drawer.classList.toggle("collapsed", collapsed); (drawer === controlDock ? controlToggleBtn : dataToggleBtn).textContent = collapsed ? "展开" : "收起"; if (drawer === dataDock && !collapsed) { state.unseenRecords = 0; updateBadge(); } fitDrawers(); }
    function fitDrawers(){ const areaWidth = state.stageWidth || state.width, areaHeight = state.stageHeight || state.height; if (!areaWidth || !areaHeight) return; [controlDock, dataDock].forEach((drawer, index) => { const isMobile = areaWidth <= 720, collapsed = drawer.classList.contains("collapsed"); let w = 300; if (isMobile && collapsed) w = Math.max(132, Math.min(152, Math.floor((areaWidth - 90) / 2))); else if (isMobile) w = areaWidth - 24; drawer.style.width = w + "px"; const rect = drawer.getBoundingClientRect(); let left = drawer.offsetLeft, top = drawer.offsetTop; if (!drawer.dataset.moved) { if (isMobile && collapsed) { top = 52; left = index === 0 ? areaWidth - w * 2 - 18 : areaWidth - w - 8; } else if (isMobile) { left = 12; top = index === 0 ? 104 : (controlDock.classList.contains("collapsed") ? 104 : controlDock.offsetTop + controlDock.offsetHeight + 8); } else { const both = controlDock.classList.contains("collapsed") && dataDock.classList.contains("collapsed"); if (both && collapsed) { top = 10; left = index === 0 ? Math.max(12, areaWidth - rect.width - 12) : Math.max(12, areaWidth - rect.width * 2 - 22); } else { left = Math.max(12, areaWidth - rect.width - 12); top = index === 0 ? 10 : 94; } } } drawer.style.left = clamp(left, 8, Math.max(8, areaWidth - rect.width - 8)) + "px"; drawer.style.top = clamp(top, 8, Math.max(8, areaHeight - 48)) + "px"; drawer.style.right = "auto"; }); }
    function bindDrawer(drawer){ const header = drawer.querySelector("[data-drag-handle]"); header.addEventListener("pointerdown", e => { if (e.target.tagName === "BUTTON") return; const r = drawer.getBoundingClientRect(), p = stage.getBoundingClientRect(); drawer.dataset.moved = "true"; state.drawerDrag = { drawer, dx:e.clientX - r.left, dy:e.clientY - r.top, px:p.left, py:p.top }; header.setPointerCapture(e.pointerId); e.preventDefault(); }); header.addEventListener("pointermove", e => { if (!state.drawerDrag || state.drawerDrag.drawer !== drawer) return; const drag = state.drawerDrag, areaWidth = state.stageWidth || state.width, areaHeight = state.stageHeight || state.height; drawer.style.left = clamp(e.clientX - drag.px - drag.dx, 6, Math.max(6, areaWidth - drawer.offsetWidth - 6)) + "px"; drawer.style.top = clamp(e.clientY - drag.py - drag.dy, 6, Math.max(6, areaHeight - 48)) + "px"; drawer.style.right = "auto"; e.preventDefault(); }); header.addEventListener("pointerup", e => { try { header.releasePointerCapture(e.pointerId); } catch(err) { console.warn("release drawer pointer failed", err); } state.drawerDrag = null; }); header.addEventListener("pointercancel", () => { state.drawerDrag = null; }); }
    function roundRect(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); }
    function draw(){ const w = state.width, h = state.height; if (!w || !h) return; ctx.clearRect(0,0,w,h); drawBackground(w,h); renderScene(w,h); }
    function drawBackground(w,h){ ctx.save(); ctx.strokeStyle = "rgba(255,255,255,.045)"; ctx.lineWidth = 1; for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); } for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); } ctx.restore(); }
    function labRect(w,h){ const bw = Math.min(w - 54, 760), bh = Math.min(h - 142, 372), x = (w - bw) / 2, y = 94 + Math.max(0, h - 520) * .12; return {x,y,w:bw,h:bh}; }
    function title(cx){ ctx.fillStyle = "#e8f5ff"; ctx.font = "700 20px Arial"; ctx.textAlign = "center"; ctx.fillText(SPEC.title + "实验台", cx, 34); ctx.font = "13px Arial"; ctx.fillStyle = "rgba(232,245,255,.72)"; ctx.fillText(SPEC.keyPoint, cx, 58); }
    function label(text,x,y,color){ ctx.fillStyle = color || "#eaf5ff"; ctx.font = "700 13px Arial"; ctx.textAlign = "center"; ctx.fillText(text,x,y); }
    function fillPanel(r){ ctx.fillStyle = "rgba(255,255,255,.05)"; ctx.strokeStyle = "rgba(160,220,255,.28)"; ctx.lineWidth = 1.5; roundRect(r.x,r.y,r.w,r.h,12); ctx.fill(); ctx.stroke(); }
    function renderScene(w,h){ const r = labRect(w,h), cx = w/2, cy = r.y + r.h/2, s = currentScenario(); ctx.save(); title(cx); fillPanel(r); const n = state.scenarioIndex; if (SPEC.scene === "planeMirror") scenePlaneMirror(r,n); else if (SPEC.scene === "convexLens") sceneConvexLens(r,n); else if (SPEC.scene === "camera") sceneCamera(r,n); else if (SPEC.scene === "eyeCorrection") sceneEye(r,n); else if (SPEC.scene === "dispersion") sceneDispersion(r,n); else if (SPEC.scene === "colorMix") sceneColorMix(r,n); else if (SPEC.scene === "static") sceneStatic(r,n); else if (SPEC.scene === "magneticField") sceneMagneticField(r,n); else if (SPEC.scene === "wireField") sceneWireField(r,n); else if (SPEC.scene === "solenoid") sceneSolenoid(r,n); else if (SPEC.scene === "motorForce") sceneMotorForce(r,n); else if (SPEC.scene === "dcMotor") sceneDcMotor(r,n); else if (SPEC.scene === "induction") sceneInduction(r,n); else if (SPEC.scene === "generator") sceneGenerator(r,n); else if (SPEC.scene === "steamPop") sceneSteam(r,n); else if (SPEC.scene === "frictionHeat") sceneFriction(r,n); else if (SPEC.scene === "motorEnergy") sceneMotorEnergy(r,n); else if (SPEC.scene === "electricHeat") sceneElectricHeat(r,n); else if (SPEC.scene === "energyTrack") sceneEnergyTrack(r,n); else if (SPEC.scene === "pulleyEfficiency") scenePulley(r,n); else if (SPEC.scene === "heatCapacity") sceneHeatCapacity(r,n); else if (SPEC.scene === "heatEngine") sceneHeatEngine(r,n); else if (SPEC.scene === "ammeter") sceneAmmeter(r,n); else if (SPEC.scene === "voltmeter") sceneVoltmeter(r,n); else if (SPEC.scene === "seriesParallel") sceneSeriesParallel(r,n); else if (SPEC.scene === "resistanceMeasure") sceneResistanceMeasure(r,n); else if (SPEC.scene === "circuitLaws") sceneCircuitLaws(r,n); else if (SPEC.scene === "jouleHeat") sceneJouleHeat(r,n); else if (SPEC.scene === "safetyCircuit") sceneSafety(r,n); else if (SPEC.scene === "renewable") sceneRenewable(r,n); else sceneFallback(r,n); ctx.fillStyle = "#ffd54f"; ctx.font = "700 15px Arial"; ctx.textAlign = "center"; ctx.fillText(s.label + "：" + s.action, cx, r.y + r.h + 28); ctx.fillStyle = "#dcecff"; ctx.font = "13px Arial"; wrapText(s.note, cx, r.y + r.h + 52, Math.min(r.w,720), 18); ctx.restore(); }
    function scenePlaneMirror(r,n){ const mx=r.x+r.w*.5, base=r.y+r.h*.72, d=n===1?r.w*.24:r.w*.16; drawRuler(r.x+55,base+34,r.w-110); drawCandle(mx-d,base,false,"物蜡烛"); ctx.strokeStyle="#9bd3ff";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(mx,r.y+45);ctx.lineTo(mx,base+22);ctx.stroke(); ctx.fillStyle="rgba(155,211,255,.12)";ctx.fillRect(mx-7,r.y+48,14,base-r.y-28); drawCandle(mx+d,base,true,"替身蜡烛"); if(n===2) drawScreen(mx+d+65,base); label("玻璃板",mx,r.y+34); }
    function sceneConvexLens(r,n){ const railY=r.y+r.h*.72,lx=r.x+r.w*.5,obj=n===0?r.x+r.w*.18:n===1?r.x+r.w*.32:r.x+r.w*.43,screen=n===2?r.x+r.w*.82:n===1?r.x+r.w*.78:r.x+r.w*.67; drawRail(r.x+55,railY,r.w-110); drawCandle(obj,railY,false,"蜡烛"); drawLens(lx,railY,150); if(n!==2) drawScreen(screen,railY); drawRays(obj,lx,screen,railY,n); label("f",lx-76,railY+36); label("2f",lx-150,railY+36); label("f",lx+76,railY+36); label("2f",lx+150,railY+36); }
    function sceneCamera(r,n){ const bx=r.x+r.w*.35, by=r.y+r.h*.35; drawCandle(r.x+r.w*.18,by+95,false,"景物"); ctx.fillStyle="rgba(20,24,28,.9)"; roundRect(bx,by,300,160,10); ctx.fill(); ctx.strokeStyle="#9bd3ff"; ctx.stroke(); drawLens(bx+35,by+80,92); const screenX=bx+210+(n===2?38:n===1?-18:8); drawScreen(screenX,by+80); drawRays(r.x+r.w*.18,bx+35,screenX,by+80,n); label(n===0?"组装暗箱":n===1?"远景调焦":"近景调焦",bx+150,by-16); }
    function sceneEye(r,n){ const ex=r.x+r.w*.58, ey=r.y+r.h*.5; ctx.strokeStyle="#dcecff";ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(ex,ey,145,86,0,0,Math.PI*2);ctx.stroke(); drawLens(ex-52,ey,110); ctx.strokeStyle="#ff8a80";ctx.lineWidth=5;ctx.beginPath();ctx.arc(ex+100,ey,54,-1.2,1.2);ctx.stroke(); if(n===1) drawCorrectionLens(ex-132,ey,"凹透镜"); if(n===2) drawCorrectionLens(ex-132,ey,"凸透镜"); drawRays(r.x+90,ex-52,ex+(n===0?100:n===1?70:132),ey,n); label(n===0?"正常眼":n===1?"近视眼 + 凹透镜":"远视眼 + 凸透镜",ex,ey+126); }
    function sceneDispersion(r,n){ const sx=r.x+86, py=r.y+r.h*.52, px=r.x+r.w*.48; drawLamp(sx,py); ctx.strokeStyle="#fff";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(sx+38,py);ctx.lineTo(px-42,py-8);ctx.stroke(); drawPrism(px,py,n); const colors=["#ff4d4f","#ffb74d","#ffd54f","#3ddc97","#26e3d1","#5bbcff","#b084ff"]; colors.forEach((c,i)=>{ctx.strokeStyle=c;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(px+48,py+4);ctx.lineTo(r.x+r.w-90,py-72+i*23+(n===0?24:0));ctx.stroke();}); drawScreen(r.x+r.w-70,py); }
    function sceneColorMix(r,n){ const cx=r.x+r.w*.5, cy=r.y+r.h*.52; ctx.save(); ctx.globalAlpha=.62; const on=n===0?[1,1,0]:n===1?[0,1,1]:[1,1,1]; if(on[0]){ctx.fillStyle="#ff3344";ctx.beginPath();ctx.arc(cx-58,cy,95,0,Math.PI*2);ctx.fill();} if(on[1]){ctx.fillStyle="#29e06f";ctx.beginPath();ctx.arc(cx+58,cy,95,0,Math.PI*2);ctx.fill();} if(on[2]){ctx.fillStyle="#3388ff";ctx.beginPath();ctx.arc(cx,cy-76,95,0,Math.PI*2);ctx.fill();} ctx.restore(); drawLamp(cx-210,cy+110,"红"); drawLamp(cx,cy+130,"绿"); drawLamp(cx+210,cy+110,"蓝"); label("白屏上的色光叠加区",cx,cy+170); }
    function sceneStatic(r,n){ const x=r.x+r.w*.28,y=r.y+r.h*.48; ctx.strokeStyle=n===2?"#aaa":"#ffd54f";ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(x-90,y);ctx.lineTo(x+90,y-40);ctx.stroke(); ctx.fillStyle="#8d6e63";roundRect(x-110,y+28,180,34,10);ctx.fill();label("毛皮",x-20,y+84); for(let i=0;i<20;i++){ctx.fillStyle=n===0?"#ffd54f":"#777";ctx.fillRect(r.x+r.w*.58+Math.cos(i)*70,r.y+r.h*.58+Math.sin(i*2)*38,5,3);} drawElectroscope(r.x+r.w*.78,r.y+r.h*.52,n===1); }
    function sceneMagneticField(r,n){ const cx=r.x+r.w*.5,cy=r.y+r.h*.5; drawBarMagnet(cx,cy,n===2); ctx.strokeStyle="rgba(255,213,79,.45)";ctx.lineWidth=2;for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(cx,cy,170+i*25,74+i*18,0,0,Math.PI*2);ctx.stroke();} for(let i=0;i<9;i++) drawCompass(cx-220+i*55,cy+(i%2?100:-105),n===2); label("铁屑显示磁场分布，小磁针显示方向",cx,cy+155); }
    function sceneWireField(r,n){ const cx=r.x+r.w*.5,cy=r.y+r.h*.5; drawBattery(r.x+80,cy+110); drawSwitch(r.x+230,cy+110,n!==0); ctx.strokeStyle=n===0?"#777":"#ffd54f";ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(cx,cy-135);ctx.lineTo(cx,cy+135);ctx.stroke(); label(n===2?"I↓":"I↑",cx+34,cy); for(let i=0;i<6;i++) drawCompass(cx+Math.cos(i)*150,cy+Math.sin(i)*100,n===2); }
    function sceneSolenoid(r,n){ const cx=r.x+r.w*.5,cy=r.y+r.h*.53; drawBattery(r.x+75,cy+118); drawSwitch(r.x+235,cy+118,true); drawSolenoid(cx-140,cy,n===2); if(n===1){ctx.fillStyle="#8997a3";roundRect(cx-130,cy-12,260,24,12);ctx.fill();} drawCompass(cx+225,cy-60,n===2); label(n===2?"S       N":"N       S",cx,cy+86); }
    function sceneMotorForce(r,n){ const cx=r.x+r.w*.5,cy=r.y+r.h*.54; drawUShapeMagnet(cx,cy); ctx.strokeStyle="#ffd54f";ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(cx-120,cy);ctx.lineTo(cx+120,cy);ctx.stroke(); ctx.fillStyle="#ff7043";ctx.beginPath();ctx.moveTo(cx+(n===0?150:-150),cy);ctx.lineTo(cx+(n===0?105:-105),cy-18);ctx.lineTo(cx+(n===0?105:-105),cy+18);ctx.fill(); label(n===0?"受力向右":"受力向左",cx,cy+122); drawBattery(r.x+80,cy+126); }
    function sceneDcMotor(r,n){ const cx=r.x+r.w*.5,cy=r.y+r.h*.52; drawUShapeMagnet(cx,cy); ctx.strokeStyle="#ffd54f";ctx.lineWidth=6;ctx.strokeRect(cx-58,cy-92,116,184); ctx.fillStyle=n===2?"#3ddc97":"#ffb74d";ctx.beginPath();ctx.arc(cx,cy,28,0,Math.PI*2);ctx.fill(); drawBattery(r.x+85,cy+126); label(n===0?"线圈支架":n===1?"刮漆接触":"连续转动",cx,cy+140); }
    function sceneInduction(r,n){ const cx=r.x+r.w*.52,cy=r.y+r.h*.52; drawSolenoid(cx-70,cy,false); drawBarMagnet(cx+(n===1?-210:n===0?-150:-250),cy,n===2); drawMeter(r.x+r.w*.78,cy,"G",n===1?0:n===0?.7:-.7); label("闭合线圈 + 灵敏电流计",cx,cy+130); }
    function sceneGenerator(r,n){ const cx=r.x+r.w*.48,cy=r.y+r.h*.52; drawUShapeMagnet(cx,cy); ctx.strokeStyle="#ffd54f";ctx.lineWidth=5;ctx.strokeRect(cx-60,cy-80,120,160); drawMeter(r.x+r.w*.78,cy,"G",n===0?.25:n===1?.8:-.6); drawCrank(cx-100,cy,n); label(n===1?"快速手摇，输出增大":n===2?"反向手摇，指针反偏":"慢速手摇",cx,cy+135); }
    function sceneSteam(r,n){ const cx=r.x+r.w*.5,cy=r.y+r.h*.58; drawAlcoholLamp(cx-110,cy+82,n); ctx.save();ctx.translate(cx,cy);ctx.rotate(-.22);ctx.strokeStyle="#dcecff";ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(-130,0);ctx.lineTo(120,0);ctx.stroke();ctx.fillStyle="rgba(91,188,255,.36)";ctx.fillRect(-100,-8,110,16);ctx.fillStyle="#8d6e63";ctx.fillRect(102+n*30,-18,34,36);ctx.restore(); if(n===2){ctx.fillStyle="#ffb74d";ctx.beginPath();ctx.arc(cx+205,cy-70,18,0,Math.PI*2);ctx.fill();} label("试管内水蒸气推动橡皮塞",cx,cy+138); }
    function sceneFriction(r,n){ const cx=r.x+r.w*.5,cy=r.y+r.h*.5; ctx.fillStyle="#9bd3ff";roundRect(cx-160,cy-34,320,68,10);ctx.fill();ctx.strokeStyle="#dcecff";ctx.stroke(); ctx.strokeStyle="#ffd54f";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(cx-210,cy-70);ctx.quadraticCurveTo(cx,cy+(n===0?30:86),cx+210,cy-70);ctx.stroke(); ctx.fillStyle=n===0?"#ffd54f":"#ff7043";ctx.fillText(n===0?"温度略升":n===1?"温度明显升高":"机械能转化为内能",cx,cy+92); }
    function sceneMotorEnergy(r,n){ const cx=r.x+r.w*.5,cy=r.y+r.h*.52; drawBattery(r.x+90,cy+110); drawSwitch(r.x+245,cy+110,n>0); drawFan(cx,cy,n); label(n===0?"电路已接好":n===1?"风扇转动":"转速更快",cx,cy+138); }
    function sceneElectricHeat(r,n){ const cx=r.x+r.w*.5,cy=r.y+r.h*.53; drawBattery(r.x+80,cy+120); drawSwitch(r.x+235,cy+120,n>0); ctx.strokeStyle="#ff7043";ctx.lineWidth=5;ctx.beginPath();for(let i=0;i<10;i++)ctx.lineTo(cx-130+i*28,cy+Math.sin(i)*18);ctx.stroke(); drawThermometer(cx+190,cy,24+n*18); label("电热丝使温度升高",cx,cy+124); }
    function sceneEnergyTrack(r,n){ const cx=r.x+r.w*.5,cy=r.y+r.h*.62; ctx.strokeStyle="#9bd3ff";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(cx-280,cy-120);ctx.quadraticCurveTo(cx,cy+90,cx+280,cy-100);ctx.stroke(); const px=n===0?cx-230:n===1?cx:cx+190, py=n===0?cy-92:n===1?cy+70:cy-65; ctx.fillStyle="#ffd54f";ctx.beginPath();ctx.arc(px,py,22,0,Math.PI*2);ctx.fill(); label(n===1?"动能最大":"势能较大",px,py-34); }
    function scenePulley(r,n){ const cx=r.x+r.w*.5,cy=r.y+r.h*.48; drawPulley(cx-80,cy-80);drawPulley(cx+50,cy+28);ctx.strokeStyle="#dcecff";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(cx-80,cy-80);ctx.lineTo(cx-80,cy+120);ctx.lineTo(cx+50,cy+28);ctx.lineTo(cx+150,cy+120);ctx.stroke(); drawMeter(cx+190,cy+40,"N",n===0?.35:n===1?.55:.7); ctx.fillStyle="#ffb74d";roundRect(cx+16,cy+72,70,60,8);ctx.fill(); label("测 G、F、h、s 后计算 η",cx,cy+155); }
    function sceneHeatCapacity(r,n){ const cx=r.x+r.w*.5,cy=r.y+r.h*.55; drawBeaker(cx-120,cy,"水",n); drawBeaker(cx+120,cy,"食用油",n===0?0:n+1); drawThermometer(cx-55,cy-20,25+n*8); drawThermometer(cx+185,cy-20,25+n*16); label("等质量、相同加热器、比较升温",cx,cy+140); }
    function sceneHeatEngine(r,n){ const cx=r.x+r.w*.5,cy=r.y+r.h*.5; ctx.strokeStyle="#dcecff";ctx.lineWidth=4;roundRect(cx-140,cy-90,190,170,10);ctx.stroke(); const py=n===0?cy+40:n===1?cy-20:cy-60;ctx.fillStyle="#9bd3ff";ctx.fillRect(cx-120,py,150,24);ctx.fillStyle=n===1?"rgba(255,112,67,.55)":"rgba(255,183,77,.18)";ctx.fillRect(cx-118,cy-86,146,py-cy+86);ctx.strokeStyle="#dcecff";ctx.beginPath();ctx.arc(cx+160,cy+10,55,0,Math.PI*2);ctx.stroke(); label(["吸气冲程","做功冲程","排气冲程"][n],cx,cy+125); }
    function sceneAmmeter(r,n){ circuitBase(r,n,"A"); drawMeter(r.x+r.w*.5,r.y+r.h*.48,"A",n===2?-0.4:n===0?.45:.7); label(n===2?"错误：并联风险":"电流表串联读数",r.x+r.w*.5,r.y+r.h*.8); }
    function sceneVoltmeter(r,n){ circuitBase(r,n,"V"); drawMeter(r.x+r.w*.63,r.y+r.h*.42,"V",n===0?.55:n===1?.7:.9); label("电压表并联在被测元件两端",r.x+r.w*.5,r.y+r.h*.8); }
    function sceneSeriesParallel(r,n){ circuitBase(r,n,n===0?"series":"parallel"); label(n===0?"串联：一条路径":n===1?"并联：两条支路":"总开关/支路开关控制不同",r.x+r.w*.5,r.y+r.h*.8); }
    function sceneResistanceMeasure(r,n){ circuitBase(r,n,"R"); drawMeter(r.x+r.w*.43,r.y+r.h*.42,"A",.35+n*.15); drawMeter(r.x+r.w*.65,r.y+r.h*.42,"V",.38+n*.18); drawRheostat(r.x+r.w*.34,r.y+r.h*.64,n); label("调滑片，多次测 U/I 求平均电阻",r.x+r.w*.5,r.y+r.h*.86); }
    function sceneCircuitLaws(r,n){ circuitBase(r,n,n===2?"parallel":"series"); drawMeter(r.x+r.w*.43,r.y+r.h*.43,n===1?"V":"A",.55); drawMeter(r.x+r.w*.66,r.y+r.h*.43,n===1?"V":"A",n===2?.32:.55); label(n===0?"串联电流处处相等":n===1?"串联总电压等于各部分电压之和":"并联电压相等，总电流分流",r.x+r.w*.5,r.y+r.h*.82); }
    function sceneJouleHeat(r,n){ const cx=r.x+r.w*.5,cy=r.y+r.h*.55; drawBeaker(cx-135,cy,"5Ω",n); drawBeaker(cx+135,cy,"10Ω",n+1); drawThermometer(cx-70,cy-30,28+n*10); drawThermometer(cx+200,cy-30,28+n*18); drawRheostat(cx-70,cy+110,n); label("比较电阻、电流、时间对发热的影响",cx,cy+160); }
    function sceneSafety(r,n){ const cx=r.x+r.w*.5,cy=r.y+r.h*.52; ctx.strokeStyle="#ff7043";ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(r.x+80,cy-90);ctx.lineTo(r.x+r.w-80,cy-90);ctx.stroke();ctx.strokeStyle="#5bbcff";ctx.beginPath();ctx.moveTo(r.x+80,cy+80);ctx.lineTo(r.x+r.w-80,cy+80);ctx.stroke(); drawSwitch(cx-180,cy-90,n!==1); drawBulb(cx,cy,n!==1); ctx.fillStyle=n===1?"#ff4d4f":"#3ddc97";roundRect(cx+150,cy-112,86,44,8);ctx.fill();label(n===1?"保险丝熔断":"保护正常",cx+193,cy-84,"#061018"); if(n===2){ctx.strokeStyle="#3ddc97";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(cx+50,cy+35);ctx.lineTo(cx+210,cy+120);ctx.stroke();label("接地线",cx+170,cy+138);} }
    function sceneRenewable(r,n){ const cx=r.x+r.w*.5,cy=r.y+r.h*.54; ctx.fillStyle="#1e88e5";for(let i=0;i<5;i++)ctx.fillRect(cx-270+i*44,cy-70,36,56);ctx.fillStyle="#ffd54f";ctx.beginPath();ctx.arc(cx-310,cy-130,n===1?45:28,0,Math.PI*2);ctx.fill(); drawFan(cx+80,cy,n); ctx.fillStyle=n===2?"#3ddc97":"#555";roundRect(cx+205,cy+50,84,50,8);ctx.fill();label("储能模块",cx+247,cy+83,n===2?"#061018":"#eaf5ff");label(n===1?"强光输出更大":n===2?"遮光后短时运行":"弱光慢转",cx,cy+150); }
    function sceneFallback(r,n){ label(SPEC.apparatus,r.x+r.w/2,r.y+r.h/2); }
    function drawCandle(x,y,ghost,name){ ctx.globalAlpha=ghost?.45:1;ctx.fillStyle=ghost?"#9bd3ff":"#ff7043";roundRect(x-12,y-62,24,62,5);ctx.fill();ctx.fillStyle="#ffd54f";ctx.beginPath();ctx.arc(x,y-74,10,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;if(name)label(name,x,y+24); }
    function drawRuler(x,y,w){ctx.strokeStyle="#cfd7df";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.stroke();ctx.lineWidth=1;for(let i=0;i<=20;i++){const tx=x+w*i/20;ctx.beginPath();ctx.moveTo(tx,y);ctx.lineTo(tx,y+(i%5?8:16));ctx.stroke();}}
    function drawScreen(x,y){ctx.strokeStyle="#e8f5ff";ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x,y-95);ctx.lineTo(x,y+95);ctx.stroke();label("光屏",x,y+120);}
    function drawLens(x,y,h){ctx.strokeStyle="#9bd3ff";ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(x,y,22,h/2,0,0,Math.PI*2);ctx.stroke();label("凸透镜",x,y+h/2+24);}
    function drawCorrectionLens(x,y,t){ctx.strokeStyle=t==="凹透镜"?"#ffb74d":"#5bbcff";ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(x,y,t==="凹透镜"?14:26,82,0,0,Math.PI*2);ctx.stroke();label(t,x,y+108);}
    function drawRail(x,y,w){ctx.strokeStyle="rgba(255,255,255,.38)";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.stroke();}
    function drawRays(x1,x2,x3,y,n){ctx.strokeStyle="#ffd54f";ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x1,y-50);ctx.lineTo(x2,y);ctx.lineTo(x3,y+(n===2?-70:60));ctx.stroke();ctx.beginPath();ctx.moveTo(x1,y+5);ctx.lineTo(x2,y);ctx.lineTo(x3,y+(n===2?-25:-60));ctx.stroke();}
    function drawLamp(x,y,t){ctx.fillStyle="#444";roundRect(x-28,y-24,56,48,8);ctx.fill();ctx.fillStyle="#ffd54f";ctx.beginPath();ctx.arc(x,y,18,0,Math.PI*2);ctx.fill();if(t)label(t,x,y+45);}
    function drawPrism(cx,cy,n){ctx.fillStyle="rgba(155,211,255,.18)";ctx.strokeStyle="#9bd3ff";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx-58,cy+78);ctx.lineTo(cx,cy-76);ctx.lineTo(cx+74,cy+78);ctx.closePath();ctx.fill();ctx.stroke();}
    function drawElectroscope(x,y,open){ctx.strokeStyle="#dcecff";ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y-72,16,0,Math.PI*2);ctx.moveTo(x,y-56);ctx.lineTo(x,y+36);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y+36);ctx.lineTo(x+(open?42:12),y+88);ctx.moveTo(x,y+36);ctx.lineTo(x-(open?42:12),y+88);ctx.stroke();label("验电器",x,y+120);}
    function drawBarMagnet(cx,cy,reverse){ctx.fillStyle=reverse?"#3498db":"#e74c3c";roundRect(cx-130,cy-28,130,56,8);ctx.fill();ctx.fillStyle=reverse?"#e74c3c":"#3498db";roundRect(cx,cy-28,130,56,8);ctx.fill();ctx.fillStyle="#fff";ctx.font="700 18px Arial";ctx.textAlign="center";ctx.fillText(reverse?"S":"N",cx-66,cy+7);ctx.fillText(reverse?"N":"S",cx+66,cy+7);}
    function drawCompass(x,y,rev){ctx.strokeStyle="#dcecff";ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,28,0,Math.PI*2);ctx.stroke();ctx.fillStyle="#ff4d4f";ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(rev?-22:22),y-7);ctx.lineTo(x,y+7);ctx.fill();}
    function drawBattery(x,y){ctx.fillStyle="#39424d";roundRect(x-48,y-32,96,64,8);ctx.fill();ctx.fillStyle="#ff6b6b";ctx.fillRect(x+32,y-6,12,12);ctx.fillStyle="#8fc8ff";ctx.fillRect(x-44,y+20,12,12);label("电源",x,y-45);}
    function drawSwitch(x,y,closed){ctx.fillStyle="#6d5a45";roundRect(x-55,y-18,110,36,7);ctx.fill();ctx.strokeStyle=closed?"#ffd54f":"#cfd7df";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-35,y);ctx.lineTo(x+35,closed?y:y-28);ctx.stroke();}
    function drawSolenoid(x,y,rev){ctx.strokeStyle="#ffb74d";ctx.lineWidth=4;for(let i=0;i<9;i++){ctx.beginPath();ctx.ellipse(x+i*30,y,17,34,0,0,Math.PI*2);ctx.stroke();}label("螺线管",x+120,y-54);}
    function drawUShapeMagnet(cx,cy){ctx.fillStyle="#e74c3c";roundRect(cx-190,cy-105,70,210,10);ctx.fill();ctx.fillStyle="#3498db";roundRect(cx+120,cy-105,70,210,10);ctx.fill();ctx.fillStyle="#fff";label("N",cx-155,cy);label("S",cx+155,cy);}
    function drawMeter(x,y,t,ratio){ctx.strokeStyle=t==="A"?"#3ddc97":t==="V"?"#5bbcff":"#ffd54f";ctx.lineWidth=3;ctx.fillStyle="#eaf5ff";ctx.beginPath();ctx.arc(x,y,43,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle="#26323f";ctx.font="700 21px Arial";ctx.textAlign="center";ctx.fillText(t,x,y-4);ctx.strokeStyle="#d33";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y+12);ctx.lineTo(x+Math.cos(-2.1+clamp((ratio+1)/2,0,1)*2.8)*31,y+12+Math.sin(-2.1+clamp((ratio+1)/2,0,1)*2.8)*31);ctx.stroke();}
    function drawCrank(x,y,n){ctx.strokeStyle="#cfd7df";ctx.lineWidth=5;ctx.beginPath();ctx.arc(x,y,32,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+42*Math.cos(n),y+42*Math.sin(n));ctx.stroke();}
    function drawAlcoholLamp(x,y,n){ctx.fillStyle="#54616e";roundRect(x-34,y,68,42,8);ctx.fill();ctx.fillStyle=n?"#ff7043":"#886";ctx.beginPath();ctx.moveTo(x,y-40);ctx.quadraticCurveTo(x+22,y-5,x,y);ctx.quadraticCurveTo(x-22,y-5,x,y-40);ctx.fill();label("酒精灯",x,y+62);}
    function drawFan(cx,cy,n){ctx.fillStyle="#333";ctx.beginPath();ctx.arc(cx,cy,22,0,Math.PI*2);ctx.fill();ctx.fillStyle=n?"#3ddc97":"#777";for(let i=0;i<3;i++){ctx.save();ctx.translate(cx,cy);ctx.rotate(i*2.1+(n*.4));roundRect(8,-13,86,26,13);ctx.fill();ctx.restore();}label("小电动机",cx,cy+80);}
    function drawThermometer(x,y,temp){ctx.strokeStyle="#dcecff";ctx.lineWidth=3;ctx.strokeRect(x-8,y-90,16,112);ctx.fillStyle="#ff7043";ctx.fillRect(x-5,y+18-temp,10,temp);ctx.beginPath();ctx.arc(x,y+30,18,0,Math.PI*2);ctx.fill();}
    function drawBeaker(x,y,name,heat){ctx.strokeStyle="#dcecff";ctx.lineWidth=3;ctx.strokeRect(x-54,y-70,108,140);ctx.fillStyle="rgba(91,188,255,.35)";ctx.fillRect(x-51,y-10-(heat||0)*9,102,80+(heat||0)*9);label(name,x,y+98);}
    function drawPulley(x,y){ctx.strokeStyle="#dcecff";ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,34,0,Math.PI*2);ctx.stroke();}
    function drawBulb(x,y,on){ctx.strokeStyle="#dcecff";ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,28,0,Math.PI*2);ctx.stroke();if(on){ctx.fillStyle="rgba(255,213,79,.55)";ctx.beginPath();ctx.arc(x,y,38,0,Math.PI*2);ctx.fill();}}
    function drawRheostat(x,y,n){ctx.fillStyle="#333b43";roundRect(x-95,y-32,190,64,8);ctx.fill();ctx.strokeStyle="#cfd8dc";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x-70,y-10);ctx.lineTo(x+70,y-10);ctx.stroke();ctx.fillStyle="#5bbcff";roundRect(x-60+n*55,y-30,24,42,6);ctx.fill();label("滑动变阻器",x,y+54);}
    function circuitBase(r,n,mode){const cx=r.x+r.w*.5,cy=r.y+r.h*.55;drawBattery(r.x+110,cy+100);drawSwitch(r.x+260,cy-100,n!==2);drawBulb(cx+160,cy-100,true);ctx.strokeStyle="#dcecff";ctx.lineWidth=4;roundRect(cx-230,cy-125,460,250,8);ctx.stroke();if(mode==="parallel"){ctx.strokeStyle="#3ddc97";ctx.strokeRect(cx-95,cy-45,190,86);drawBulb(cx-48,cy,true);drawBulb(cx+48,cy,true);}else{drawBulb(cx,cy+105,true);}}
    function wrapText(text,x,y,maxWidth,lineHeight){ const chars=String(text).split(""); let line=""; for(const ch of chars){ const test=line+ch; if(ctx.measureText(test).width>maxWidth&&line){ctx.fillText(line,x,y); line=ch; y+=lineHeight;} else line=test;} ctx.fillText(line,x,y); }
    function pointerStage(e){ const r=canvas.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; }
    function onPointerDown(e){ if (state.autoPlaying) return; state.drag = true; canvas.setPointerCapture(e.pointerId); operateByPoint(pointerStage(e)); e.preventDefault(); }
    function onPointerMove(e){ if (!state.drag || state.autoPlaying) return; operateByPoint(pointerStage(e)); e.preventDefault(); }
    function onPointerUp(e){ if (state.drag) { try { canvas.releasePointerCapture(e.pointerId); } catch(err) { console.warn("release stage pointer failed", err); } state.drag=false; passStepIfReady({ quiet:true }); } e.preventDefault(); }
    function operateByPoint(p){ const ratio = clamp(p.x / Math.max(1,state.width), 0, 1); const idx = ratio < .36 ? 0 : ratio < .66 ? 1 : 2; setScenario(idx, true); }
    function moveCursorTo(x,y){const sr=stage.getBoundingClientRect(), lr=labArea.getBoundingClientRect();demoCursor.style.opacity="1";demoCursor.style.transform="translate("+(lr.left-sr.left+x-10)+"px,"+(lr.top-sr.top+y-10)+"px)";}
    function clickCursor(){demoCursor.classList.remove("click");void demoCursor.offsetWidth;demoCursor.classList.add("click");}
    async function autoRecord(key){const before=state.records.length;const ok=recordObservation({auto:true});await sleep(240);if(!ok||!hasRecord(key)||state.records.length<=before)throw new Error("AUTO_RECORD_NOT_PERSISTED:"+key);}
    async function runAutoDemo(){ if(state.autoPlaying){state.autoCancel=true;return;} state.autoPlaying=true;state.autoCancel=false;autoDemoBtn.textContent="退出自动演示";freeBtn.disabled=true;setDrawerCollapsed(controlDock,false);setDrawerCollapsed(dataDock,true);setModeLabel(); resetScene({keepMode:false,quiet:true}); state.autoPlaying=true;autoDemoBtn.textContent="退出自动演示";setModeLabel(); try{for(let i=0;i<SPEC.scenarios.length;i++){if(state.autoCancel)throw new Error("AUTO_CANCELLED");setStepUI(i);moveCursorTo(state.width*(.22+i*.28),state.height*.52);clickCursor();setScenario(i,true);await sleep(420);await autoRecord(SPEC.scenarios[i].key);}setStepUI(3);await sleep(250);setDrawerCollapsed(dataDock,false);analyzeConclusion();}catch(err){if(String(err.message||err)!=="AUTO_CANCELLED")showToast("自动演示中断："+(err.message||err));else showToast("已退出自动演示");}finally{state.autoPlaying=false;state.autoCancel=false;autoDemoBtn.textContent="自动演示";freeBtn.disabled=false;demoCursor.style.opacity="0";setModeLabel();updateStatus();draw();}}
    function resetScene(opts){ clearTimers(); state.completed=false; state.autoCancel=false; state.stepWarning=false; state.successCooldown=false; state.scenarioIndex=0; state.operationCount=0; state.records=[]; state.unseenRecords=0; state.analysisDone=false; if(!opts || !opts.keepMode) state.freeMode=false; doneMask.style.display="none"; analysisText.classList.remove("ok"); analysisText.textContent="按步骤操作并记录三组关键现象，再归纳结论。"; renderRecords(); updateBadge(); setModeLabel(); setStepUI(0); if(!opts || !opts.quiet) showToast("已重置当前实验。"); }
    function setFreeMode(on){ state.freeMode=!!on; freeBtn.textContent=state.freeMode?"退出自由模式":"自由模式"; autoDemoBtn.disabled=state.freeMode; setModeLabel(); showToast(state.freeMode?"自由模式下可任意操作和记录。":"已回到引导模式。"); draw(); }
    function initEvents(){ canvas.addEventListener("pointerdown",onPointerDown); canvas.addEventListener("pointermove",onPointerMove); canvas.addEventListener("pointerup",onPointerUp); canvas.addEventListener("pointercancel",onPointerUp); operateBtn.addEventListener("click",operateNext); recordBtn.addEventListener("click",() => recordObservation()); analyzeBtn.addEventListener("click",analyzeConclusion); resetBtn.addEventListener("click",() => { const free=state.freeMode; resetScene({keepMode:true,quiet:true}); state.freeMode=free; setFreeMode(free); showToast("已重置当前实验。"); }); autoDemoBtn.addEventListener("click",runAutoDemo); freeBtn.addEventListener("click",() => setFreeMode(!state.freeMode)); controlToggleBtn.addEventListener("click",() => setDrawerCollapsed(controlDock,!controlDock.classList.contains("collapsed"))); dataToggleBtn.addEventListener("click",() => setDrawerCollapsed(dataDock,!dataDock.classList.contains("collapsed"))); hintLamp.addEventListener("click",() => hintPop.classList.toggle("open")); okBtn.addEventListener("click",() => { doneMask.style.display="none"; }); bindDrawer(controlDock); bindDrawer(dataDock); window.addEventListener("resize",() => { clearTimeout(resizeCanvas.t); resizeCanvas.t=setTimeout(resizeCanvas,120); }); }
    function init(){ initDots(); initEvents(); resizeCanvas(); setDrawerCollapsed(controlDock,true); setDrawerCollapsed(dataDock,true); resetScene({quiet:true}); requestAnimationFrame(() => { resizeCanvas(); draw(); }); setTimeout(() => { resizeCanvas(); draw(); },180); }
    init(); window.state = state; window.recordObservation = recordObservation; window.analyzeConclusion = analyzeConclusion;
  })();
  </script>
</body>
</html>
`;
}

for (const spec of specs) {
  const file = path.join(ROOT, `初中物理实验${spec.id}.html`);
  fs.writeFileSync(file, page(spec), "utf8");
  console.log(`wrote ${path.basename(file)} :: ${spec.textbook}`);
}
