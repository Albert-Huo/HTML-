#!/usr/bin/env node
import fs from "fs";
import path from "path";

const outDir = process.cwd();

const specs = [
  {
    id: 38,
    title: "探究平面镜成像的特点",
    category: "mirror",
    apparatus: "玻璃板、两支相同蜡烛、白纸、刻度尺",
    conclusion: "平面镜所成的像是虚像，像与物大小相等，像和物到镜面的距离相等，像与物关于镜面对称。",
    keyPoint: "移动像蜡烛与镜中像重合，比较像距、物距和大小。",
    scenarios: [
      ["near", "近处蜡烛", "物距 8 cm", "像距也约 8 cm，像与物关于镜面对称。"],
      ["far", "远处蜡烛", "物距 14 cm", "像的位置随物体远离而等距后移，大小不变。"],
      ["screen", "光屏承接", "在像的位置放光屏", "光屏上不能承接到蜡烛像，说明是虚像。"]
    ]
  },
  {
    id: 39,
    title: "探究凸透镜成像的规律",
    category: "lens",
    apparatus: "光具座、凸透镜、发光物体、光屏、刻度尺",
    conclusion: "物距大于二倍焦距成倒立缩小实像，物距在一倍到二倍焦距之间成倒立放大实像，物距小于焦距成正立放大虚像。",
    keyPoint: "改变物距并移动光屏，比较像的虚实、大小和正倒。",
    scenarios: [
      ["far", "u > 2f", "物体放在 2f 外", "光屏上得到倒立、缩小的实像。"],
      ["mid", "f < u < 2f", "物体移到 f 与 2f 之间", "光屏上得到倒立、放大的实像。"],
      ["inside", "u < f", "物体移到焦距以内", "光屏上不能成实像，从透镜另一侧观察到正立放大的虚像。"]
    ]
  },
  {
    id: 40,
    title: "用凸透镜设计与制作简易照相机",
    category: "camera",
    apparatus: "凸透镜、暗盒、半透明纸屏、远处物体",
    conclusion: "简易照相机利用凸透镜成倒立缩小实像，调节镜头与屏的距离可以使像清晰。",
    keyPoint: "移动纸屏找到清晰倒立像，理解照相机成像原理。",
    scenarios: [
      ["focus", "远景对焦", "纸屏调到焦点附近", "屏上出现远处物体倒立缩小的清晰像。"],
      ["near", "近景对焦", "近处物体需拉长暗盒", "像距增大，纸屏后移后像重新清晰。"],
      ["blur", "未对焦", "纸屏偏离清晰位置", "像变模糊，说明需要调焦。"]
    ]
  },
  {
    id: 41,
    title: "模拟近视眼和远视眼的矫正",
    category: "eye",
    apparatus: "凸透镜、光屏、凹透镜、凸透镜片",
    conclusion: "近视眼成像在视网膜前，用凹透镜矫正；远视眼成像在视网膜后，用凸透镜矫正。",
    keyPoint: "观察焦点相对视网膜的位置，再加入合适镜片矫正。",
    scenarios: [
      ["myopia", "近视模拟", "焦点落在视网膜前", "远处光会聚过早，视网膜上成模糊像。"],
      ["myopiaFix", "凹透镜矫正", "加入凹透镜", "光线先发散再会聚，焦点回到视网膜上。"],
      ["hyperopiaFix", "凸透镜矫正远视", "加入凸透镜", "对会聚不足的光线补偿，像落回视网膜。"]
    ]
  },
  {
    id: 42,
    title: "观察白光的色散现象",
    category: "prism",
    apparatus: "三棱镜、白屏、白光光源",
    conclusion: "白光通过三棱镜后分解成多种色光，不同色光偏折程度不同。",
    keyPoint: "让白光斜射入三棱镜，在屏上观察彩色光带。",
    scenarios: [
      ["white", "白光入射", "白光射入三棱镜", "屏上出现由红到紫的彩色光带。"],
      ["angle", "改变入射角", "轻微转动三棱镜", "彩色光带位置移动，排列顺序不变。"],
      ["narrow", "窄缝增强", "缩窄入射光束", "色带边界更清楚，便于观察色散。"]
    ]
  },
  {
    id: 43,
    title: "观察色光的混合",
    category: "rgb",
    apparatus: "红、绿、蓝三色光源、白屏",
    conclusion: "红、绿、蓝是色光的三原色，三种色光按不同比例混合可以形成多种颜色，三色等强混合接近白光。",
    keyPoint: "调节三色光强度，观察重叠区域颜色变化。",
    scenarios: [
      ["rg", "红绿混合", "打开红光和绿光", "重叠处呈黄色。"],
      ["gb", "绿蓝混合", "打开绿光和蓝光", "重叠处呈青色。"],
      ["rgb", "三色混合", "红绿蓝三色同时照射", "中心重叠处接近白色。"]
    ]
  },
  {
    id: 44,
    title: "观察摩擦起电现象",
    category: "static",
    apparatus: "塑料棒、毛皮、纸屑、验电器",
    conclusion: "物体相互摩擦后可以带电，带电体能吸引轻小物体，同种电荷相互排斥。",
    keyPoint: "摩擦塑料棒后靠近纸屑和验电器，观察吸引与张角。",
    scenarios: [
      ["rub", "摩擦塑料棒", "塑料棒与毛皮摩擦", "塑料棒带电，靠近纸屑时纸屑被吸引。"],
      ["electroscope", "接触验电器", "带电棒接触验电器", "金属箔张开，说明电荷转移并相互排斥。"],
      ["discharge", "放电后", "用手触碰金属球", "验电器张角变小，电荷转移到人体和大地。"]
    ]
  },
  {
    id: 45,
    title: "用小磁针和铁屑观测磁场的方向和分布情况",
    category: "magnet",
    apparatus: "条形磁体、小磁针、铁屑、白纸",
    conclusion: "磁体周围存在磁场，铁屑显示磁场分布，小磁针 N 极指向表示该点磁场方向。",
    keyPoint: "撒铁屑并轻敲纸板，再移动小磁针观察方向。",
    scenarios: [
      ["bar", "条形磁体", "白纸下放条形磁体并撒铁屑", "铁屑沿磁感线方向排列，两极附近最密。"],
      ["needle", "移动小磁针", "把小磁针放到不同位置", "小磁针 N 极沿该处磁场方向偏转。"],
      ["poles", "比较磁极", "靠近 N 极和 S 极", "磁场方向从 N 极出发，回到 S 极。"]
    ]
  },
  {
    id: 46,
    title: "观察通电导体周围产生磁场的现象",
    category: "wiremag",
    apparatus: "直导线、电源、开关、小磁针",
    conclusion: "通电导体周围存在磁场，电流方向改变时磁场方向也改变。",
    keyPoint: "闭合开关观察小磁针偏转，再改变电流方向。",
    scenarios: [
      ["off", "断电", "开关断开", "小磁针保持南北方向。"],
      ["on", "通电", "闭合开关", "导线旁小磁针发生偏转，说明电流周围存在磁场。"],
      ["reverse", "反接电源", "改变电流方向", "小磁针向相反方向偏转，磁场方向随电流方向改变。"]
    ]
  },
  {
    id: 47,
    title: "探究通电螺线管外部磁场的方向",
    category: "solenoid",
    apparatus: "螺线管、电源、开关、小磁针、铁屑",
    conclusion: "通电螺线管外部磁场与条形磁体相似，极性由电流方向决定，可用右手螺旋定则判断。",
    keyPoint: "改变电流方向，观察螺线管两端磁极和小磁针指向。",
    scenarios: [
      ["forward", "正向电流", "按标定方向通电", "螺线管一端表现为 N 极，外部磁场类似条形磁体。"],
      ["reverse", "反向电流", "调换电源两极", "螺线管两端磁极互换。"],
      ["needle", "小磁针验证", "沿螺线管外部移动小磁针", "N 极指向与外部磁场方向一致。"]
    ]
  },
  {
    id: 48,
    title: "观察通电导线在磁场中的受力情况",
    category: "motorforce",
    apparatus: "U 形磁体、导线、电源、开关",
    conclusion: "通电导线在磁场中会受到力，受力方向与电流方向和磁场方向有关。",
    keyPoint: "闭合开关观察导线运动，分别改变电流方向和磁场方向。",
    scenarios: [
      ["forward", "正向电流", "导线通正向电流", "导线向一侧运动，说明受到磁场力。"],
      ["reverseI", "反向电流", "调换电源两极", "导线受力方向反向。"],
      ["reverseB", "反转磁体", "改变磁场方向", "导线受力方向也反向。"]
    ]
  },
  {
    id: 49,
    title: "设计与制作简易直流电动机模型",
    category: "motor",
    apparatus: "线圈、磁体、电池、换向器、支架",
    conclusion: "直流电动机利用通电线圈在磁场中受力转动，换向器使线圈持续沿同一方向转动。",
    keyPoint: "接通电路并调整线圈与换向器，使线圈持续转动。",
    scenarios: [
      ["align", "调整线圈", "线圈放在磁场中并刮去半圈漆皮", "线圈能获得周期性电流。"],
      ["spin", "接通电源", "轻推线圈后闭合电路", "线圈在磁场力作用下持续转动。"],
      ["reverse", "反接电源", "改变电流方向", "电动机转向改变。"]
    ]
  },
  {
    id: 50,
    title: "探究导体在磁场中运动时产生感应电流的条件",
    category: "induction",
    apparatus: "U 形磁体、导体棒、灵敏电流计、导线",
    conclusion: "闭合电路的一部分导体在磁场中做切割磁感线运动时会产生感应电流，方向与运动方向和磁场方向有关。",
    keyPoint: "让导体棒横向切割磁感线，观察灵敏电流计指针偏转。",
    scenarios: [
      ["still", "静止", "导体棒静止在磁场中", "电流计不偏转，没有感应电流。"],
      ["cut", "切割磁感线", "导体棒横向运动", "电流计偏转，产生感应电流。"],
      ["reverse", "反向运动", "导体棒反向切割", "电流计反向偏转，感应电流方向改变。"]
    ]
  },
  {
    id: 51,
    title: "设计与制作简易直流发电机模型",
    category: "generator",
    apparatus: "线圈、磁体、换向器、小灯泡、摇柄",
    conclusion: "发电机利用电磁感应把机械能转化为电能，线圈转动越快，感应电流越明显。",
    keyPoint: "转动线圈切割磁感线，观察小灯泡或电流计变化。",
    scenarios: [
      ["slow", "慢速转动", "缓慢摇动线圈", "小灯泡微亮，电流计轻微偏转。"],
      ["fast", "快速转动", "加快摇柄转速", "小灯泡更亮，感应电流增大。"],
      ["reverse", "反向转动", "反向摇动线圈", "电流计偏转方向改变。"]
    ]
  },
  {
    id: 52,
    title: "观察内能转化为机械能的实验现象",
    category: "thermal",
    apparatus: "试管、水、橡皮塞、酒精灯",
    conclusion: "水蒸气膨胀推动塞子运动，说明内能可以转化为机械能。",
    keyPoint: "加热试管内少量水，观察橡皮塞被推出。",
    scenarios: [
      ["warm", "开始加热", "水温升高并产生少量水蒸气", "塞子轻微振动。"],
      ["steam", "水蒸气增多", "继续加热", "试管内压强增大，塞子明显晃动。"],
      ["pop", "塞子弹出", "水蒸气膨胀做功", "塞子被推出，内能转化为机械能。"]
    ]
  },
  {
    id: 53,
    title: "观察机械能转化为内能的实验现象",
    category: "frictionheat",
    apparatus: "砂纸、木块、温度计",
    conclusion: "摩擦做功会使物体温度升高，机械能可以转化为内能。",
    keyPoint: "快速摩擦物体表面，观察温度或触感变化。",
    scenarios: [
      ["slow", "轻擦", "低速摩擦木块", "温度变化不明显。"],
      ["fast", "快速摩擦", "用砂纸快速摩擦", "表面温度升高。"],
      ["more", "增加压力", "增大压力后摩擦", "升温更明显，说明做功越多内能增加越多。"]
    ]
  },
  {
    id: 54,
    title: "观察电能转化为机械能的实验现象",
    category: "electricmotor",
    apparatus: "小电动机、电池、开关、叶片",
    conclusion: "电动机通电后转动，电能转化为机械能。",
    keyPoint: "闭合电路，观察电动机和叶片的运动。",
    scenarios: [
      ["off", "断开开关", "电路断开", "电动机不转动。"],
      ["on", "闭合开关", "电动机通电", "叶片转动，电能转化为机械能。"],
      ["more", "增加电压", "串联更多电池", "转速增大，机械效果更明显。"]
    ]
  },
  {
    id: 55,
    title: "观察电能转化为内能的实验现象",
    category: "joule",
    apparatus: "电热丝、电源、温度计、烧杯水",
    conclusion: "电流通过电热丝会发热，电能可以转化为内能。",
    keyPoint: "让电热丝通电，观察水温升高。",
    scenarios: [
      ["low", "小电流", "低电压通电", "温度缓慢升高。"],
      ["high", "大电流", "提高电压或减小电阻", "水温升高更快。"],
      ["long", "延长时间", "保持通电更久", "水吸收更多热量。"]
    ]
  },
  {
    id: 56,
    title: "观察动能和势能相互转化的实验现象",
    category: "pendulum",
    apparatus: "摆球、细线、支架",
    conclusion: "摆球下落时重力势能转化为动能，上升时动能又转化为重力势能。",
    keyPoint: "释放摆球，观察高度和速度变化。",
    scenarios: [
      ["high", "最高点", "摆球被拉高后静止", "重力势能最大，动能近似为零。"],
      ["low", "最低点", "摆球通过最低点", "速度最大，动能最大。"],
      ["rise", "上升过程", "摆球继续上升", "动能转化为重力势能。"]
    ]
  },
  {
    id: 57,
    title: "测量某种简单机械的机械效率",
    category: "efficiency",
    apparatus: "滑轮组、弹簧测力计、刻度尺、重物",
    conclusion: "机械效率等于有用功与总功的比值，摩擦和机械自重会使效率小于 100%。",
    keyPoint: "测量拉力、拉绳距离、物重和物体升高距离，计算效率。",
    scenarios: [
      ["light", "轻载", "提升较轻重物", "有用功较小，效率偏低。"],
      ["heavy", "重载", "提升较重重物", "有用功占比提高，效率增大。"],
      ["friction", "增大摩擦", "滑轮转动不灵活", "额外功增多，机械效率降低。"]
    ]
  },
  {
    id: 58,
    title: "探究物体吸收的热量跟物体质量、温度变化的关系",
    category: "heatcapacity",
    apparatus: "烧杯、水、加热器、温度计、天平",
    conclusion: "同种物质吸收的热量与质量和升高的温度有关，质量越大或温度升高越多，需要吸收的热量越多。",
    keyPoint: "控制变量比较不同质量水升高相同温度所需加热时间。",
    scenarios: [
      ["sameMass", "同质量升温", "质量相同，加热时间增加", "温度升高更多，吸收热量更多。"],
      ["doubleMass", "质量加倍", "质量更大的水升高同样温度", "需要更长加热时间。"],
      ["sameDelta", "相同温升", "比较不同质量水的加热时间", "质量越大吸热越多。"]
    ]
  },
  {
    id: 59,
    title: "观察热机的工作过程",
    category: "engine",
    apparatus: "热机模型、活塞、连杆、飞轮",
    conclusion: "热机通过吸气、压缩、做功、排气等过程，把燃料燃烧产生的内能转化为机械能。",
    keyPoint: "转动飞轮观察四冲程顺序和活塞运动。",
    scenarios: [
      ["intake", "吸气冲程", "活塞下行，进气门打开", "燃料和空气进入汽缸。"],
      ["power", "做功冲程", "燃气膨胀推动活塞", "内能转化为机械能。"],
      ["exhaust", "排气冲程", "排气门打开", "废气排出，循环继续。"]
    ]
  },
  {
    id: 60,
    title: "探究电流与电压、电阻的关系",
    category: "ohm",
    apparatus: "电源、定值电阻、滑动变阻器、电流表、电压表",
    conclusion: "电阻一定时，电流与电压成正比；电压一定时，电流与电阻成反比。",
    keyPoint: "控制变量，分别改变电压和电阻并记录电流。",
    scenarios: [
      ["voltageLow", "低电压", "电阻一定，调小电压", "电流较小。"],
      ["voltageHigh", "高电压", "电阻一定，调大电压", "电流随电压增大。"],
      ["resistanceHigh", "大电阻", "电压一定，换较大电阻", "电流变小。"]
    ]
  },
  {
    id: 61,
    title: "用电流表测量电流",
    category: "ammeter",
    apparatus: "电流表、电源、小灯泡、开关、导线",
    conclusion: "电流表应串联在被测电路中，并选择合适量程，电流从正接线柱流入。",
    keyPoint: "把电流表串联接入电路并读数。",
    scenarios: [
      ["series", "串联接入", "电流表串联在灯泡支路", "指针正向偏转，读出电流。"],
      ["range", "选择量程", "换用合适量程", "指针偏转适中，读数更准确。"],
      ["wrong", "错误接法", "电流表并联接入", "电流过大风险，需要立即断开。"]
    ]
  },
  {
    id: 62,
    title: "用电压表测量电压",
    category: "voltmeter",
    apparatus: "电压表、电源、小灯泡、开关、导线",
    conclusion: "电压表应并联在被测用电器两端，并让电流从正接线柱流入。",
    keyPoint: "把电压表并联在灯泡两端并读数。",
    scenarios: [
      ["parallel", "并联接入", "电压表接在灯泡两端", "指针正向偏转，读出灯泡两端电压。"],
      ["battery", "测电源电压", "电压表接在电源两端", "读出电源电压。"],
      ["wrong", "反接", "正负接线柱接反", "指针反偏，需调整接线。"]
    ]
  },
  {
    id: 63,
    title: "连接串联电路和并联电路",
    category: "seriesparallel",
    apparatus: "电源、开关、两个小灯泡、导线",
    conclusion: "串联电路只有一条电流路径，并联电路有多条支路，各支路可以相对独立工作。",
    keyPoint: "分别连接串联和并联，观察开关控制效果。",
    scenarios: [
      ["series", "串联电路", "两个灯泡首尾相接", "一个灯泡断开，两灯都熄灭。"],
      ["parallel", "并联电路", "两个灯泡分别接在两条支路", "一个支路断开，另一支路仍可工作。"],
      ["switch", "支路开关", "只断开一个支路开关", "只控制对应支路灯泡。"]
    ]
  },
  {
    id: 64,
    title: "用电流表和电压表测量电阻",
    category: "resistance",
    apparatus: "电源、待测电阻、电流表、电压表、滑动变阻器",
    conclusion: "测出待测电阻两端电压和通过它的电流，可用 R=U/I 求出电阻，多次测量取平均值可减小误差。",
    keyPoint: "调节滑动变阻器，记录多组 U、I 并计算 R。",
    scenarios: [
      ["low", "第一组读数", "U=1.5 V，I=0.30 A", "计算电阻约 5.0 Ω。"],
      ["mid", "第二组读数", "U=2.0 V，I=0.40 A", "计算电阻约 5.0 Ω。"],
      ["avg", "多次平均", "比较多组计算结果", "取平均值可减小读数误差。"]
    ]
  },
  {
    id: 65,
    title: "探究串联电路和并联电路中电流、电压的特点",
    category: "circuitlaw",
    apparatus: "电源、小灯泡、电流表、电压表、开关、导线",
    conclusion: "串联电路中电流处处相等、总电压等于各部分电压之和；并联电路中各支路电压相等、干路电流等于各支路电流之和。",
    keyPoint: "分别测量串联和并联电路中的电流、电压。",
    scenarios: [
      ["seriesI", "串联电流", "测串联不同位置电流", "各处电流相等。"],
      ["seriesU", "串联电压", "测总电压和分电压", "总电压等于各部分电压之和。"],
      ["parallel", "并联规律", "测并联干路和支路", "支路电压相等，干路电流等于支路电流之和。"]
    ]
  },
  {
    id: 66,
    title: "探究电流产生热量与哪些因素有关",
    category: "joulelaw",
    apparatus: "焦耳定律演示器、电阻丝、电源、温度计",
    conclusion: "电流产生的热量与电流大小、电阻大小和通电时间有关。",
    keyPoint: "比较不同电流、不同电阻和不同通电时间下温度变化。",
    scenarios: [
      ["current", "增大电流", "同一电阻中增大电流", "温度升高更快。"],
      ["resistor", "增大电阻", "同电流通过较大电阻", "较大电阻产生热量更多。"],
      ["time", "延长时间", "保持电流继续通电", "通电时间越长，产生热量越多。"]
    ]
  },
  {
    id: 67,
    title: "用低压电模拟家庭电路中的安全用电",
    category: "safety",
    apparatus: "低压电源、保险丝、开关、模拟插座、用电器",
    conclusion: "家庭电路应正确连接开关、保险装置和用电器，过载或短路会使保护装置动作，安全用电要避免人体接触火线。",
    keyPoint: "用低压电模拟过载、短路和正确接线。",
    scenarios: [
      ["normal", "正常接线", "开关控制用电器", "灯泡正常发光，电路安全。"],
      ["overload", "过载", "接入过多用电器", "保险装置断开，保护电路。"],
      ["short", "短路", "火线零线直接相连", "保护装置迅速动作，应避免危险接法。"]
    ]
  },
  {
    id: 68,
    title: "利用新能源设计并制作一种模型",
    category: "renewable",
    apparatus: "太阳能电池板、小电机、风扇叶片、导线",
    conclusion: "新能源装置可以把太阳能、风能等转化为电能，再驱动模型工作。",
    keyPoint: "调节光照或风速，观察模型输出变化。",
    scenarios: [
      ["weak", "弱光", "太阳能板受弱光照射", "电机转速较慢。"],
      ["strong", "强光", "增强光照或调整角度", "输出电流增大，电机转速加快。"],
      ["store", "储能", "接入储能模块", "光照变化时模型仍能短时间运行。"]
    ]
  }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function normalizeSpec(spec) {
  return {
    ...spec,
    scenarios: spec.scenarios.map(([key, label, action, note], index) => ({
      key,
      label,
      action,
      note,
      value: index
    }))
  };
}

function pageFor(specInput) {
  const spec = normalizeSpec(specInput);
  const specJson = JSON.stringify(spec);
  const title = `初中物理实验${spec.id}｜${spec.title}`;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root{
      --bg:#1a1a1a;
      --ink:#fff;
      --card-bg:rgba(255,255,255,.08);
      --panel-bg:rgba(15,15,15,.58);
      --line:rgba(255,255,255,.12);
      --accent:#3ddc97;
      --warn:#ffb74d;
      --dockShadow:0 14px 36px rgba(0,0,0,.42);
    }
    *{ box-sizing:border-box; }
    html,body{ min-height:100%; }
    body{
      margin:0;
      padding:10px;
      background:var(--bg);
      color:var(--ink);
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,Helvetica,sans-serif;
      display:flex;
      flex-direction:column;
      align-items:center;
      letter-spacing:0;
    }
    #app{ width:100%; max-width:980px; margin:0 auto 34px; }
    button{ font:inherit; touch-action:manipulation; }
    button.main,button.sub{
      border:none;
      border-radius:8px;
      padding:8px 12px;
      color:#fff;
      cursor:pointer;
      transition:background .2s,transform .05s,opacity .2s;
      user-select:none;
      -webkit-tap-highlight-color:transparent;
      font-size:13px;
      background:#444;
    }
    button.main{ background:#2e7d32; }
    button.main:hover,button.sub:hover{ background:#5a5a5a; }
    button.main:active,button.sub:active{ transform:scale(.98); }
    button:disabled{ opacity:.5; cursor:not-allowed; }
    #spectrum{
      position:relative;
      width:100%;
      max-width:980px;
      height:40px;
      border-radius:10px;
      overflow:hidden;
      box-shadow:0 0 15px rgba(255,255,255,.15);
      margin:0 0 12px;
      background:#000;
      flex-shrink:0;
    }
    #spectrum::before{
      content:"";
      position:absolute;
      inset:0;
      background:linear-gradient(90deg,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000);
      background-size:200% 100%;
      animation:flowRainbow 6s linear infinite;
    }
    @keyframes flowRainbow{ 0%{background-position:0 0;} 100%{background-position:-100% 0;} }
    .task-card{
      width:100%;
      max-width:980px;
      background:var(--card-bg);
      border:1px solid var(--line);
      border-radius:12px;
      padding:12px 14px;
      backdrop-filter:blur(6px);
      display:grid;
      grid-template-columns:auto 1fr auto;
      align-items:center;
      gap:10px;
    }
    .task-step{
      background:rgba(255,255,255,.16);
      border-radius:8px;
      padding:6px 10px;
      font-weight:700;
      white-space:nowrap;
    }
    .task-text{ min-width:0; line-height:1.55; }
    #taskHint{ color:#ffd54f; font-size:12px; opacity:.95; margin-top:2px; }
    .progress-dots{ display:flex; gap:6px; align-items:center; }
    .dot{
      width:10px;
      height:10px;
      border-radius:50%;
      background:rgba(255,255,255,.26);
      outline:2px solid rgba(255,255,255,.12);
    }
    .dot.active{ background:var(--warn); }
    .dot.done{ background:var(--accent); outline-color:rgba(61,220,151,.45); }
    .dot.warn{ background:#ff4d4f; outline-color:rgba(255,77,79,.58); box-shadow:0 0 10px rgba(255,77,79,.62); }
    #stage{
      width:100%;
      max-width:980px;
      height:66vh;
      max-height:660px;
      min-height:500px;
      margin-top:10px;
      border-radius:12px;
      position:relative;
      overflow:hidden;
      border:1px solid rgba(255,255,255,.08);
      background:#0b0f14;
      box-shadow:0 10px 26px rgba(0,0,0,.35);
      touch-action:pan-y pinch-zoom;
      background-image:
        radial-gradient(circle at 76% 25%, rgba(255,255,255,.06), transparent 42%),
        radial-gradient(circle at 22% 78%, rgba(0,255,255,.05), transparent 46%);
    }
    .lab-area{
      position:absolute;
      inset:54px 10px 10px;
      border-radius:10px;
      border:1px solid rgba(255,255,255,.08);
      background:rgba(5,10,16,.82);
      overflow:hidden;
    }
    #labCanvas{ width:100%; height:100%; display:block; touch-action:pan-y pinch-zoom; cursor:crosshair; }
    .hud{
      position:absolute;
      left:10px;
      top:10px;
      z-index:20;
      display:flex;
      gap:8px;
      flex-wrap:wrap;
      align-items:center;
      background:rgba(0,0,0,.48);
      border:1px solid var(--line);
      border-radius:10px;
      padding:7px 10px;
      font-size:12px;
    }
    .tag{
      border:1px solid rgba(255,255,255,.26);
      border-radius:999px;
      padding:2px 8px;
      font-weight:700;
      color:#dce9ff;
      background:rgba(255,255,255,.06);
    }
    .hint-lamp{
      position:absolute;
      left:10px;
      top:56px;
      z-index:22;
      width:34px;
      height:34px;
      border-radius:8px;
      display:grid;
      place-items:center;
      background:rgba(255,255,255,.08);
      border:1px solid rgba(255,255,255,.2);
      color:#ffd54f;
      font-size:16px;
      cursor:pointer;
      padding:0;
    }
    .hint-lamp.flash{ animation:lampFlash .6s ease; }
    @keyframes lampFlash{ 50%{ box-shadow:0 0 22px rgba(255,77,79,.86); border-color:#ff4d4f; color:#ffb0b0; } }
    .hint-pop{
      position:absolute;
      left:10px;
      top:96px;
      z-index:23;
      width:min(340px, calc(100% - 24px));
      display:none;
      padding:10px 12px;
      border:1px solid rgba(255,209,102,.36);
      border-radius:10px;
      background:rgba(16,18,20,.9);
      color:#f4efe2;
      font-size:13px;
      line-height:1.55;
    }
    .hint-pop.open{ display:block; }
    .dock{
      position:absolute;
      width:min(94%, 380px);
      border-radius:12px;
      border:1px solid var(--line);
      background:var(--panel-bg);
      backdrop-filter:blur(6px);
      box-shadow:var(--dockShadow);
      overflow:hidden;
      touch-action:none;
      z-index:30;
    }
    .dock-header{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:8px;
      padding:8px 10px;
      border-bottom:1px solid rgba(255,255,255,.1);
      background:rgba(255,255,255,.04);
      cursor:grab;
      user-select:none;
      -webkit-user-select:none;
      touch-action:none;
    }
    .dockTitle{ display:flex; align-items:center; gap:6px; font-size:13px; font-weight:700; color:#e7f0ff; white-space:nowrap; }
    .iconBtn{
      border:1px solid rgba(255,255,255,.2);
      background:rgba(255,255,255,.08);
      color:#e8f1ff;
      border-radius:7px;
      padding:4px 8px;
      font-size:12px;
      cursor:pointer;
    }
    .dock-body{ padding:10px; max-height:360px; overflow:auto; -webkit-overflow-scrolling:touch; }
    .collapsed .dock-body{ display:none; }
    .read-grid{ display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px; }
    .readout{ border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.06); border-radius:8px; padding:8px; min-height:56px; }
    .readout b{ display:block; color:#cfe4ff; font-size:12px; margin-bottom:5px; }
    .readout span{ color:#fff; font-size:13px; line-height:1.4; }
    .controls{ display:flex; flex-wrap:wrap; gap:8px; margin:8px 0; }
    .controls button{ flex:1 1 98px; }
    .analysis{ margin-top:9px; border:1px solid rgba(91,188,255,.32); background:rgba(91,188,255,.08); color:#d9ecff; border-radius:8px; padding:8px 10px; font-size:13px; line-height:1.55; }
    .analysis.ok{ border-color:rgba(61,220,151,.55); background:rgba(61,220,151,.12); color:#e7fff3; }
    .badge{ display:inline-grid; place-items:center; min-width:18px; height:18px; padding:0 5px; border-radius:999px; background:#ef476f; color:#fff; font-size:12px; transform:scale(0); opacity:0; transition:.15s; }
    .badge.show{ transform:scale(1); opacity:1; animation:badgePulse .9s ease-in-out infinite; }
    @keyframes badgePulse{ 50%{transform:scale(1.14);} }
    table.record{ width:100%; border-collapse:collapse; font-size:12px; color:#e8f1ff; }
    table.record th,table.record td{ border:1px solid rgba(255,255,255,.1); padding:6px; vertical-align:top; line-height:1.45; text-align:left; }
    table.record th{ background:rgba(255,255,255,.08); color:#cfe4ff; }
    .empty{ margin:8px 2px; color:#aebbd0; font-size:12px; }
    .chartWrap{ height:220px; margin-top:10px; border:1px solid rgba(255,255,255,.12); border-radius:8px; overflow:hidden; background:rgba(0,0,0,.18); }
    #recordChart{ width:100%; height:100%; display:block; }
    .toolbar{ width:100%; max-width:980px; display:flex; gap:8px; flex-wrap:wrap; margin:10px 0 0; }
    .toast{ position:absolute; left:50%; bottom:24px; transform:translateX(-50%) translateY(18px); opacity:0; pointer-events:none; padding:10px 16px; border-radius:999px; background:rgba(0,0,0,.72); border:1px solid rgba(255,255,255,.12); color:#fff; font-weight:800; transition:.18s ease; z-index:80; }
    .toast.show{ opacity:1; transform:translateX(-50%) translateY(0); }
    .checkmark{ position:absolute; left:50%; top:50%; width:64px; height:64px; border-radius:50%; transform:translate(-50%,-50%) scale(.7); opacity:0; pointer-events:none; background:rgba(37,194,119,.96); box-shadow:0 0 24px rgba(37,194,119,.55); z-index:82; transition:.18s ease; }
    .checkmark::before{ content:""; position:absolute; left:19px; top:16px; width:24px; height:13px; border-left:5px solid #fff; border-bottom:5px solid #fff; transform:rotate(-45deg); }
    .checkmark.active{ opacity:1; transform:translate(-50%,-50%) scale(1); }
    .modal-mask{ position:absolute; inset:0; display:none; align-items:center; justify-content:center; background:rgba(0,0,0,.58); z-index:90; padding:16px; }
    .modal{ width:min(390px, 92vw); padding:18px 16px; border-radius:10px; border:1px solid rgba(255,255,255,.15); background:#101317; text-align:center; box-shadow:0 18px 44px rgba(0,0,0,.42); }
    .modal h3{ margin:4px 0 8px; font-size:21px; }
    .modal p{ margin:0; color:#cdd7e0; line-height:1.55; }
    .modal .ok{ margin-top:14px; border:none; border-radius:8px; padding:8px 18px; background:var(--accent); color:#07170f; font-weight:800; cursor:pointer; }
    .demo-cursor{ position:absolute; left:0; top:0; width:20px; height:20px; border-radius:50%; border:2px solid #fff; background:rgba(91,188,255,.8); box-shadow:0 0 14px rgba(91,188,255,.8); opacity:0; z-index:72; pointer-events:none; transition:opacity .15s; }
    .demo-cursor.click{ animation:cursorClick .28s ease; }
    @keyframes cursorClick{ 50%{ transform:scale(1.8); opacity:.55; } }
    .explanation{ width:100%; max-width:980px; margin:14px 0 22px; color:#e8f4ff; line-height:1.66; font-size:15px; }
    .explanation h2{ margin:0 0 8px; color:#9bd3ff; font-size:20px; }
    .explanation ul{ margin:0; padding-left:22px; }
    @media (max-width:720px){
      body{ padding:8px; }
      #app,#spectrum,.task-card,#stage,.toolbar,.explanation{ max-width:100%; }
      .task-card{ grid-template-columns:1fr; gap:7px; }
      .task-step{ width:fit-content; }
      .progress-dots{ justify-content:flex-start; }
      #stage{ height:78vh; min-height:680px; }
      .lab-area{ inset:96px 8px 10px; }
      .hud{ max-width:calc(100% - 20px); }
      .hint-lamp{ top:56px; }
      .hint-pop{ top:96px; }
      .dock{ width:calc(100% - 24px); }
      .toolbar button{ flex:1 1 132px; }
    }
  </style>
</head>
<body>
  <div id="app">
    <div id="spectrum"></div>
    <section class="task-card" id="taskCard">
      <div class="task-step" id="taskStep">步骤 1 / 4</div>
      <div class="task-text">
        <div id="taskText"></div>
        <div id="taskHint"></div>
      </div>
      <div class="progress-dots" id="dots"></div>
    </section>
    <main id="stage" aria-label="${escapeHtml(spec.title)}实验台">
      <div class="hud">
        <span class="tag" id="modeTag">模式：引导</span>
        <span class="tag" id="statusTag">状态：待操作</span>
      </div>
      <button class="hint-lamp" id="hintLamp" type="button" aria-label="查看提示">💡</button>
      <div class="hint-pop" id="hintPop"></div>
      <div class="lab-area" id="labArea"><canvas id="labCanvas"></canvas></div>
      <section class="dock drawer control collapsed" id="controlDock" aria-label="实验面板">
        <div class="dock-header" data-drag-handle>
          <span class="dockTitle">实验面板</span>
          <button class="iconBtn mini" id="controlToggleBtn" type="button">展开</button>
        </div>
        <div class="dock-body">
          <div class="read-grid">
            <div class="readout"><b>器材</b><span id="apparatusReadout"></span></div>
            <div class="readout"><b>当前状态</b><span id="scenarioReadout"></span></div>
            <div class="readout"><b>现象</b><span id="phenomenonReadout"></span></div>
            <div class="readout"><b>结论</b><span id="summaryReadout">未分析</span></div>
          </div>
          <div class="controls">
            <button class="sub" id="operateBtn" type="button">改变条件</button>
            <button class="main" id="recordBtn" type="button">记录观察</button>
            <button class="sub" id="analyzeBtn" type="button">分析结论</button>
          </div>
          <div class="analysis" id="analysisText">按步骤操作并记录三组关键现象，再归纳结论。</div>
        </div>
      </section>
      <section class="dock drawer data collapsed" id="dataDock" aria-label="数据面板">
        <div class="dock-header" data-drag-handle>
          <span class="dockTitle">数据面板 <span class="badge" id="dataNotice">0</span></span>
          <button class="iconBtn mini" id="dataToggleBtn" type="button">展开</button>
        </div>
        <div class="dock-body">
          <table class="record" id="recordTable">
            <thead><tr><th>类别</th><th>操作</th><th>现象</th></tr></thead>
            <tbody></tbody>
          </table>
          <div class="empty" id="emptyRecords">还没有记录。按步骤操作后点击“记录观察”。</div>
          <div class="chartWrap"><canvas id="recordChart"></canvas></div>
        </div>
      </section>
      <div class="toast" id="toast">提示</div>
      <div class="checkmark" id="checkmark"></div>
      <div class="demo-cursor" id="demoCursor"></div>
      <div class="modal-mask" id="doneMask">
        <div class="modal">
          <h3>实验完成</h3>
          <p>你已经完成“${escapeHtml(spec.title)}”：${escapeHtml(spec.conclusion)}</p>
          <button class="ok" id="okBtn" type="button">OK</button>
        </div>
      </div>
    </main>
    <div class="toolbar">
      <button class="sub" id="resetBtn" type="button">步骤重置</button>
      <button class="sub" id="autoDemoBtn" type="button">自动演示</button>
      <button class="sub" id="freeBtn" type="button">自由模式</button>
    </div>
    <section class="explanation">
      <h2>实验名：${escapeHtml(spec.title)}</h2>
      <ul>
        <li><b>关键操作与现象：</b>${escapeHtml(spec.keyPoint)}</li>
        <li><b>实验结论：</b>${escapeHtml(spec.conclusion)}</li>
      </ul>
    </section>
  </div>
  <script>
    (() => {
      "use strict";
      const SPEC = ${specJson};
      const $ = (selector) => document.querySelector(selector);
      const stage = $("#stage");
      const labArea = $("#labArea");
      const canvas = $("#labCanvas");
      const ctx = canvas.getContext("2d");
      const chartCanvas = $("#recordChart");
      const chartCtx = chartCanvas.getContext("2d");
      const taskStep = $("#taskStep");
      const taskText = $("#taskText");
      const taskHint = $("#taskHint");
      const dots = $("#dots");
      const modeTag = $("#modeTag");
      const statusTag = $("#statusTag");
      const hintLamp = $("#hintLamp");
      const hintPop = $("#hintPop");
      const controlDock = $("#controlDock");
      const dataDock = $("#dataDock");
      const controlToggleBtn = $("#controlToggleBtn");
      const dataToggleBtn = $("#dataToggleBtn");
      const apparatusReadout = $("#apparatusReadout");
      const scenarioReadout = $("#scenarioReadout");
      const phenomenonReadout = $("#phenomenonReadout");
      const summaryReadout = $("#summaryReadout");
      const operateBtn = $("#operateBtn");
      const recordBtn = $("#recordBtn");
      const analyzeBtn = $("#analyzeBtn");
      const analysisText = $("#analysisText");
      const recordBody = $("#recordTable tbody");
      const emptyRecords = $("#emptyRecords");
      const dataNotice = $("#dataNotice");
      const resetBtn = $("#resetBtn");
      const autoDemoBtn = $("#autoDemoBtn");
      const freeBtn = $("#freeBtn");
      const toast = $("#toast");
      const checkmark = $("#checkmark");
      const doneMask = $("#doneMask");
      const okBtn = $("#okBtn");
      const demoCursor = $("#demoCursor");

      const state = {
        currentTask: 0,
        completed: false,
        freeMode: false,
        autoPlaying: false,
        autoCancel: false,
        draggingId: null,
        drawerDrag: null,
        stepWarning: false,
        successCooldown: false,
        timers: new Set(),
        scenarioIndex: 0,
        actionCount: 0,
        records: [],
        unseenRecords: 0,
        lastObservation: null,
        analysisDone: false,
        width: 0,
        height: 0,
        stageWidth: 0,
        stageHeight: 0,
        phase: 0
      };

      const tasks = [
        {
          text: "完成第一种条件下的操作，并记录观察现象。",
          hint: SPEC.scenarios[0].action,
          detail: "在实验台中拖动或点击器材，也可以用“改变条件”按钮切换到当前步骤要求的状态。",
          expected: SPEC.scenarios[0].key,
          check: () => hasRecord(SPEC.scenarios[0].key)
        },
        {
          text: "改变实验条件，记录第二组现象并进行比较。",
          hint: SPEC.scenarios[1].action,
          detail: "对比两组现象，注意哪个变量发生改变，哪个现象随之变化。",
          expected: SPEC.scenarios[1].key,
          check: () => hasRecord(SPEC.scenarios[1].key)
        },
        {
          text: "完成关键验证操作，记录第三组证据。",
          hint: SPEC.scenarios[2].action,
          detail: "第三组证据用于排除偶然现象，帮助归纳最终规律。",
          expected: SPEC.scenarios[2].key,
          check: () => hasRecord(SPEC.scenarios[2].key)
        },
        {
          text: "点击“分析结论”，归纳实验规律。",
          hint: "需要三组观察记录都已完成。",
          detail: SPEC.conclusion,
          check: () => state.analysisDone
        }
      ];

      function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
      function lerp(a, b, t) { return a + (b - a) * t; }
      function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
      function schedule(fn, ms) {
        const id = setTimeout(() => { state.timers.delete(id); fn(); }, ms);
        state.timers.add(id);
        return id;
      }
      function clearAllTimers() {
        for (const id of state.timers) clearTimeout(id);
        state.timers.clear();
      }
      function currentScenario() { return SPEC.scenarios[state.scenarioIndex]; }
      function hasRecord(key) { return state.records.some(record => record.key === key); }
      function allEvidenceReady() { return SPEC.scenarios.every(s => hasRecord(s.key)); }

      function initDots() {
        dots.innerHTML = "";
        tasks.forEach(() => {
          const dot = document.createElement("span");
          dot.className = "dot";
          dots.appendChild(dot);
        });
      }
      function updateDots() {
        [...dots.children].forEach((dot, index) => {
          dot.classList.toggle("done", state.completed || index < state.currentTask);
          dot.classList.toggle("active", !state.completed && index === state.currentTask && !state.stepWarning);
          dot.classList.toggle("warn", !state.completed && index === state.currentTask && state.stepWarning);
        });
      }
      function setStepUI(index) {
        state.currentTask = clamp(index, 0, tasks.length - 1);
        state.stepWarning = false;
        const task = tasks[state.currentTask];
        taskStep.textContent = "步骤 " + (state.currentTask + 1) + " / " + tasks.length;
        taskText.textContent = task.text;
        taskHint.textContent = task.hint;
        hintPop.textContent = task.detail;
        updateDots();
        updateStatus();
        draw();
      }
      function updateStatus(text) {
        if (text) statusTag.textContent = "状态：" + text;
        else if (state.completed) statusTag.textContent = "状态：已完成";
        else if (state.autoPlaying) statusTag.textContent = "状态：自动演示";
        else if (state.lastObservation) statusTag.textContent = "状态：" + state.lastObservation.label;
        else statusTag.textContent = "状态：待操作";
      }
      function setModeLabel() {
        modeTag.textContent = state.autoPlaying ? "模式：自动演示" : (state.freeMode ? "模式：自由" : "模式：引导");
      }
      function showToast(message) {
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => toast.classList.remove("show"), 1500);
      }
      function showCheck() {
        checkmark.classList.add("active");
        clearTimeout(showCheck.timer);
        showCheck.timer = setTimeout(() => checkmark.classList.remove("active"), 520);
      }
      function warnCurrentStep(message) {
        state.stepWarning = true;
        updateDots();
        hintLamp.classList.remove("flash");
        void hintLamp.offsetWidth;
        hintLamp.classList.add("flash");
        showToast(message);
        schedule(() => { state.stepWarning = false; updateDots(); }, 1200);
      }
      function setScenario(index, markAction = true) {
        state.scenarioIndex = clamp(index, 0, SPEC.scenarios.length - 1);
        if (markAction) state.actionCount += 1;
        state.lastObservation = { ...currentScenario(), category: currentScenario().label };
        updateReadouts();
        updateStatus(currentScenario().label);
        draw();
      }
      function cycleScenario(markAction = true) {
        const next = (state.scenarioIndex + 1) % SPEC.scenarios.length;
        setScenario(next, markAction);
      }
      function updateReadouts() {
        const s = currentScenario();
        apparatusReadout.textContent = SPEC.apparatus;
        scenarioReadout.textContent = s.label;
        phenomenonReadout.textContent = s.note;
        summaryReadout.textContent = state.analysisDone ? "结论已归纳" : "未分析";
      }
      function passStepIfReady({ quiet = false } = {}) {
        if (state.freeMode || state.completed || state.successCooldown) return false;
        if (!tasks[state.currentTask].check()) {
          if (!quiet) warnCurrentStep("当前步骤的证据还不完整。");
          return false;
        }
        state.successCooldown = true;
        schedule(() => { state.successCooldown = false; }, 360);
        showCheck();
        if (state.currentTask >= tasks.length - 1) {
          state.completed = true;
          delete controlDock.dataset.moved;
          delete dataDock.dataset.moved;
          setDrawerCollapsed(controlDock, true);
          setDrawerCollapsed(dataDock, false);
          doneMask.style.display = "flex";
          updateStatus();
          updateDots();
        } else {
          setStepUI(state.currentTask + 1);
        }
        return true;
      }
      function recordLastObservation({ auto = false } = {}) {
        if (state.actionCount <= 0 || !state.lastObservation) {
          warnCurrentStep("请先操作实验器材，再记录观察。");
          return false;
        }
        const obs = state.lastObservation;
        const task = tasks[state.currentTask];
        if (!state.freeMode && task.expected && obs.key !== task.expected) {
          warnCurrentStep("当前步骤需要记录：“" + task.hint + "”。");
          return false;
        }
        if (!state.records.some(record => record.key === obs.key)) {
          state.records.push({ ...obs, time: Date.now() });
          if (dataDock.classList.contains("collapsed")) {
            state.unseenRecords += 1;
            updateBadge();
          }
          renderRecords();
          showToast("已记录观察");
        } else if (!auto) {
          showToast("这组现象已经记录过");
        }
        passStepIfReady({ quiet: true });
        return true;
      }
      function analyzeConclusion() {
        if (!allEvidenceReady()) {
          warnCurrentStep("请先补齐三组观察记录。");
          return false;
        }
        state.analysisDone = true;
        analysisText.classList.add("ok");
        analysisText.textContent = "结论成立：" + SPEC.conclusion;
        updateReadouts();
        showToast("已归纳实验结论");
        passStepIfReady({ quiet: true });
        return true;
      }
      function renderRecords() {
        recordBody.innerHTML = "";
        state.records.forEach(record => {
          const row = document.createElement("tr");
          row.innerHTML = "<td>" + record.label + "</td><td>" + record.action + "</td><td>" + record.note + "</td>";
          recordBody.appendChild(row);
        });
        emptyRecords.style.display = state.records.length ? "none" : "block";
        drawChart();
      }
      function updateBadge() {
        dataNotice.textContent = String(state.unseenRecords);
        dataNotice.classList.toggle("show", state.unseenRecords > 0 && dataDock.classList.contains("collapsed"));
      }
      function drawChart() {
        const dpr = window.devicePixelRatio || 1;
        const w = chartCanvas.clientWidth || 320;
        const h = chartCanvas.clientHeight || 220;
        chartCanvas.width = Math.round(w * dpr);
        chartCanvas.height = Math.round(h * dpr);
        chartCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        chartCtx.clearRect(0, 0, w, h);
        chartCtx.fillStyle = "rgba(0,0,0,.18)";
        chartCtx.fillRect(0, 0, w, h);
        SPEC.scenarios.forEach((s, i) => {
          const y = 38 + i * 56;
          const ready = hasRecord(s.key);
          chartCtx.fillStyle = ready ? ["#ffd54f", "#3ddc97", "#5bbcff"][i] : "rgba(255,255,255,.38)";
          chartCtx.font = "700 13px Arial";
          chartCtx.fillText(s.label, 18, y);
          chartCtx.strokeStyle = chartCtx.fillStyle;
          chartCtx.lineWidth = 3;
          chartCtx.beginPath();
          chartCtx.moveTo(112, y - 4);
          chartCtx.lineTo(210, y - 4 - (i - 1) * 16);
          chartCtx.stroke();
          chartCtx.fillStyle = "rgba(235,245,255,.78)";
          chartCtx.font = "12px Arial";
          chartCtx.fillText(ready ? "已记录" : "待记录", 226, y);
        });
      }
      function resizeCanvas() {
        const stageRect = stage.getBoundingClientRect();
        const rect = labArea.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        state.width = rect.width;
        state.height = rect.height;
        state.stageWidth = stageRect.width;
        state.stageHeight = stageRect.height;
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        fitDrawers();
        draw();
        drawChart();
      }
      function setDrawerCollapsed(drawer, collapsed) {
        drawer.classList.toggle("collapsed", collapsed);
        const btn = drawer === controlDock ? controlToggleBtn : dataToggleBtn;
        btn.textContent = collapsed ? "展开" : "收起";
        if (drawer === dataDock && !collapsed) {
          state.unseenRecords = 0;
          updateBadge();
        }
        fitDrawers();
      }
      function fitDrawers() {
        const areaWidth = state.stageWidth || state.width;
        const areaHeight = state.stageHeight || state.height;
        if (!areaWidth || !areaHeight) return;
        [controlDock, dataDock].forEach((drawer, index) => {
          const isMobile = areaWidth <= 720;
          const collapsed = drawer.classList.contains("collapsed");
          let targetWidth = 300;
          if (isMobile && collapsed) targetWidth = Math.max(132, Math.min(152, Math.floor((areaWidth - 90) / 2)));
          else if (isMobile) targetWidth = areaWidth - 24;
          drawer.style.width = targetWidth + "px";
          const rect = drawer.getBoundingClientRect();
          let left = drawer.offsetLeft;
          let top = drawer.offsetTop;
          if (!drawer.dataset.moved) {
            if (isMobile && collapsed) {
              top = 52;
              left = index === 0 ? areaWidth - (targetWidth * 2) - 18 : areaWidth - targetWidth - 8;
            } else if (isMobile) {
              left = 12;
              if (index === 0) top = 104;
              else if (!controlDock.classList.contains("collapsed")) top = controlDock.offsetTop + controlDock.offsetHeight + 8;
              else top = 104;
            } else {
              const bothCollapsed = controlDock.classList.contains("collapsed") && dataDock.classList.contains("collapsed");
              if (bothCollapsed && collapsed) {
                top = 10;
                left = index === 0 ? Math.max(12, areaWidth - rect.width - 12) : Math.max(12, areaWidth - rect.width * 2 - 22);
              } else {
                left = Math.max(12, areaWidth - rect.width - 12);
                top = index === 0 ? 10 : 94;
              }
            }
          }
          left = clamp(left, 8, Math.max(8, areaWidth - rect.width - 8));
          top = clamp(top, 8, Math.max(8, areaHeight - 48));
          drawer.style.left = left + "px";
          drawer.style.right = "auto";
          drawer.style.top = top + "px";
        });
      }
      function stagePoint(event) {
        const rect = canvas.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
      }
      function bindDrawer(drawer) {
        const header = drawer.querySelector("[data-drag-handle]");
        header.addEventListener("pointerdown", event => {
          if (event.target.tagName === "BUTTON") return;
          const rect = drawer.getBoundingClientRect();
          const parent = stage.getBoundingClientRect();
          drawer.dataset.moved = "true";
          state.drawerDrag = { drawer, dx: event.clientX - rect.left, dy: event.clientY - rect.top, parentLeft: parent.left, parentTop: parent.top };
          header.setPointerCapture(event.pointerId);
          event.preventDefault();
        });
        header.addEventListener("pointermove", event => {
          if (!state.drawerDrag || state.drawerDrag.drawer !== drawer) return;
          const drag = state.drawerDrag;
          const width = drawer.offsetWidth;
          const areaWidth = state.stageWidth || state.width;
          const areaHeight = state.stageHeight || state.height;
          drawer.style.left = clamp(event.clientX - drag.parentLeft - drag.dx, 6, Math.max(6, areaWidth - width - 6)) + "px";
          drawer.style.top = clamp(event.clientY - drag.parentTop - drag.dy, 6, Math.max(6, areaHeight - 48)) + "px";
          drawer.style.right = "auto";
          event.preventDefault();
        });
        header.addEventListener("pointerup", event => {
          try { header.releasePointerCapture(event.pointerId); } catch (error) { console.warn("释放抽屉指针捕获失败", error); }
          state.drawerDrag = null;
        });
        header.addEventListener("pointercancel", () => { state.drawerDrag = null; });
      }
      function drawBackground(w, h) {
        ctx.strokeStyle = "rgba(255,255,255,.045)";
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }
      function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      }
      function draw() {
        const w = state.width;
        const h = state.height;
        if (!w || !h) return;
        ctx.clearRect(0, 0, w, h);
        drawBackground(w, h);
        const cx = w * 0.5;
        const cy = h * 0.52;
        const s = currentScenario();
        drawScene(w, h, cx, cy, s);
      }
      function drawScene(w, h, cx, cy, s) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.fillStyle = "#e8f5ff";
        ctx.font = "700 20px Arial";
        ctx.fillText(SPEC.title + "实验台", cx, 34);
        ctx.font = "13px Arial";
        ctx.fillStyle = "rgba(232,245,255,.72)";
        ctx.fillText(SPEC.keyPoint, cx, 58);
        const type = SPEC.category;
        const baseW = Math.min(w - 120, 700);
        const baseH = Math.min(h - 150, 340);
        const x = cx - baseW / 2;
        const y = cy - baseH / 2 + 18;
        if (["mirror","lens","camera","eye","prism","rgb"].includes(type)) drawOptics(type, x, y, baseW, baseH, s);
        else if (["static","magnet","wiremag","solenoid","motorforce","motor","induction","generator"].includes(type)) drawMagnetism(type, x, y, baseW, baseH, s);
        else if (["ammeter","voltmeter","seriesparallel","resistance","circuitlaw","ohm","joulelaw","safety"].includes(type)) drawCircuit(type, x, y, baseW, baseH, s);
        else drawEnergy(type, x, y, baseW, baseH, s);
        ctx.fillStyle = "#ffd54f";
        ctx.font = "700 15px Arial";
        ctx.fillText(s.label + "：" + s.action, cx, y + baseH + 28);
        ctx.fillStyle = "#dcecff";
        ctx.font = "13px Arial";
        wrapText(s.note, cx, y + baseH + 52, Math.min(baseW, 720), 18);
        ctx.restore();
      }
      function drawOptics(type, x, y, w, h, s) {
        ctx.strokeStyle = "rgba(160,220,255,.65)";
        ctx.lineWidth = 2;
        roundRect(x, y, w, h, 10);
        ctx.stroke();
        const midY = y + h * .55;
        if (type === "mirror") {
          const mirrorX = x + w * .5;
          ctx.strokeStyle = "#9bd3ff";
          ctx.lineWidth = 5;
          ctx.beginPath(); ctx.moveTo(mirrorX, y + 35); ctx.lineTo(mirrorX, y + h - 35); ctx.stroke();
          const d = s.key === "far" ? 150 : 90;
          drawCandle(mirrorX - d, midY, false);
          drawCandle(mirrorX + d, midY, true);
          ctx.setLineDash([6,6]); ctx.strokeStyle = "rgba(255,255,255,.4)";
          ctx.beginPath(); ctx.moveTo(mirrorX - d, midY); ctx.lineTo(mirrorX + d, midY); ctx.stroke(); ctx.setLineDash([]);
        } else if (type === "lens" || type === "camera" || type === "eye") {
          const lensX = x + w * .5;
          drawLens(lensX, midY, h * .52);
          const objX = x + (s.key === "inside" ? w * .39 : s.key === "mid" ? w * .25 : w * .15);
          drawCandle(objX, midY, false);
          const imgX = x + (s.key === "inside" ? w * .72 : s.key === "mid" ? w * .82 : w * .68);
          drawScreen(imgX, midY, s.key === "inside");
          drawRay(objX, midY - 45, lensX, midY, imgX, s.key === "inside" ? midY - 66 : midY + (s.key === "mid" ? 76 : 38));
          if (type === "camera") drawCameraBox(x + w * .56, y + 68, w * .32, h * .42, s.key !== "blur");
          if (type === "eye") drawEye(x + w * .62, midY, s.key);
        } else if (type === "prism") {
          drawPrism(cxFrom(x,w), midY, s.key);
        } else if (type === "rgb") {
          drawRGB(x + w * .5, midY, s.key);
        }
      }
      function drawMagnetism(type, x, y, w, h, s) {
        ctx.strokeStyle = "rgba(160,220,255,.65)";
        ctx.lineWidth = 2;
        roundRect(x, y, w, h, 10);
        ctx.stroke();
        const cx = x + w * .5, cy = y + h * .54;
        if (type === "static") {
          drawRod(cx - 120, cy - 40, s.key !== "discharge");
          drawPaperBits(cx + 90, cy + 30, s.key !== "discharge");
          drawElectroscope(cx + 170, cy, s.key === "electroscope");
        } else if (type === "magnet" || type === "wiremag" || type === "solenoid") {
          drawBarMagnet(cx, cy, type === "solenoid");
          drawFieldLines(cx, cy, s.key === "reverse");
          drawCompass(cx + 210, cy - 70, s.key === "reverse");
          if (type === "wiremag") drawWire(cx - 210, cy, s.key !== "off", s.key === "reverse");
          if (type === "solenoid") drawSolenoid(cx - 200, cy + 90, s.key === "reverse");
        } else {
          drawMachine(type, cx, cy, s.key);
        }
      }
      function drawCircuit(type, x, y, w, h, s) {
        ctx.strokeStyle = "rgba(160,220,255,.65)";
        ctx.lineWidth = 2;
        roundRect(x, y, w, h, 10);
        ctx.stroke();
        const cx = x + w * .5, cy = y + h * .52;
        ctx.strokeStyle = "#dcecff";
        ctx.lineWidth = 4;
        roundRect(cx - 230, cy - 100, 460, 200, 8);
        ctx.stroke();
        drawBattery(cx - 190, cy + 100);
        drawSwitch(cx - 40, cy - 100, s.key !== "wrong" && s.key !== "off");
        drawBulb(cx + 170, cy - 100, s.key !== "wrong" && s.key !== "off");
        if (["ammeter","ohm","resistance","circuitlaw"].includes(type)) drawMeter(cx, cy + 100, "A", s.key === "wrong");
        if (["voltmeter","resistance","circuitlaw"].includes(type)) drawMeter(cx + 165, cy, "V", s.key === "wrong");
        if (type === "seriesparallel" || type === "circuitlaw") drawBranch(cx, cy, s.key !== "series");
        if (type === "safety") drawSafety(cx, cy, s.key);
        if (type === "joulelaw") drawHeater(cx, cy, s.key);
      }
      function drawEnergy(type, x, y, w, h, s) {
        ctx.strokeStyle = "rgba(160,220,255,.65)";
        ctx.lineWidth = 2;
        roundRect(x, y, w, h, 10);
        ctx.stroke();
        const cx = x + w * .5, cy = y + h * .54;
        if (type === "pendulum") drawPendulum(cx, cy, s.key);
        else if (type === "thermal" || type === "engine") drawEngine(cx, cy, s.key);
        else if (type === "frictionheat") drawFriction(cx, cy, s.key);
        else if (type === "efficiency") drawPulley(cx, cy, s.key);
        else if (type === "heatcapacity") drawBeakers(cx, cy, s.key);
        else if (type === "electricmotor") drawMachine("motor", cx, cy, s.key);
        else if (type === "joule") drawHeater(cx, cy, s.key);
        else if (type === "renewable") drawRenewable(cx, cy, s.key);
      }
      function cxFrom(x,w){ return x + w * .5; }
      function drawCandle(x, y, ghost) {
        ctx.globalAlpha = ghost ? .42 : 1;
        ctx.fillStyle = ghost ? "#9bd3ff" : "#ff7043";
        ctx.fillRect(x - 11, y - 60, 22, 60);
        ctx.fillStyle = "#ffd54f";
        ctx.beginPath(); ctx.arc(x, y - 70, 10, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
      function drawLens(x, y, h) {
        ctx.strokeStyle = "#9bd3ff"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.ellipse(x, y, 22, h / 2, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x - 170, y); ctx.lineTo(x + 170, y); ctx.stroke();
      }
      function drawScreen(x, y, virtual) {
        ctx.strokeStyle = virtual ? "rgba(255,255,255,.32)" : "#e8f5ff";
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(x, y - 95); ctx.lineTo(x, y + 95); ctx.stroke();
      }
      function drawRay(x1,y1,x2,y2,x3,y3) {
        ctx.strokeStyle = "#ffd54f"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.lineTo(x3,y3); ctx.stroke();
      }
      function drawCameraBox(x,y,w,h,focused) {
        ctx.fillStyle = focused ? "rgba(61,220,151,.18)" : "rgba(255,183,77,.15)";
        roundRect(x,y,w,h,10); ctx.fill(); ctx.strokeStyle = "#dcecff"; ctx.stroke();
      }
      function drawEye(x,y,key) {
        ctx.strokeStyle = "#dcecff"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(x,y,100,58,0,0,Math.PI*2); ctx.stroke();
        ctx.fillStyle = key.includes("Fix") ? "#3ddc97" : "#ffb74d";
        ctx.beginPath(); ctx.arc(x+70,y,5,0,Math.PI*2); ctx.fill();
      }
      function drawPrism(cx, cy, key) {
        ctx.fillStyle = "rgba(155,211,255,.18)";
        ctx.strokeStyle = "#9bd3ff"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx - 70, cy + 80); ctx.lineTo(cx, cy - 80); ctx.lineTo(cx + 90, cy + 80); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx - 260, cy); ctx.lineTo(cx - 40, cy - 10); ctx.stroke();
        const colors = ["#ff4d4f","#ffb74d","#ffd54f","#3ddc97","#26e3d1","#5bbcff","#b084ff"];
        colors.forEach((c,i)=>{ ctx.strokeStyle=c; ctx.beginPath(); ctx.moveTo(cx+42,cy+8); ctx.lineTo(cx+260, cy - 70 + i*22 + (key==="angle"?18:0)); ctx.stroke(); });
      }
      function drawRGB(cx, cy, key) {
        ctx.globalAlpha = .58;
        const on = key === "rgb" ? [1,1,1] : key === "rg" ? [1,1,0] : [0,1,1];
        if (on[0]) { ctx.fillStyle = "#ff3344"; ctx.beginPath(); ctx.arc(cx-55,cy,92,0,Math.PI*2); ctx.fill(); }
        if (on[1]) { ctx.fillStyle = "#29e06f"; ctx.beginPath(); ctx.arc(cx+55,cy,92,0,Math.PI*2); ctx.fill(); }
        if (on[2]) { ctx.fillStyle = "#3388ff"; ctx.beginPath(); ctx.arc(cx,cy-72,92,0,Math.PI*2); ctx.fill(); }
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff"; ctx.font = "700 16px Arial"; ctx.fillText("色光叠加区", cx, cy + 130);
      }
      function drawRod(x,y,charged){ ctx.strokeStyle = charged ? "#ffd54f" : "#aaa"; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(x-80,y); ctx.lineTo(x+80,y-40); ctx.stroke(); }
      function drawPaperBits(x,y,active){ ctx.fillStyle = active ? "#ffd54f" : "#777"; for(let i=0;i<18;i++){ ctx.fillRect(x+Math.cos(i)*55, y+Math.sin(i*2)*35, 5, 3); } }
      function drawElectroscope(x,y,open){ ctx.strokeStyle="#dcecff"; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(x,y-70,16,0,Math.PI*2); ctx.moveTo(x,y-54); ctx.lineTo(x,y+40); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x,y+40); ctx.lineTo(x+(open?38:12),y+90); ctx.moveTo(x,y+40); ctx.lineTo(x-(open?38:12),y+90); ctx.stroke(); }
      function drawBarMagnet(cx,cy,coil){ ctx.fillStyle="#e74c3c"; roundRect(cx-130,cy-28,130,56,8); ctx.fill(); ctx.fillStyle="#3498db"; roundRect(cx,cy-28,130,56,8); ctx.fill(); ctx.fillStyle="#fff"; ctx.font="700 18px Arial"; ctx.fillText("N",cx-70,cy+7); ctx.fillText("S",cx+70,cy+7); if(coil) drawSolenoid(cx-40,cy+82,false); }
      function drawFieldLines(cx,cy,reverse){ ctx.strokeStyle="rgba(255,213,79,.55)"; ctx.lineWidth=2; for(let i=0;i<4;i++){ ctx.beginPath(); ctx.ellipse(cx,cy,170+i*28,72+i*20,0,0,Math.PI*2); ctx.stroke(); } ctx.fillStyle="#ffd54f"; ctx.fillText(reverse?"磁场方向反转":"磁场分布",cx,cy-130); }
      function drawCompass(x,y,reverse){ ctx.strokeStyle="#dcecff"; ctx.beginPath(); ctx.arc(x,y,36,0,Math.PI*2); ctx.stroke(); ctx.fillStyle="#ff4d4f"; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+(reverse?-28:28),y-8); ctx.lineTo(x,y+8); ctx.fill(); }
      function drawWire(x,y,on,reverse){ ctx.strokeStyle=on?"#ffd54f":"#777"; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(x,y-110); ctx.lineTo(x,y+110); ctx.stroke(); ctx.fillText(reverse?"I↓":"I↑",x+22,y); }
      function drawSolenoid(x,y,reverse){ ctx.strokeStyle="#ffb74d"; ctx.lineWidth=4; for(let i=0;i<7;i++){ ctx.beginPath(); ctx.ellipse(x+i*28,y,16,32,0,0,Math.PI*2); ctx.stroke(); } ctx.fillText(reverse?"S   N":"N   S",x+84,y+54); }
      function drawMachine(type,cx,cy,key){ drawBarMagnet(cx,cy,false); ctx.strokeStyle="#ffd54f"; ctx.lineWidth=5; ctx.strokeRect(cx-45,cy-90,90,180); ctx.fillStyle=key==="fast"||key==="spin"?"#3ddc97":"#ffb74d"; ctx.beginPath(); ctx.arc(cx,cy,26,0,Math.PI*2); ctx.fill(); ctx.fillStyle="#fff"; ctx.fillText(type.includes("generator")?"发电机":"电机/线圈",cx,cy+130); }
      function drawBattery(x,y){ ctx.strokeStyle="#ffd54f"; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(x-22,y-25); ctx.lineTo(x-22,y+25); ctx.moveTo(x+10,y-40); ctx.lineTo(x+10,y+40); ctx.stroke(); }
      function drawSwitch(x,y,closed){ ctx.strokeStyle="#dcecff"; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(x-42,y); ctx.lineTo(x-8,y); ctx.moveTo(x+36,y); ctx.lineTo(x+68,y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x-8,y); ctx.lineTo(x+(closed?36:24),y+(closed?0:-28)); ctx.stroke(); }
      function drawBulb(x,y,on){ ctx.strokeStyle="#dcecff"; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(x,y,28,0,Math.PI*2); ctx.stroke(); if(on){ ctx.fillStyle="rgba(255,213,79,.55)"; ctx.beginPath(); ctx.arc(x,y,38,0,Math.PI*2); ctx.fill(); } }
      function drawMeter(x,y,label,wrong){ ctx.strokeStyle=wrong?"#ff4d4f":"#5bbcff"; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(x,y,34,0,Math.PI*2); ctx.stroke(); ctx.fillStyle="#fff"; ctx.font="700 20px Arial"; ctx.fillText(label,x,y+7); }
      function drawBranch(cx,cy,parallel){ if(!parallel)return; ctx.strokeStyle="#3ddc97"; ctx.lineWidth=3; ctx.strokeRect(cx-130,cy-45,260,90); drawBulb(cx-70,cy, true); drawBulb(cx+70,cy, true); }
      function drawSafety(cx,cy,key){ ctx.fillStyle=key==="normal"?"#3ddc97":"#ff4d4f"; roundRect(cx-90,cy-48,180,96,10); ctx.fill(); ctx.fillStyle="#061018"; ctx.fillText(key==="normal"?"安全接线":"保护断开",cx,cy+5); }
      function drawHeater(cx,cy,key){ ctx.strokeStyle="#ff7043"; ctx.lineWidth=5; ctx.beginPath(); for(let i=0;i<9;i++){ ctx.lineTo(cx-120+i*30, cy + Math.sin(i)*28); } ctx.stroke(); ctx.fillStyle=key==="high"||key==="time"?"rgba(255,112,67,.45)":"rgba(255,183,77,.25)"; ctx.fillRect(cx-150,cy+42,300,72); }
      function drawPendulum(cx,cy,key){ const angle=key==="high"?-.75:key==="rise"?.55:0; const px=cx+Math.sin(angle)*150, py=cy-110+Math.cos(angle)*150; ctx.strokeStyle="#dcecff"; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(cx,cy-110); ctx.lineTo(px,py); ctx.stroke(); ctx.fillStyle="#ffd54f"; ctx.beginPath(); ctx.arc(px,py,24,0,Math.PI*2); ctx.fill(); }
      function drawEngine(cx,cy,key){ ctx.strokeStyle="#dcecff"; ctx.lineWidth=4; roundRect(cx-110,cy-100,220,170,10); ctx.stroke(); const pistonY=key==="power"?cy+28:key==="exhaust"?cy-30:cy-62; ctx.fillStyle="#9bd3ff"; ctx.fillRect(cx-92,pistonY,184,24); ctx.fillStyle=key==="power"?"rgba(255,112,67,.55)":"rgba(255,183,77,.2)"; ctx.fillRect(cx-90,cy-95,180,pistonY-cy+95); }
      function drawFriction(cx,cy,key){ ctx.fillStyle="#9bd3ff"; roundRect(cx-120,cy-35,240,70,8); ctx.fill(); ctx.fillStyle=key==="fast"||key==="more"?"#ff7043":"#ffd54f"; ctx.fillText("温度 " + (key==="slow"?"略升":key==="fast"?"升高":"明显升高"),cx,cy+80); }
      function drawPulley(cx,cy,key){ ctx.strokeStyle="#dcecff"; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(cx,cy-90,38,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx-38,cy-90); ctx.lineTo(cx-38,cy+80); ctx.lineTo(cx+80,cy+80); ctx.stroke(); ctx.fillStyle=key==="friction"?"#ff7043":"#3ddc97"; ctx.fillRect(cx-70,cy+80,64,64); }
      function drawBeakers(cx,cy,key){ const levels=key==="doubleMass"?[120,180]:[120,120]; levels.forEach((lv,i)=>{ const x=cx-110+i*220; ctx.strokeStyle="#dcecff"; ctx.strokeRect(x-50,cy-80,100,160); ctx.fillStyle="rgba(91,188,255,.45)"; ctx.fillRect(x-48,cy+80-lv,96,lv); ctx.fillStyle="#ffd54f"; ctx.fillText(i?"样品B":"样品A",x,cy+110); }); }
      function drawRenewable(cx,cy,key){ ctx.fillStyle="#1e88e5"; for(let i=0;i<4;i++){ ctx.fillRect(cx-190+i*48,cy-60,40,58); } ctx.fillStyle="#ffd54f"; ctx.beginPath(); ctx.arc(cx-220,cy-120,key==="strong"?44:28,0,Math.PI*2); ctx.fill(); drawMachine("motor",cx+120,cy,key==="strong"?"fast":"slow"); }
      function wrapText(text, x, y, maxWidth, lineHeight) {
        const chars = String(text).split("");
        let line = "";
        for (const ch of chars) {
          const test = line + ch;
          if (ctx.measureText(test).width > maxWidth && line) {
            ctx.fillText(line, x, y);
            line = ch;
            y += lineHeight;
          } else line = test;
        }
        ctx.fillText(line, x, y);
      }
      function onCanvasPointerDown(event) {
        if (state.autoPlaying) return;
        cycleScenario(true);
        event.preventDefault();
      }
      function resetScene({ keepMode = true } = {}) {
        clearAllTimers();
        state.completed = false;
        state.autoCancel = false;
        state.draggingId = null;
        state.stepWarning = false;
        state.successCooldown = false;
        state.scenarioIndex = 0;
        state.actionCount = 0;
        state.records = [];
        state.unseenRecords = 0;
        state.lastObservation = null;
        state.analysisDone = false;
        if (!keepMode) state.freeMode = false;
        doneMask.style.display = "none";
        analysisText.classList.remove("ok");
        analysisText.textContent = "按步骤操作并记录三组关键现象，再归纳结论。";
        renderRecords();
        updateBadge();
        setModeLabel();
        setStepUI(0);
        updateReadouts();
        draw();
      }
      function setFreeMode(on) {
        state.freeMode = !!on;
        freeBtn.textContent = state.freeMode ? "退出自由模式" : "自由模式";
        autoDemoBtn.disabled = state.freeMode;
        setModeLabel();
        showToast(state.freeMode ? "自由模式下可任意切换实验条件。" : "已回到引导模式。");
        draw();
      }
      function moveCursorTo(x, y, visible = true) {
        const stageRect = stage.getBoundingClientRect();
        const sceneRect = labArea.getBoundingClientRect();
        demoCursor.style.opacity = visible ? "1" : "0";
        demoCursor.style.transform = "translate(" + (sceneRect.left - stageRect.left + x - 10) + "px," + (sceneRect.top - stageRect.top + y - 10) + "px)";
      }
      function clickCursor() {
        demoCursor.classList.remove("click");
        void demoCursor.offsetWidth;
        demoCursor.classList.add("click");
      }
      async function autoRecord(expectedKey) {
        const before = state.records.length;
        const ok = recordLastObservation({ auto: true });
        await sleep(360);
        if (!ok || !hasRecord(expectedKey) || state.records.length <= before) throw new Error("AUTO_RECORD_NOT_PERSISTED:" + expectedKey);
      }
      async function runAutoDemo() {
        if (state.autoPlaying) { state.autoCancel = true; return; }
        state.autoPlaying = true;
        state.autoCancel = false;
        autoDemoBtn.textContent = "退出自动演示";
        freeBtn.disabled = true;
        setDrawerCollapsed(controlDock, false);
        setDrawerCollapsed(dataDock, false);
        setModeLabel();
        resetScene({ keepMode: false });
        state.autoPlaying = true;
        autoDemoBtn.textContent = "退出自动演示";
        setModeLabel();
        try {
          for (let i = 0; i < SPEC.scenarios.length; i += 1) {
            if (state.autoCancel) throw new Error("AUTO_CANCELLED");
            setStepUI(i);
            setScenario(i, true);
            moveCursorTo(state.width * (0.28 + i * 0.22), state.height * .52);
            clickCursor();
            await sleep(520);
            await autoRecord(SPEC.scenarios[i].key);
          }
          setStepUI(3);
          await sleep(280);
          analyzeConclusion();
        } catch (error) {
          if (String(error.message || error) !== "AUTO_CANCELLED") showToast("自动演示中断：" + (error.message || error));
          else showToast("已退出自动演示");
        } finally {
          state.autoPlaying = false;
          state.autoCancel = false;
          autoDemoBtn.textContent = "自动演示";
          freeBtn.disabled = false;
          demoCursor.style.opacity = "0";
          setModeLabel();
          updateStatus();
          draw();
        }
      }
      function initEvents() {
        canvas.addEventListener("pointerdown", onCanvasPointerDown);
        operateBtn.addEventListener("click", () => cycleScenario(true));
        recordBtn.addEventListener("click", () => recordLastObservation());
        analyzeBtn.addEventListener("click", analyzeConclusion);
        resetBtn.addEventListener("click", () => { const free = state.freeMode; resetScene(); state.freeMode = free; setFreeMode(free); showToast("已重置当前实验。"); });
        autoDemoBtn.addEventListener("click", runAutoDemo);
        freeBtn.addEventListener("click", () => setFreeMode(!state.freeMode));
        controlToggleBtn.addEventListener("click", () => setDrawerCollapsed(controlDock, !controlDock.classList.contains("collapsed")));
        dataToggleBtn.addEventListener("click", () => setDrawerCollapsed(dataDock, !dataDock.classList.contains("collapsed")));
        hintLamp.addEventListener("click", () => hintPop.classList.toggle("open"));
        okBtn.addEventListener("click", () => { doneMask.style.display = "none"; });
        bindDrawer(controlDock);
        bindDrawer(dataDock);
        window.addEventListener("resize", () => {
          clearTimeout(resizeCanvas.timer);
          resizeCanvas.timer = setTimeout(resizeCanvas, 120);
        });
      }
      function init() {
        initDots();
        initEvents();
        resizeCanvas();
        setDrawerCollapsed(controlDock, true);
        setDrawerCollapsed(dataDock, true);
        resetScene();
        requestAnimationFrame(() => { resizeCanvas(); draw(); });
        setTimeout(() => { resizeCanvas(); draw(); }, 180);
      }
      init();
      window.state = state;
      window.setScenario = setScenario;
      window.recordLastObservation = recordLastObservation;
      window.analyzeConclusion = analyzeConclusion;
    })();
  </script>
</body>
</html>
`;
}

const selectedIds = new Set(process.argv.slice(2).map(Number).filter(Boolean));
const selected = selectedIds.size ? specs.filter(spec => selectedIds.has(spec.id)) : specs;

for (const spec of selected) {
  const filePath = path.join(outDir, `初中物理实验${spec.id}.html`);
  fs.writeFileSync(filePath, pageFor(spec), "utf8");
  console.log("wrote", filePath);
}
