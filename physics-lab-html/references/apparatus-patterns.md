# Apparatus Patterns (from existing lab HTML)

本文件从以下首批样例提取，并在后续实验回填中持续扩充可复用器材模式；各 Pattern 的详细来源见对应小节：
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/高中物理实验1.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/高中物理实验2.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验8.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验9.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验10.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/牛顿第三定律演示.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验13.html`

## Usage Rule

- 先根据教学目标选“必要器材模式”，再生成页面。
- 数据与结论必须来自器材状态变化，不可脱离器材独立模拟。
- 不按固定数量凑器材，按实验真实性配置必要器材。
- 优先复用本文件列出的“来源验证过”的器材模式，再做局部改造。
- 新建器材/对象时，必须在交付前补写回本文件并记录来源文件路径。
- 已有 runtime 覆盖的器材模式，只记录 `Runtime family`、`Required primitives` 与来源；真正的加载顺序统一交给 `assets/runtime/manifest.js`。

## Runtime Mapping Rule

- `Runtime family` 指向 `assets/runtime/components/*` 中的器材组件族。
- `Required primitives` 只列出该模式依赖的原语名，不在参考文档里复制实现细节。
- 单文件实验在生成时按 `assets/runtime/manifest.js` 的顺序内联，不在模板层重写组件内部物理逻辑。
- 机器可读的 pattern/alias 到 runtime family 映射，以 `assets/runtime/runtime-family-map.json` 为准；本 Markdown 保留人读说明和来源，不作为生成链的唯一解析来源。

## 2026-05-25 第三轮批量优化同步（实验 38-68）

来源：`physics-lab-html/scripts/regenerate_38_68_realism_v2.mjs`，生成 `初中物理实验38.html` 至 `初中物理实验59.html`、`初中物理实验61.html` 至 `初中物理实验68.html`；`初中物理实验60.html` 保留手工样板并做面板一致性修补。

### 约束沉淀
- 数据面板只承载记录/图表，不显示“教材对应”类来源文字。
- 实验面板只保留记录、分析等必要命令，不放“操作/现象”读数块；操作提示放在步骤卡和提示灯。
- 分析结论写入实验面板后，完成态不得自动折叠实验面板，也不得立即用完成弹层遮挡；学生应能直接看到结论文本。小屏下若数据面板会遮住结论，优先折叠数据面板。
- 移动端必须能从实验舞台区域纵向滑动页面；`#stage` 默认使用 `touch-action: pan-y pinch-zoom`。若 `#labCanvas` 为了竖向或双轴器材拖拽使用 `touch-action: none`，必须提供 Canvas 空白区手动滚动兜底，不能让整个实验区吞掉页面滑动。
- 批量页移除“操作器材”按钮，核心状态通过实验台画布拖动切换；实验 60 继续使用开关、滑动变阻器、电阻盒的真实热点。
- 光学 Pattern AP 使用双轨光具座、刻度尺、滑块底座、蜡烛、镜片夹和光屏支架；机械 Pattern AR 使用实验桌、铁架台、滑轮、钩码、绿色弹簧测力计、轨道和热机模型。
- 自动演示保持慢速分步，必须实际写入记录后再推进下一步。

## Pattern A: 电路桥接导电性（初中8）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验8.html`

### 器材对象
- 电源（battery）
- 导线/电路路径（svg path）
- 灯泡（bulb）
- 缺口测试区（drop zone + clips）
- 待测材料（可拖拽物）

### 核心状态
- `connectedItem`: 当前连接在缺口处的材料
- `item.type`: `conductor | insulator`
- `isCircuitOn`: 电路是否闭合导通

### 操作链
1. 从器材架拖拽待测材料
2. 放入缺口测试区并吸附
3. 判定导通并点亮/熄灭灯泡
4. 基于现象推进步骤

### 读数链
- 读数不是数值表，而是“灯亮/灯灭”+ 结论标签。
- 可扩展为电流表读数：导体大于阈值、绝缘体接近零。

### 关键实现点
- `pointerdown/move/up` 拖拽
- `isOverDropZone()` 重叠判定
- `snapToCircuit()` 吸附与自动替换已连接材料
- `updateCircuitVisuals()` 器材状态联动

### Runtime mapping
- `Runtime family`: `components/conductivity-bridge.js`
- `Required primitives`: `primitives/snap.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern B: 热传导竞速台（初中9）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验9.html`

### 器材对象
- 热源按钮（heater）
- 多材料棒（铜/铁/玻璃）
- 热层进度条（heat-layer）
- 火柴指示器（drop）

### 核心状态
- `isHeating`
- `heatProgress[i]`
- `rods[i].dropped`

### 操作链
1. 启动热源
2. 观察各材料热传播速度
3. 观察火柴掉落先后
4. 选择题确认导热快慢排序

### 读数链
- 读数为“到达阈值时间/先后顺序”。
- 可扩展：记录每根棒达到 80% 热层所需时间并生成表格。

### 关键实现点
- `requestAnimationFrame` 动画驱动
- 不同材料 `speed` 参数化
- 阈值触发掉落与结果标签

### Runtime mapping
- `Runtime family`: `components/heat-conduction-race.js`
- `Required primitives`: `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern C: 托盘天平称量（初中10）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验10.html`

### 器材对象
- 托盘天平（横梁、指针、左右盘）
- 平衡螺母控制
- 游码滑块
- 砝码盒
- 待测物体

### 核心状态
- `nutOffset`（调平偏差）
- `riderValue`（游码）
- `itemsPos[id]`（物体/砝码所在位置）
- `leftLoad/rightLoad`

### 操作链
1. 空载调平（螺母）
2. 左物右码（拖拽放置）
3. 游码微调至平衡
4. 读数并结束

### 读数链
- `netDiff = (leftLoad - (rightLoad + riderValue)) + nutOffset`
- `isBalanced = abs(netDiff) < threshold`
- 结果：`m_object = rightLoad + riderValue`

### 关键实现点
- 器材动作与“力学平衡”联动，不是纯表单输入
- 盘区吸附 + 位置状态持久化
- 指针角度与偏差连续映射

### Runtime mapping
- `Runtime family`: `components/balance-scale.js`
- `Required primitives`: `primitives/snap.js`, `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern D: 纸带 + 卡尺测量（高中1）

### 器材对象
- 纸带（点列）
- 卡尺双爪（可拖动/吸附目标点）
- 连线读数区
- 结果记录抽屉

### 核心状态
- 纸带点位数据
- 左右卡爪索引/坐标
- 当前目标点、`Δx`、`v(P)`
- 历史记录表

### 操作链
1. 选点
2. 卡爪对准（拖动或自动吸附）
3. 计算速度
4. 写入记录

### 读数链
- 几何测距 `Δx`
- 速度近似 `v(P) = Δx / (4Δt)`

### 关键实现点
- 点级吸附 + nearest index
- 读数与可视连线同步更新
- 操作抽屉、记录抽屉可拖动与折叠

### Runtime mapping
- `Runtime family`: `components/paper-tape-analyzer.js`
- `Required primitives`: `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern E: 打点计时器 + 小车 + 纸带 + 图像（高中2）

### 器材对象
- 打点计时器（时钟/灯）
- 小车轨道
- 纸带画布
- 数据/图像结果区

### 核心状态
- 运动参数 `v0/a/N`
- 点出现进度
- 选点集合
- `Δx/ΔΔx`、`v-t`、拟合参数

### 操作链
1. 开始打点（时序显现）
2. 选点测距
3. 计算与拟合
4. 切换数据/图像验证规律

### 读数链
- 选点后可得距离数组
- 计算后得速度数组与拟合斜率

### 关键实现点
- 多器材协同（计时器/小车/纸带/图像）
- `requestAnimationFrame` 与节奏控制
- 面板抽屉 + 标签页状态管理

### Runtime mapping
- `Runtime family`: `components/paper-tape-analyzer.js`
- `Required primitives`: `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern F: 弹簧测力计读数链（牛顿第三定律来源）

### 器材对象
- 测力计壳体（`scale-casing`）
- 数显读数屏（`lcd-screen`）
- 弹簧窗（`spring-window`）
- 弹簧线圈 + 内部拉杆（`spring-coil/internal-rod`）
- 挂钩总成（`hook-assembly/metal-hook`）

### 核心状态
- `force/apparentN`（当前示数）
- `loadRatio`（相对满量程比例）
- `springHeight/rodHeight/hookDrop`（可视伸长参数）

### 操作链
1. 器材动作产生受力变化（拖拽/浸没/接触）
2. 根据受力更新测力计示数
3. 读数屏与弹簧形变同步刷新
4. 将读数进入记录与步骤判定

### 读数链
- 数字读数来自受力状态，不允许独立随机。
- 可视形变与读数同源（同一状态变量驱动）。

### 关键实现点
- 复用 `lcd-screen + spring-coil + hook-assembly` 组件结构。
- 读数与形变同帧更新，避免“数字变了弹簧不动”。
- 以挂钩中心作为绳线锚点，保持几何一致性。

### Runtime mapping
- `Runtime family`: `components/spring-scale.js`
- `Required primitives`: `primitives/snap.js`, `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern G: 满杯溢流 + 量筒守恒（浮力/排液类）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/physics-lab-html/assets/runtime/components/overflow-cylinder.js`

### 器材对象
- 近满液面烧杯（带刻度/溢流口）
- 溢流路径（溢流口/液流视觉）
- 量筒（累计排液体积）
- 被浸没物体（可拖拽）

### 核心状态
- `immersionRatio`（浸没比例）
- `displacedMl`（当前排开体积）
- `cylinderMl`（量筒累计体积）
- `spillMl[liquid]`（各烧杯累计溢出）

### 操作链
1. 将物体浸入近满烧杯
2. 计算排开体积并触发溢流
3. 量筒同步增加液体体积
4. 由读数链推导浮力/结论

### 读数链
- 当前读数：`V排 = immersionRatio * V物`
- 累计守恒：`量筒增量 = max(0, ΔV排)`
- 烧杯液面变化由 `spillMl` 反映，不可静态不变

### 关键实现点
- 优先用“满杯/近溢出”而非半杯，保证排液路径合理。
- 量筒应为累计逻辑，不应随物体提起直接清零。
- 任务判定同时检查器材状态（浸没/介质/读数）。

### Runtime mapping
- `Runtime family`: `components/overflow-cylinder.js`
- `Required primitives`: `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern H: 双液混合量筒（分子间隙观察）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验14.html`

### 器材对象
- 量筒A（水）
- 量筒B（酒精）
- 混合量筒（带刻度）

### 核心状态
- `pouredWater/pouredAlcohol`
- `mixMl/mixRead`
- `shaken`

### 操作链
1. 先后倒入两种液体
2. 摇匀并读数
3. 对比理论体积和实测体积
4. 输出“分子间有间隙”结论

### 关键实现点
- 读数必须来自量筒状态，不可仅文本模拟。
- 先后倒入和摇匀是独立步骤，避免一步到结论。
- 混合液视觉要有液体对象，不可空场景。
- 量筒建议采用细长比例，避免“过粗容器”弱化读数真实性。

### Runtime mapping
- `Runtime family`: `components/mixture-cylinder.js`
- `Required primitives`: `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern I: 金属块吸附 + 弹簧测力计（分子引力观察）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验15.html`

### 器材对象
- 金属块A/B
- 接触面处理器（砂纸/刮刀，可拖拽）
- 横向螺旋夹具（可拖拽手柄）
- 弹簧测力计（读数链）

### 核心状态
- `leftPolish/rightPolish/scrapeProgress`
- `clampLevel`
- `scraped/pressed`
- `pullN`
- `adhered/separated`

### 操作链
1. 拖拽打磨接触面，达到双侧打磨阈值
2. 拖拽横向螺旋夹具手柄完成压紧
3. 进行两次拉伸对比（小拉力未分离 + 大拉力可分离）
4. 基于对比记录输出分子引力结论

### 关键实现点
- 吸附判定必须依赖“打磨+横向压紧”器材动作链。
- 拉力读数与分离状态要同源驱动。
- 分离阈值应联动 `polish + clamp`，避免“按钮一次通过”。
- 优先复用 Pattern F 的测力计读数表现。

### Runtime mapping
- `Runtime family`: `components/adhesion-bench.js`
- `Required primitives`: 复用 `components/spring-scale.js`（其依赖统一由 `assets/runtime/manifest.js` 管理）

## Pattern J: 刻度尺零刻度对齐测长

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验16.html`

### 器材对象
- 刻度尺
- 待测固体（多物体切换，优先用真实外形而非色块占位）
- 竖向读数虚线/滑标手柄
- 读数窗（局部放大尺面）

### 核心状态
- `aligned`
- `object/objectCm/lengthRef`
- `guideCm`
- `lastRead/measureCount`
- `zeroSnapPulse/guideSnapPulse`

### 操作链
1. 拖动物体，使左端与零刻度吸附对齐
2. 拖动竖向虚线/滑标，对准物体另一端读数
3. 更换物体并重复零刻度对齐与虚线读数
4. 分析误差与规范操作

### 关键实现点
- 若未对齐零刻度，不允许直接记为有效测量。
- 物体绘制首尾几何与吸附/读数判定必须使用同一套端点基准，避免“视觉端点”和“逻辑端点”不一致。
- 竖向虚线应按主尺单位语义吸附；若尺面单位为 `cm`，默认按 `0.1cm` 估读，但放大窗物理分度仍需与外部刻度尺一致。
- 放大窗应显示局部尺面、虚线、末端位置和最终读数，不应叠加低价值提示文字。
- 零刻度吸附和末端读数吸附可加入轻量脉冲反馈，但不放宽刻度判定。
- 记录中同时保留“测得值+参考值/误差”。
- 场景中必须有尺体与刻度，不可只保留输入框。

### Runtime mapping
- `Runtime family`: `components/scale-reading.js`
- `Required primitives`: `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern K: 摆球周期 + 秒表测时

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验17.html`

### 器材对象
- 摆球装置
- 秒表
- 计次设置器

### 核心状态
- `pendulumOn`
- `stopwatchRunning/elapsed`
- `cycles`

### 操作链
1. 启动摆球
2. 秒表启停完成总时长测量
3. 不同计次数重复测量
4. 用总时长/计次数得到单次周期

## Pattern O: 闪电列车同时性实验（相对论）

来源：`/Users/lx100/projects/AI-shifu/einstein-relativity-level-1-simultaneity.html`

### 器材对象
- 站台轨道（固定参考系）
- 列车本体（运动参考系）
- 双闪电触发点（前端/后端，站台系同时时刻触发）
- 双观察者（站台观察者/车上观察者）
- 四向光脉冲（从两端向两侧传播）
- 数据面板（到达时刻、时差、γ）

### 核心状态
- `vRatio`（列车速度，单位 c）
- `Lpx`（两道闪电间距）
- `cPx`（光速像素标定）
- `trainOffsetX/platformX`（观察者位置）
- `lastRun.arrival.platform/train`（两观察者接收时刻和时差）
- `dtPrime`（列车系下同时性差异的直观指标）

### 操作链
1. 调整 `vRatio` 与 `Lpx`
2. 触发双闪电（站台系设定为同时）
3. 观察两观察者接收先后与时差
4. 对比 `v=0` 与 `v>0` 的差异并完成结论题

### 读数链
- 平台观察者：`t_back = |x_obs - x_back| / c`, `t_front = |x_obs - x_front| / c`
- 车上观察者（运动目标）：基于迎向/背向传播速度 `c±v` 计算接收时刻
- 结论读数：`Δt_platform`、`Δt_train`、`γ`
- 判定重点：`v=0` 近似同时；`v>0` 时车上观察者的先后顺序与时差出现偏离

### 关键实现点
- 双参考系同屏可视化（同一场景显示两个观察者，避免抽象化）
- 自动演示分步回放：`v=0 -> v>=0.3c -> v=0.7c -> 结论小测`
- 保持器材动作与读数同源：时刻差来自几何位置与传播规则，不用随机数据
- 保留抽屉面板三分工：控制/数据/结论（可拖拽、可折叠、可吸边）

### Runtime mapping
- `Runtime family`: `components/relativity-observer-bench.js`
- `Required primitives`: `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`
4. 计算单次时间

### 关键实现点
- 秒表启停必须是可见操作步骤，不可直接生成时长。
- 至少两组不同计次数据再分析结论。
- 自动演示需体现“启表->停表”的可见过程。

### Runtime mapping
- `Runtime family`: `components/stopwatch-timing.js`
- `Required primitives`: `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern L: 轨道小车速度测量（s/t）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验18.html`

### 器材对象
- 小车轨道
- 刻度标尺（测程）
- 秒表（测时）
- 终点标记

### 核心状态
- `distance/push`
- `lastTime/lastSpeed`
- `runCount`

### 操作链
1. 设定测程与推力
2. 发车并计时
3. 按 `v=s/t` 记录速度
4. 多组对比后分析

### 关键实现点
- 小车运动过程应可见（非瞬时跳值）。
- 速度记录需绑定本次测程和用时。
- 至少两组数据后再给结论。

### Runtime mapping
- `Runtime family`: `components/speed-measurement.js`
- `Required primitives`: `primitives/measure.js`, `components/stopwatch-timing.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern M: 施力形变对比（弹簧/海绵）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验19.html`

### 器材对象
- 样件（弹簧、海绵）
- 施力装置
- 刻度尺

### 核心状态
- `sample/force`
- `lastDeform`
- `applied/recoverPct`

### 操作链
1. 施加小力观察形变
2. 增大力再次观察
3. 可切换样件做对比
4. 分析“力越大形变越明显”

### 关键实现点
- 形变量与施力参数要有单调关系。
- 撤力后应体现恢复状态（材料差异）。
- 场景必须呈现固体形变过程。

### Runtime mapping
- `Runtime family`: `components/elastic-plastic-bench.js`
- `Required primitives`: `primitives/measure.js`

## Pattern N: 施力前后速度状态变化

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验20.html`

### 器材对象
- 小车轨道
- 施力方向/大小控制
- 速度指示表

### 核心状态
- `beforeV/afterV/velocity`
- `dir/mag/duration`
- `cartX`

### 操作链
1. 对静止小车施力使其运动
2. 反向施力使其减速/反向
3. 记录施力前后速度
4. 分析“力改变运动状态”

### 关键实现点
- 记录需同时包含施力前后速度，避免口头结论。
- 方向变量必须参与速度更新。
- 自动演示需包含同向和反向两类施力。

### Runtime mapping
- `Runtime family`: `components/motion-state-bench.js`
- `Required primitives`: 无额外 primitives；加载顺序由 `assets/runtime/manifest.js` 统一管理

## Pattern P: 飞船光钟时间膨胀（双参考系同屏）

来源：`/Users/lx100/projects/AI-shifu/relativity-light-clock-lab.html`

### 器材对象
- 飞船光钟（上下镜面 + 船内光子）
- 地球视角光钟（运动飞船 + 外部观察光子）
- 双参考系显示区（船内/地球并排）
- 控制抽屉（速度、镜面间距、运行）
- 数据抽屉（`v/c`、`γ`、`t_ship`、`t_earth`、`Δt`）

### 核心状态
- `vRatio`（速度占光速比例）
- `hPx`（镜面间距）
- `properTick`（固有时基准）
- `currentRun.tShip/tEarth/delta/gamma`
- `shipPts/earthPts`（两参考系光路关键点）

### 操作链
1. 调整速度 `vRatio` 与镜面间距 `hPx`
2. 启动单次光钟往返（船内与地球视角同步播放）
3. 观察虚线光路逐段显现 + 光子运动
4. 记录 `t_ship`、`t_earth`、`Δt` 并在第4步完成结论

### 读数链
- 船内：`t_ship` 由镜面间距和固有时标定
- 地球：`t_earth = γ * t_ship`
- 时差：`Δt = t_earth - t_ship`
- 判定重点：随 `v` 增大，`γ` 增大，`Δt` 增大

### 关键实现点
- 两参考系同屏，避免纯公式讲解
- 光路采用“虚线 + 按进度显现”，与光子位置同源
- 终点吸附：结束帧强制光子落在底部镜面中心
- 自动演示按 `0c -> 0.4c -> 0.7c` 分步运行
- 控制/数据抽屉默认折叠并可拖拽，避免遮挡

### Runtime mapping
- `Runtime family`: `components/relativity-observer-bench.js`
- `Required primitives`: `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern Q: 单舞台极简加速轨道 + 迷你能量看板

来源：`/Users/lx100/projects/AI-shifu/relativity-emc2-intuition-lab.html`

### 器材对象
- 单一加速轨道主舞台（黑色背景）
- 粒子（沿轨道单轴运动）
- 光速上限线（`c` 边界）
- 右下角迷你能量看板（提速份额/总能量两条）
- 控制抽屉 + 数据抽屉（默认折叠）

### 核心状态
- `vRatio`（当前速度占光速比例）
- `pulseLevel`（脉冲档位）
- `currentRun.dv`（本次速度增量）
- `currentRun.energyEnd`（本次结束总能量）
- `speedShare`（脉冲中用于提速的相对份额）

### 操作链
1. 设置初速度与脉冲档位
2. 发射脉冲并观察粒子位移（速度变化）
3. 同步观察迷你看板两条变化
4. 完成结论选择并引出 `E=mc²`

### 读数链
- 主读数只保留 `v` 与 `Δv`（首屏低信息密度）
- 高级记录进入数据抽屉（`v起点/v终点/Δv/脉冲/E终点`）
- 结论由“同脉冲下高速 `Δv` 更小 + `E` 仍上升”共同给出

### 关键实现点
- 主区不使用多层卡片/网格边框，避免视觉噪音
- 能量看板采用右下角小面板覆盖式布局，不抢主舞台
- 解释区可保留“标题 + 要点列表”样式，便于课程一致性
- 自动演示保持 `0.00 -> 0.70 -> 0.90` 的分步验证节奏

### Runtime mapping
- `Runtime family`: `components/relativistic-runway.js`
- `Required primitives`: `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern R: 滑动摩擦力测量台（木块 + 接触面 + 弹簧测力计）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验21.html`

### 器材对象
- 木块
- 木块配重块（用于表现压力变化）
- 光滑/粗糙两类接触面
- 弹簧测力计（含刻度与指针）
- 连接绳（木块-测力计）

### 核心状态
- `surface/normalN`
- `pulling/pullTrace/ropeTension`
- `lastF`
- `sameSurfaceCompared/crossSurfaceCompared`

### 操作链
1. 放置木块并连接测力计
2. 在同接触面下改变压力并读数
3. 切换接触面并读数
4. 基于对比记录输出结论

### 关键实现点
- 摩擦力读数必须同时受 `surface` 与 `normalN` 影响。
- 读数时需体现“匀速拉动”过程反馈（拉绳受力与位移反馈）。
- 至少包含“同面变压力”与“异面比较”两类数据。
- 优先复用 Pattern F 的测力计读数组件。

- `Runtime family`: `components/friction-bench.js`
- `Required primitives`: 复用 `components/spring-scale.js`（其依赖统一由 `assets/runtime/manifest.js` 管理）

## Pattern S: 弹簧测力计基础测力（调零 + 挂重物）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验22.html`

### 器材对象
- 弹簧测力计（含零位、刻度、指针）
- 支架横梁（悬挂点）
- 可更换重物

### 核心状态
- `zeroed/hung`
- `mass/hangMass`
- `needRehang`
- `lastN`

### 操作链
1. 调零
2. 挂重物
3. 读取示数并记录
4. 更换质量后先重挂，再重复测量

### 关键实现点
- 未调零时禁止有效读数。
- 质量参数变化后，旧悬挂状态立即失效（必须 `hangWeight` 重执行）。
- 示数与重物质量单调相关。
- 同一页面内至少两组不同质量记录。

- `Runtime family`: `components/spring-scale-basics.js`
- `Required primitives`: 复用 `components/spring-scale.js`（其依赖统一由 `assets/runtime/manifest.js` 管理）

## Pattern T: 二力平衡拉环对比

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验23.html`

### 器材对象
- 拉环（受力点）
- 左右测力计（水平拉力读数）
- 左右拉绳（与拉环连接）

### 核心状态
- `leftN/rightN`
- `ringOffset`
- `balanced`
- `tests[]`

### 操作链
1. 施加左拉力
2. 施加右拉力
3. 判断平衡状态并记录
4. 对比平衡与不平衡数据

### 关键实现点
- 判定核心是两力差值阈值。
- 拉环位移应随两侧拉力差连续变化（不是仅文字切换）。
- 数据记录必须覆盖平衡与不平衡两种状态。

- `Runtime family`: `components/force-balance-ring.js`
- `Required primitives`: 无额外 primitives；加载顺序由 `assets/runtime/manifest.js` 统一管理

## Pattern U: 急停惯性对比车

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验24.html`

### 器材对象
- 小车轨道
- 车上木块
- 制动末端结构（慢停摩擦段/急停挡块）

### 核心状态
- `stopMode/speedLevel/launchSpeed`
- `lastSpeedLevel`
- `brakeProgress`
- `blockSlip`
- `slowObserved/quickObserved`

### 操作链
1. 发车
2. 按制动模式执行停下
3. 读取木块前冲位移
4. 比较慢停与急停

### 关键实现点
- 同速度条件下急停前冲应显著大于慢停。
- 记录必须绑定“发车时速度等级”（而不是事后面板值）。
- 记录需绑定制动模式，避免混淆。

- `Runtime family`: `components/inertia-brake-cart.js`
- `Required primitives`: 无额外 primitives；加载顺序由 `assets/runtime/manifest.js` 统一管理

## Pattern V: 阻力跑道滑行距离对比

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验25.html`

### 器材对象
- 斜面释放端
- 小车
- 低阻/高阻跑道

### 核心状态
- `track/pushN`
- `launchTrack/launchPush`
- `lastDist`
- `tests[]`

### 操作链
1. 在低阻跑道测距
2. 在高阻跑道测距
3. 记录并比较
4. 输出阻力影响结论

### 关键实现点
- 推力参数需写入记录用于可比性检查。
- 读距离时必须使用“发车时跑道/推力”，防止读数时改参数污染记录。
- 判定应覆盖低阻与高阻两类数据。

- `Runtime family`: `components/resistance-runway.js`
- `Required primitives`: 无额外 primitives；加载顺序由 `assets/runtime/manifest.js` 统一管理

## Pattern W: 杠杆平衡力矩台

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验26.html`

### 器材对象
- 杠杆尺
- 支点
- 左右砝码（力与力臂）
- 刻度线与挂点（力臂可视）

### 核心状态
- `leftArm/rightArm`
- `leftForce/rightForce`
- `leftTorque/rightTorque`
- `balanced`

### 操作链
1. 设置左右力与力臂
2. 计算并观察是否平衡
3. 记录多组平衡数据
4. 归纳力矩关系

### 关键实现点
- 平衡判定由两侧力矩差值驱动。
- 杠杆倾角与力矩差值联动，挂点位置与设定力臂联动。
- 数据记录至少包含两组平衡样本。

- `Runtime family`: `components/lever-balance.js`
- `Required primitives`: 无额外 primitives；加载顺序由 `assets/runtime/manifest.js` 统一管理

## Pattern X: 压强小桌 + 海绵压痕

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验27.html`

### 器材对象
- 压强小桌
- 海绵垫
- 可调压力重物

### 核心状态
- `forceN`
- `area`（大/小面积）
- `pressed/sinkDepth`
- `lastP`

### 操作链
1. 固定面积改变压力
2. 固定压力改变面积
3. 先压放小桌再读取压强并记录
4. 对比得出结论

### 关键实现点
- 压强计算需明确 `P=F/S` 映射。
- 未执行“压放小桌”时禁止有效读数。
- 记录必须覆盖大小面积与不同压力。

- `Runtime family`: `components/pressure-table.js`
- `Required primitives`: 无额外 primitives；加载顺序由 `assets/runtime/manifest.js` 统一管理

## Pattern Y: 侧孔喷流（器壁压强）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验28.html`

### 器材对象
- 透明液体容器
- 可调深度侧孔
- 喷流可视轨迹

### 核心状态
- `depth`
- `holeOpened/openDepth`
- `lastJet`

### 操作链
1. 打开浅孔读喷距
2. 打开深孔读喷距
3. 记录深度-喷距关系
4. 输出器壁压强结论

### 关键实现点
- 喷距应随孔深总体上升。
- 孔深参数变化后，必须重新打开对应深度侧孔才能读数。
- 记录表需保留深度与喷距同条目。

### Runtime mapping
- `Runtime family`: `components/side-hole-jet.js`
- `Required primitives`: `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern Z: 液体内部压强探头（同深度方向对比）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验29.html`

### 器材对象
- 液体容器
- 可旋转压强探头
- 深度刻度

### 核心状态
- `depth/dir`
- `lastP`
- `sameDepthCompared`

### 操作链
1. 固定深度读侧向压强
2. 同深度切换向下/向上读数
3. 改变深度继续测量
4. 对比方向与深度影响

### 关键实现点
- 同深度不同方向读数应近似可比。
- 方向参数变化后必须先执行“调整探头方向”再读数。
- 深度变化需导致明显读数差。

### Runtime mapping
- `Runtime family`: `components/liquid-pressure-manometer.js`
- `Required primitives`: `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern AA: 液体压强控制变量槽（深度 + 密度）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验30.html`

### 器材对象
- 压强探头
- 可更换液体（油/水/盐水）
- 深度测点

### 核心状态
- `depth/liquid`
- `lastP`
- `depthCompared/densityCompared`

### 操作链
1. 固定液体改变深度测量
2. 固定深度更换液体测量
3. 记录并做控制变量比较
4. 结论回归“深度+密度”双因素

### 关键实现点
- 必须同时满足“同液体不同深度”和“同深度不同液体”两类对比。
- 液体参数变化后必须先执行“更换液体”确认，再允许读数。
- 读数计算应显式引入液体密度权重。
- 若教材/任务卡指定关键深度（如 `20.0 cm`），通过条件应严格命中该刻度，不要放宽成“附近区间”。
- 为避免严格刻度造成操作困难，探头深度应提供舞台侧精度辅助：至少包含整刻度吸附，以及点击深度尺/轨道直接落到最近刻度。
- U 形压强计液柱差需要做增强映射，保证关键对比（如 `20.0 cm` 与更深位置、清水与盐水）在视觉上能一眼看出差别，同时保持“压强越大，液柱差越大”的单调关系。

### Runtime mapping
- `Runtime family`: `components/liquid-pressure-manometer.js`
- `Required primitives`: `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern AB: 水沸腾抽屉化控制链（温度-时间 + 结论闭环）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验4.html`

### 器材对象
- 酒精灯（点燃/熄灭状态）
- 三脚架 + 石棉网 + 烧杯 + 水体
- 温度计（插入/移出）
- 气泡层（沸腾可视反馈）
- 控制抽屉（过程读数 + 温度-时间图 + 操作）
- 数据抽屉（仅记录历史）

### 核心状态
- `sim.temp/time/heating/inserted`
- `sim.boilStableSec`（沸腾稳定累计时长）
- `sim.dataPoints`（温度-时间采样）
- `records/unseenRecordCount`
- `currentTask/freeMode/autoPlaying/completed`

### 操作链
1. 插入温度计（装置就位）
2. 点燃酒精灯并持续加热（升温段）
3. 观察沸腾平台（接近沸点后温度稳定）
4. 完成结论作答并确认

### 读数链
- 过程读数来自器材状态，不独立伪造：
  - 加热状态 -> 温度变化速率 -> 采样点 -> 温度-时间曲线
  - 沸腾稳定时长由温度区间累计得到
- 数据抽屉记录仅在步骤达标后写入（步骤、温度、时间）

### 关键实现点
- 控制抽屉承载实时观察，数据抽屉只放记录表，避免信息冲突。
- 数据抽屉遵循未读红点规则：折叠时记未读，展开清零。
- 自动演示使用每步记录断言：
  - `beforeLen = records.length`
  - 步骤动作 + 确认后断言 `records.length > beforeLen`
  - 失败抛 `AUTO_RECORD_NOT_PERSISTED` 并走恢复逻辑
- 自动演示中抽屉仍可拖动；必要时重定位防遮挡。

### Runtime mapping
- `Runtime family`: `components/boiling-curve-lab.js`
- `Required primitives`: `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern AC: 弹性/塑性拉伸体验台（橡皮筋 + 弹簧 + 橡皮泥）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验6.html`

### 器材对象
- 顶部挂点/横梁 + 目标拉伸虚线
- 三种材料本体（橡皮筋、钢弹簧、橡皮泥）
- 拉手柄（仅手柄可拖拽）
- 控制抽屉（当前材料、长度、最大长度、回弹状态）
- 数据抽屉（步骤记录）

### 核心状态
- `materials[key].height/maxHeight/released/recovered/status`
- `state.draggingKey/dragStartY/dragStartHeight`
- `currentTask/freeMode/autoPlaying/completed`
- `records/unseenRecordCount`

### 操作链
1. 按步骤指定材料进行向下拉伸（到目标线附近）
2. 松手触发材料释放行为
3. 观察是否恢复原状（弹性）或保留残余形变（塑性）
4. 点击“确认观察”完成步骤判定与记录

### 读数链
- 读数来自同一材料状态：
  - 当前长度 `height`
  - 最大长度 `maxHeight`
  - 回弹状态 `status/recovered`
- 步骤达标后写入记录（步骤、材料、最大长度、回弹/不回弹）

### 关键实现点
- 拉伸难度差异由 `stiffness` 显式建模（同样拖动位移产生不同伸长）。
- 松手后：
  - 橡皮筋/弹簧走阻尼回弹动画；
  - 橡皮泥走塑性定型动画（保留残余长度）。
- 引导模式强制“当前步骤材料门禁”；越序拖拽触发红点警告。
- 自动演示使用“真实拖拽链”（不是仅改数值）：开始拖拽 -> 分帧移动 -> 松手 -> 等待稳定 -> 确认观察。
- 自动演示每步必须通过记录断言（`AUTO_RECORD_NOT_PERSISTED`）。

### Runtime mapping
- `Runtime family`: `components/elastic-plastic-bench.js`
- `Required primitives`: `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern R~AA Shared Component Notes (2026-03-05 优化同步)

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验21.html`

### 可复用绘制组件
- `drawSpringScaleSimple`：竖向测力计壳体 + 刻度 + 指针 + 拉钩（R/S）
- `drawHorizontalGauge`：横向测力计（T）
- `drawCartDetailed`：带轮轴细节的小车（U/V）
- `drawTankWithScale`：带刻度与液面高光的液体容器（Y/Z/AA）

### 统一操作约束
- 参数变化触发“重新上链”原则：质量/孔深/探头方向/液体类型变化后，必须重执行对应器材动作。
- 自动演示脚本必须补齐记录链，确保步骤 3 的记录数量与分析条件可达成。

## Pattern AD: 磁铁滑轨对极演示台（观察磁现象）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验7.html`

### 器材对象
- 活动条形磁铁（可拖拽、可翻转）
- 目标条形磁铁（位于滑轨，可翻转）
- 滑轨/滑座
- 铁钉散点区
- 力线提示与现象标签

### 核心状态
- `scene.magnets[]`（`role/flipped/x/y/baseX`）
- `scene.nails[]`（`attachedTo`）
- `scene.pairText/minDistance/lastInteraction`
- `scene.targetShift`
- `scene.snapped`
- `scene.snapLock = { engaged, activeSide, targetSide }`

### 操作链
1. 拖动活动磁铁靠近铁钉，观察磁铁吸铁性。
2. 将活动磁铁某磁极靠近目标磁铁对应磁极，观察同极相斥。
3. 调整磁极朝向后再次靠近，观察异极相吸并吸附。
4. 点击“确认观察”完成步骤判定与记录。

### 读数链
- 过程读数：
  - 当前对极关系 `pairText`
  - 极间距离 `minDistance`
  - 目标磁铁位移 `targetShift`
  - 铁钉吸附数 `attached / total`
- 记录读数：
  - 步骤 1：吸附铁钉数量
  - 步骤 2：同极相斥位移
  - 步骤 3：异极相吸时的极间距离/吸附结果

### 关键实现点
- 磁极相互作用必须是通用物理层：
  - 同极相斥、异极相吸在引导模式和自由模式下都应真实发生；
  - 引导模式只约束“是否算当前步骤通过”，不能关闭真实磁极作用。
- 当异极进入吸附阈值后，必须切换到稳定锁定态：
  - 使用 `snapLock` 显式保存已吸附关系；
  - 锁定时让目标磁铁跟随活动磁铁保持稳定极对齐；
  - 解除条件应明确（例如翻转磁极、显著拉开距离、离开滑轨对位区）。
- 自动演示仍需走真实拖拽链，并在锁定态下保持目标磁铁稳定，避免“吸到一起后持续抖动”。
- 若步骤 1 需要统计铁钉吸附数，建议使用确定性散点布局，避免自动演示受随机散布影响。

### 复用建议
- 适用于“观察磁现象”“探究磁极相互作用”等初中磁学实验。
- 若后续扩展到磁场线/指南针方向实验，可复用本模式中的“磁极对极关系 + 稳定吸附锁定”状态层。

### Runtime mapping
- `Runtime family`: `components/magnetic-pole-bench.js`
- `Required primitives`: `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern AE: 质量-体积测量与 m-V 图像分析台（初中11）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验11.html`

### 器材对象
- 样品块展示台（木块/铝块/铁块）
- 电子天平读数屏
- 体积滑尺（可拖动）
- `m-V` 图像画布
- 材料切换按钮组
- 拟合/确认操作按钮

### 核心状态
- `material`（当前材料）
- `volume`（当前体积）
- `records[]`（测量点与分析记录）
- `fitVisible/analysisOk`
- `measuredAtCurrent`

### 操作链
1. 选择一种材料。
2. 拖动体积滑尺改变样品体积。
3. 读取电子天平显示的质量并记录一个测量点。
4. 同种材料记录多组不同体积数据。
5. 切换另一种材料重复记录。
6. 点击线性拟合，比较不同材料斜率并形成结论。

### 读数链
- 单点测量读数：
  - `m = density * V`
  - 当前读数来自样品状态，不允许脱离器材独立填写。
- 图像读数：
  - 记录表中的 `material/volume/mass`
  - 图像散点位置与记录表同源
  - 拟合结果 `m ≈ kV + b` 来自已记录点集

### 关键实现点
- 样品展示、电子天平、体积滑尺三者必须同源驱动：
  - 改变 `volume` 时，样品体积外观、电子天平质量读数、控制面板体积/质量同步更新。
- 图像区应实时画散点，不应在记录后仍保持空白。
- `线性拟合` 必须建立在“至少两种材料、且每种至少两点”的真实记录基础上。
- 自动演示需要走真实操作链：
  - 切换材料
  - 拖动体积滑尺
  - 点击“测量并记录”
  - 点击“线性拟合”
  - 每一步做记录持久化断言
- 该类实验的数据面板只保留记录历史；材料选择、当前体积、当前质量、拟合结论应留在控制抽屉或图像就地说明中。

### 复用建议
- 适用于“探究质量与体积关系”“密度图像法入门”“多材料线性关系比较”等实验。
- 若后续扩展到密度计算或斜率比较题，可直接复用本模式中的“样品状态 -> 测量点 -> 图像拟合”三段链路。

### Runtime mapping
- `Runtime family`: `components/mass-volume-analysis.js`
- `Required primitives`: `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern AF: 三杯温度计测温台（冷水 / 室温 / 热水）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验1.html`

### 器材对象
- 常见温度计（可拖拽，含玻璃泡 / 液柱）
- 冷水烧杯
- 室温水烧杯
- 热水烧杯
- 记录抽屉（温度记录与误差）

### 核心状态
- `immersedKind`（当前浸入的烧杯类型）
- `Tread/Ttarget`（温度计当前示数 / 目标液体温度）
- `stableCounter`（接近稳定的累计计数）
- `records[]`
- `warningStep/currentTask`

### 操作链
1. 将温度计拖入某一烧杯，使玻璃泡完全浸入液体。
2. 保持温度计不碰杯壁、不碰杯底，等待示数逐步逼近目标温度。
3. 观察“接近稳定”状态后记录一次读数。
4. 依次对冷水、室温水、热水重复测量并比较。

### 读数链
- 读数来自热交换过程：
  - `immersedKind -> Ttarget`
  - `Tread` 按响应速度逐步逼近 `Ttarget`
  - `stableCounter` 达标后才适合记录
- 记录表中的 `target/read/error` 必须与当前浸入烧杯和示数同源。

### 关键实现点
- 温度计示数必须有“反应时间”，不能拖入后瞬时跳到目标温度。
- 是否允许记录应同时检查：
  - 玻璃泡已浸入液体；
  - 未碰杯壁/杯底；
  - 示数变化已明显减慢。
- 温度计离开液体后，示数应回归环境/初始状态，而不是保持上一次液体读数不变。
- 自动演示需要真实走“浸入 -> 等待稳定 -> 记录”的链路，并校验记录已落表。

### 复用建议
- 适用于“用常见温度计测量温度”“比较不同液体温度”“读数稳定性训练”等实验。
- 若后续扩展到热平衡或温度变化快慢体验，可直接复用本模式中的“目标温度 + 惯性读数”状态链。

### Runtime mapping
- `Runtime family`: `components/thermometer-reading.js`
- `Required primitives`: `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern AG: 水浴晶体熔化-凝固观测台（海波）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验2.html`

### 器材对象
- 水浴槽
- 烧杯内海波样品（固相 / 液相双层可视）
- 温度计
- 加热 / 冷却控制器
- 温度-时间图像区
- 平台框选标记框

### 核心状态
- `sim = { t, T, running, mode, power, meltFrac, freezeFrac, phase, data[] }`
- `records[]`
- `dataCollapsed/unseenRecordCount`
- `draggingBox`（平台框选框拖拽）

### 操作链
1. 启动水浴加热，观察海波由固态逐渐熔化。
2. 记录加热过程中的温度与时间数据。
3. 暂停后拖动标记框圈出熔化平台。
4. 切换为冷却，观察海波凝固并记录数据。
5. 暂停后圈出凝固平台，完成结论判定。

### 读数链
- `mode/power/running` 决定 `sim.T` 与 `sim.t` 的演化。
- `sim.T` 与相变阈值共同决定 `meltFrac/freezeFrac/phase`。
- 图像区折线、平台框选目标和记录表必须来自同一份 `sim.data`。
- 记录表每行保留 `step/temp/t`，不能脱离过程状态独立生成。

### 关键实现点
- 水浴、样品相态和图像三者必须同源，不能出现“样品已液化但图像仍无平台”的断裂。
- 熔化平台与凝固平台需要建立在真实暂停和框选操作上，而不是直接按钮判定。
- 自动演示必须覆盖加热、记录、暂停框选、切换冷却、再次记录和框选的全链路。
- 数据抽屉遵循未读计数规则，记录写入后不能强制展开。

### 复用建议
- 适用于“晶体熔化和凝固特点”“相变温度平台观察”等实验。
- 若后续更换为石蜡/冰等材料，可复用本模式中的“相态演化 + 图像平台框选”骨架。

### Runtime mapping
- `Runtime family`: `components/phase-change-bath.js`
- `Required primitives`: `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

## Pattern AH: 玻璃管碘升华-凝华演示台

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验3.html`

### 器材对象
- 玻璃管
- 底部碘晶体
- 顶部冷板 / 冷凝区
- 底部热源
- 紫色气体粒子云画布
- 顶部凝华晶体区

### 核心状态
- `sim = { T, gas, cold, solidLeft, crystals }`
- `records[]`
- `dataCollapsed/unseenRecordCount`
- `currentTask/freeMode/autoPlaying`

### 操作链
1. 在常温下确认玻璃管底部碘为固态。
2. 启动加热，让固态碘直接转化为紫色气体。
3. 启动冷凝并降低温度，使气体在冷板下方直接形成晶体。
4. 记录升华 / 凝华现象并完成步骤判定。

### 读数链
- 温度与冷热操作共同驱动：
  - `solidLeft` 下降表示固态减少；
  - `gas` 上升表示升华增强；
  - `crystals` 上升表示凝华增强。
- 记录表中的温度、气体占比、晶体占比必须来自同一相变状态。

### 关键实现点
- “升华”和“凝华”的可视证据要分离：
  - 加热主要强化紫色气体粒子云；
  - 冷凝主要强化上部晶体生成。
- 冷板不能只是装饰，需要参与凝华趋势计算。
- 气体减少与晶体增加要保持同向耦合，避免出现“晶体增多但气体不减”的假象。
- 自动演示记录链必须使用 `AUTO_RECORD_NOT_PERSISTED` 类断言，确保观察数据真实入表。

### 复用建议
- 适用于“观察升华与凝华”“碘蒸气演示”“冷热区相变对照”等实验。
- 若后续做干冰、樟脑丸等直接相变演示，可复用本模式中的“热源 + 冷板 + 粒子云 + 晶体沉积”结构。

### Runtime mapping
- `Runtime family`: `components/thermal-observation-bench.js`
- `Required primitives`: 无额外 primitives；加载顺序由 `assets/runtime/manifest.js` 统一管理

## Pattern AI: 蒸发因素双载玻片对照台

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验5.html`

### 器材对象
- 参照组载玻片
- 实验组载玻片
- 两侧水滴
- 局部温度计
- 加热火焰
- 摊开液滴控制
- 吹风器 / 风线效果

### 核心状态
- `sim = { massA, massB, running, elapsed, heat, spread, fan, naturalRate, vaporBudgetA, vaporBudgetB, hasDripped }`
- `records[]`
- `dataCollapsed/unseenRecordCount`
- `currentTask/warningStep`

### 操作链
1. 两组先同时滴水，做无干预基线对比。
2. 仅对实验组施加单一条件：
   - 加热；
   - 摊开液滴增大表面积；
   - 吹风增大空气流速。
3. 观察实验组与参照组蒸发速度差异。
4. 记录对比结果并形成“控制变量”结论。

### 读数链
- 各条件通过蒸发速率影响 `massA/massB` 的下降速度。
- `diffAB()` 来自两侧剩余水量 / 蒸发量差异，不可独立伪造。
- 记录表中的条件、耗时、两组剩余量需要与当前 `heat/spread/fan` 状态对应。

### 关键实现点
- 引导模式下每一步只能改变一个因素，不能叠加多个条件破坏控制变量。
- “摊开”要改变液滴形态与表面积，而不是仅修改一个隐藏系数。
- 火焰、风线、液滴摊开形态都应与当前条件联动，保证首屏即可识别实验差异。
- 自动演示应覆盖“基线 -> 单因子切换 -> 记录”并验证记录已持久化。

### 复用建议
- 适用于“蒸发快慢影响因素”“控制变量对照观察”“液滴表面积 / 风速 / 温度效应”实验。
- 若后续扩展到晾衣服变干、酒精挥发等情境，可复用本模式中的“双组对照 + 单因子切换”骨架。

### Runtime mapping
- `Runtime family`: `components/thermal-observation-bench.js`
- `Required primitives`: 无额外 primitives；加载顺序由 `assets/runtime/manifest.js` 统一管理

## Pattern AJ: 量筒-烧杯差量法液体密度测量台

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验12-1.html`

### 器材对象
- 电子天平
- 装盐水烧杯
- 100 mL 量筒
- 视线对准眼睛 / 读数虚线
- 胶头滴管
- 粗倒滑块 / 杯沿吸附位

### 核心状态
- `m1/m2/V/m/rho`
- `eyeAligned/eyeScanned`
- `onScale/beakerDocked`
- `beakerLiquidMl/cylinderMl`
- `dropperLoadedMl/dropperSnapTarget`
- `records[]/analysisOk`

### 操作链
1. 先扫描量筒刻度，确认量程与分度值。
2. 将烧杯放到天平上，记录杯和盐水总质量 `m1`。
3. 把烧杯杯沿贴到量筒口，粗倒到约 `48 mL`。
4. 用胶头滴管补液到 `50 mL`，并在视线齐平时记录体积 `V`。
5. 将剩余盐水烧杯放回天平，记录 `m2`。
6. 计算 `ρ = (m1 - m2) / V` 并形成结论。

### 读数链
- 天平读数来自烧杯当前液体余量状态，不能独立输入：
  - 初次称量得到 `m1`
  - 倾倒 / 滴加后再次称量得到 `m2`
- 量筒读数来自 `cylinderMl`：
  - 粗倒改变主液面；
  - 滴管每次补加微调液面；
  - 视线齐平后才能记录有效 `V`
- 最终密度由 `m = m1 - m2` 与 `V` 同源计算得到。

### 关键实现点
- 烧杯质量减少、量筒体积增加、滴管装液 / 释液必须使用同一套液体守恒状态。
- 量筒读数必须绑定弯月面和视线对齐条件，不能只靠按钮记录。
- “粗倒 + 微调”是该实验的核心器材链，滴管不能被简化为纯数值加减按钮。
- 数据表、分析框和步骤通过条件都要建立在真实 `m1/m2/V` 状态上。

### 复用建议
- 适用于“测量液体的密度”“差量法质量测定 + 量筒读数训练”等实验。
- 若后续换成牛奶、酒精等液体，可复用本模式中的“天平差量 + 量筒精读 + 滴管微调”工作流。

### Runtime mapping
- `Runtime family`: `components/density-measurement-bench.js`
- `Required primitives`: 无额外 primitives；加载顺序由 `assets/runtime/manifest.js` 统一管理

## Pattern AK: 量筒排水法固体密度测量台

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验12-2.html`

### 器材对象
- 电子天平
- 固体样品块（如铝块）
- 100 mL 量筒（含初始液面）
- 视线对准眼睛 / 读数虚线
- 排水浸没区

### 核心状态
- `mass`
- `V1/V2/Vsolid/rho`
- `solidOnScale/solidInCylinder`
- `cylinderMl`
- `eyeAligned`
- `records[]/analysisOk`

### 操作链
1. 观察量筒量程与分度值，并对准初始液面记录 `V1`。
2. 将固体放到天平上，记录质量 `m`。
3. 将固体完全浸没入量筒液体中，液面升高后对准弯月面记录 `V2`。
4. 计算 `V固 = V2 - V1` 与 `ρ = m / V固`。

### 读数链
- 天平质量读数来自固体是否放上秤盘。
- 量筒读数来自浸没前后液面高度变化：
  - 初始体积 `V1`
  - 浸没后总体积 `V2`
- 固体密度由 `m` 与 `V2 - V1` 同源计算。

### 关键实现点
- 固体必须真实进入量筒并改变液面高度，不能只在按钮点击后直接跳出 `V2`。
- 记录 `V1/V2` 前都应检查视线与弯月面最低处齐平。
- 固体未完全浸没时不能作为有效 `V2` 读数来源。
- 自动演示需要覆盖“读初始体积 -> 称量 -> 浸没 -> 读终体积 -> 计算分析”的完整链路。

### 复用建议
- 适用于“测量固体的密度”“排水法求体积”“量筒弯月面读数训练”等实验。
- 若后续扩展到不规则石块体积测量，可复用本模式中的“浸没改液面 -> 差量求体积”链路。

### Runtime mapping
- `Runtime family`: `components/density-measurement-bench.js`
- `Required primitives`: 无额外 primitives；加载顺序由 `assets/runtime/manifest.js` 统一管理

## Pattern AL: 双液体积块浮力比较测力台

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验32.html`

### 器材对象
- 铁架台 + 悬挂横臂
- 弹簧测力计（复用 Pattern F 组件链）
- 连接细线
- 可切换体积金属块（20 / 40 / 60 mL）
- 清水烧杯
- 盐水烧杯
- 数据记录抽屉

### 核心状态
- `selectedVolumeMl`
- `airWeightN/apparentN`
- `activeLiquid`
- `immersionRatio/displacedMl`
- `buoyancyN`
- `records[]/analysisOk`

### 操作链
1. 在器材架选择某个体积块。
2. 将体积块拖入清水或盐水烧杯，并尽量完全浸没。
3. 观察弹簧测力计示数减小，记录一组数据。
4. 切换更大体积块或更高密度液体，再重复记录。
5. 比较同液体不同体积、同体积不同液体下的浮力变化并分析结论。

### 读数链
- `immersionRatio * selectedVolumeMl -> displacedMl`
- `displacedMl + activeLiquid(ρ) -> buoyancyN`
- `apparentN = airWeightN - buoyancyN`
- 记录表中的 `liquidName/volume/buoyancy/apparent` 必须与当前浸没状态同步。

### 关键实现点
- 测力计示数必须复用 Pattern F 的读数 / 弹簧形变同源链，不应单独做一个简化文本读数。
- 浮力大小由“排开液体体积 + 液体密度”共同决定，不能把液体切换写成固定加减常量。
- 体积块提回空气后，应恢复空气中示数，避免残留液体介质状态。
- 结论分析应至少检查三类证据：
  - 清水小体积；
  - 清水大体积；
  - 盐水同体积。

### Runtime mapping
- `Runtime family`: `components/buoyancy-kit.js`
- `Required primitives`: `primitives/snap.js`, `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

### 复用建议
- 适用于“探究浮力大小与哪些因素有关”“比较不同液体中的示数变化”“浮力与排开体积 / 密度关系”实验。
- 若后续扩展到阿基米德原理验证，可在本模式上叠加排液量筒链，与 Pattern G 组合使用。

## Pattern AM: 单液浮力差值测量台（空气 / 完全浸没 / 深度无关）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验31.html`

### 器材对象
- 铁架台 + 悬挂横臂
- 弹簧测力计（复用 Pattern F 组件链）
- 铝块 + 连接细线
- 清水容器 / 液面
- 深度标尺（12.0 cm / 24.0 cm 目标位）
- 数据记录抽屉

### 核心状态
- `airWeightN/apparentN/buoyancyN`
- `currentDepthCm/immersionRatio`
- `inWater/fullySubmerged`
- `hasAirRecord/hasShallowRecord/depthCompared`
- `records[]/analysisOk`

### 操作链
1. 让铝块悬挂在空气中，读取并记录弹簧测力计示数。
2. 向下移动测力计，使铝块完全浸没并对准 12.0 cm 深度标记，记录液中示数。
3. 继续下移至 24.0 cm，保持完全浸没并再次记录。
4. 比较两次液中示数与空气中示数差值，分析浮力大小及其与浸没深度的关系。

### 读数链
- `F浮 = F空气 - F液中`
- 同一铝块在同种液体中完全浸没时，`depth↑` 但 `apparentN` 应基本不变。
- 部分浸入状态只可作为过渡态，不应作为关键结论记录。

### 关键实现点
- 必须明确区分“未浸没 / 部分浸入 / 完全浸没”，只有完全浸没且对准目标深度时才能形成关键记录。
- 深度目标建议做吸附或高亮辅助，避免用户在 12.0 cm / 24.0 cm 上反复微调。
- 测力计示数和弹簧形变必须继续复用 Pattern F 的同源读数链。
- 本 family 已验证可搭配顶部 hint-lamp，专门提示“完全浸没”“对准深度标记”“分析结论口径”等细节。

### Runtime mapping
- `Runtime family`: `components/buoyancy-kit.js`
- `Required primitives`: `primitives/snap.js`, `primitives/measure.js`
- `Bundle source`: `assets/runtime/manifest.js`

### 复用建议
- 适用于“测量物体所受的浮力”“空气-液中示数差值法”“验证完全浸没时浮力与浸没深度无关”等实验。
- 若后续扩展到不同液体或不同体积块比较，可与 Pattern AL 合并为同一浮力 family 的进阶版。

## Pattern AN: 小锤敲击音叉-小球响应台

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/physics-lab-html/assets/runtime/components/hammer-tuningfork-ball.js`

### 器材对象
- 小锤（左侧拖拽/拉回后敲击）
- 音叉（双叉几何 + 可见振动）
- 右侧轻球（受撞后左移）

### 核心状态
- `hammer.x/y/velocity/pullback`
- `fork.body/leftTine/rightTine/contact`
- `fork.oscillation/phase`
- `ball.x/y/velocity`
- `forkBallLock`
- `collisionState`

### 操作链
1. 初始化时，小锤停在音叉左叉外侧，音叉贴靠在小球右侧。
2. 向左拉回小锤，形成 `pullback`。
3. 释放/执行敲击后，小锤先接触左叉并停止于接触面，然后回弹。
4. 音叉振动并把小球向左推动，同时维持贴靠关系。

### 读数链
- 核心观察不是数值表，而是：
  - 小锤是否在接触后回弹
  - 小球是否向左运动
  - 音叉是否仍贴靠在小球右侧
- 可扩展观察值：
  - `pullback`
  - `impactStrength`
  - `forkGap`

### 关键实现点
- 小锤碰撞必须使用接触停止 + 回弹链，不能穿过音叉。
- 音叉贴球必须使用真实接触条几何，不应用 body 包围盒假对齐。
- 音叉的可见振动几何和实际碰撞几何必须同源。
- `0 pullback` 不应凭空生成冲量；极小拉距只应产生极小响应。

### Runtime mapping
- `Runtime family`: `components/hammer-tuningfork-ball.js`
- `Required primitives`: `primitives/snap.js`, `primitives/contact.js`, `primitives/bounce.js`, `primitives/direction.js`, `primitives/attach-lock.js`, `primitives/measure.js`, `primitives/drag.js`
- `Bundle source`: `assets/runtime/manifest.js`

### 复用建议
- 适用于“音叉发声引起轻球偏转”“敲击-接触-回弹-受迫运动”这类声学/振动传递演示。
- 若后续扩展到更完整的实验 33 页面，可在本模式上叠加步骤状态机、自动演示和记录抽屉，而不重写内部碰撞逻辑。

## Pattern AO: 欧姆定律实物电路台（滑动变阻器 + 双表 + 换电阻）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验60.html`

### 器材对象
- 4.5 V 电池组（多节电池盒 + 正负接线柱）
- 单刀开关（底座、接线柱、可闭合刀片）
- 电流表（串联，表盘、指针、红黑接线柱）
- 电压表（并联在定值电阻两端，表盘、指针、红黑接线柱）
- 定值电阻插接位与电阻盒（5 Ω / 10 Ω / 15 Ω）
- 滑动变阻器（陶瓷电阻体、绕线、金属导轨、可拖动滑片）
- 实验导线（按真实串联主回路 + 电压表并联支路绘制）

### 核心状态
- `switchClosed`: 开关是否闭合
- `slider`: 滑动变阻器滑片位置
- `resistorIndex`: 当前插接的定值电阻
- `sliderMoved`: 是否已经通过拖动滑片产生操作证据
- `resistorChanged`: 是否已经换接电阻
- `records`: 记录每组 `R/U/I` 和操作来源

### 操作链
1. 点击单刀开关，使电路由断开变为闭合。
2. 拖动滑动变阻器滑片，改变定值电阻两端电压并观察 A/V 表指针。
3. 在 10 Ω 不变时记录 1.0 V、2.0 V、3.0 V 三组 `U-I` 数据。
4. 点击电阻盒换接 5 Ω / 15 Ω 定值电阻，再拖动滑片把电压调回约 2.0 V。
5. 记录不同电阻下的电流，完成控制变量比较。

### 读数链
- 串联回路近似模型：`U_R = U_supply * R / (R + R_滑)`。
- 电流表读数：`I = U_R / R`。
- 电压表读数：直接显示定值电阻两端电压 `U_R`。
- 数据抽屉同时支持 `I-U` 和 `I-1/R` 两类图像趋势。

### 关键实现点
- 器材必须是本实验专用实物形态，不能复用通用 `drawCircuit()` 符号图。
- 核心进度必须来自真实器材动作：闭合开关、拖动滑片、换接电阻、记录表计读数。
- 步骤检查需同时约束读数目标和操作证据，例如 `sliderMoved`、`switchClosed`、`resistorChanged`。
- 自动演示要通过同一套滑片更新函数驱动读数变化，并在每次记录后断言记录已持久化。

### 复用建议
- 用于欧姆定律、伏安法测电阻、变阻器控制电路、电流表/电压表读数等电学实验样板。
- 若教材要求连接电路或判断串并联，应保留真实接线柱与导线拓扑，另扩展接线吸附/错误接线反馈。

## Pattern AP: 光学光具座与屏幕族（实验 38-43）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验38.html` 至 `初中物理实验43.html`；批量生成脚本 `physics-lab-html/scripts/regenerate_38_68_realism_v2.mjs`，2026-05-25 第三轮补充光具座真实度。2026-05-28 起实验 38 作为手工平面镜样板，由生成脚本保护不覆盖；2026-05-29 起实验 39 作为手工凸透镜样板，由生成脚本保护不覆盖；2026-06-04 起实验 40 作为手工简易照相机样板，由生成脚本保护不覆盖；2026-06-04 起实验 41 作为手工眼睛矫正样板，由生成脚本保护不覆盖；2026-06-05 起实验 42 作为手工白光色散样板，由生成脚本保护不覆盖；2026-06-05 起实验 43 作为手工 RGB 色光混合样板，由生成脚本保护不覆盖。

### 器材对象
- 平面镜成像：白纸、竖直玻璃板与夹座、两支相同蜡烛 A/B、虚像、刻度尺、光屏。
- 凸透镜成像：光具座、蜡烛滑座、凸透镜夹、光屏滑座、焦点与二倍焦距刻度。
- 简易照相机：硬纸盒暗箱、前端凸透镜、半透明纸屏、滑动屏框/镜筒、外部景物蜡烛。
- 眼睛矫正：眼球剖面模型、晶状体、视网膜屏、平行光源、镜片插槽、凹/凸矫正透镜、眼模型下方近视/正常/远视三档滑杆。
- 色散与色光混合：白光源、可调狭缝片、可转动玻璃三棱镜、白屏色带；RGB 三色光源、滑动遮光片、白屏和屏上混色光斑。

### 核心状态
- `scenarioIndex`: 当前操作情境，绑定真实器材动作而不是仅切换文字。
- `records`: 记录每次器材状态和观察结果，不在数据面板显示教材来源。
- `freeMode`: 自由观察模式，用于跳过步骤但保留器材状态更新。

### 操作链
1. 在舞台中拖动或点击实验器材，切换到当前教材要求的观察位置；实验 38 必须拖动蜡烛 A、替身蜡烛 B 或光屏，实验 39 必须拖动蜡烛或光屏，实验 40 必须拖动景物或半透明纸屏，实验 41 必须从默认正常眼拖动眼模型下方三档滑杆，或将凹/凸透镜拖入镜片插槽，实验 42 必须拖动狭缝片、转动三棱镜或拖动白屏上的比较标记，实验 43 必须拖动红/绿/蓝色光源前的遮光片形成混色组合，而不是点击面板按钮推进现象。
2. 通过光屏、替身蜡烛、镜筒、矫正镜片、狭缝片或三棱镜等具体对象触发现象变化。
3. 记录观察结果，数据抽屉只显示器材状态、观察显示、判断或必要数值，不显示教材对应文字。
4. 自动演示按同一器材链路推进，不直接跳结论。

### 读数链
- 平面镜类读物距、像距和光屏承接结果；记录表不保留“操作/现象/教材对应”列。
- 凸透镜类读物距、像距、像的大小和倒正；实验 39 记录表不保留“操作/现象/教材对应”列。
- 简易照相机类读景物距、屏距和成像情况；实验 40 记录表不保留“操作/现象/教材对应”列。
- 眼睛矫正类读眼球模型、矫正镜片和成像位置；实验 41 记录表不保留“操作/现象/教材对应”列。
- 色散类读器材状态、白屏色带显示和红端/紫端偏折判断；混色类读光束重叠区域和颜色结果；记录表不保留“操作/现象/教材对应”列。

### 关键实现点
- 每个光学实验有独立 `scene*` 绘制函数，不能退回通用 `drawOptics()`。
- 实验 38 的玻璃板、白纸、刻度尺和蜡烛比例按课堂桌面器材优先，数据抽屉展开时舞台应为器材留出右侧避让空间。
- 实验 39 的光具座必须显示双轨、刻度、焦点/二倍焦距标记和三件滑座；自动演示要逐步移动蜡烛与光屏，覆盖 `u > 2f`、`u = 2f`、`f < u < 2f`、`u < f` 四组记录。
- 实验 40 的暗箱必须显示硬纸盒外壳、遮光内腔、前端凸透镜、半透明纸屏和可移动外部景物；纸屏距离变化要用清晰/模糊投影反馈调焦状态。
- 实验 41 的眼球剖面必须显示半透明眼球腔、简化角膜前缘、虹膜/瞳孔、内部双凸晶状体、弧形视网膜屏、像点、柔化光束和矫正镜片插槽；默认状态必须是正常眼，不能直接记录步骤 1；近视/正常/远视三档滑杆应放在眼模型下方，滑块小而清晰，晶状体标签不能与三档文字同线重叠；平行光源标签应放在备用透镜停放区之外，避免被凹透镜遮挡；眼球前段不要叠加多层闭合弧线，角膜、瞳孔和晶状体要分层清楚；凹透镜必须画成中部收窄、上下边缘更厚的双凹轮廓，不能用椭圆代替，凸透镜应画成双凸玻璃轮廓，实验台上不标注“凹透镜/凸透镜”名称；光路不要堆叠多条硬线，应使用半透明光束面、弱中心线和淡边缘说明会聚；近视未矫正像在视网膜前，远视未矫正像在视网膜后，加凹/凸透镜后像回到视网膜上。
- 实验 42 的色散台必须显示白光源、狭缝片、三棱镜旋转台和白屏支架；初始状态应为遮光片未取下，不能直接记录步骤 1；点击狭缝片不能直接打开光谱，必须拖动遮光片超过阈值并有可见滑动反馈；自由模式下步骤框应弱化/模糊，表现为不可用状态，状态文案统一为自由调节器材；自由模式下狭缝片应可逆操作，打开后显示向上关闭手柄，拖回遮光片后光束和光谱必须消失；自由模式下拖动三棱镜只能改变三棱镜角度，不能自动打开狭缝或生成光谱；自由模式可适当增加器材自由度，例如允许左右移动白屏，且白屏上的光谱上下展开宽度必须随屏到三棱镜距离变化，屏远色带更宽、屏近色带更窄；白光进入三棱镜前后应用半透明光束面表达，光谱用连续彩色光束面和白屏上的连续色带表达，不用七条硬线或分立色块铺满画面；转动三棱镜时，出射光束方向、白屏色带位置、展开宽度和清晰度必须同步变化；三棱镜转柄只在转动步骤或拖动中出现，不能在比较步骤留下含义不明的黄色辅助点；转柄本身必须是优先命中的可拖动热点，不能只是视觉标记；白屏必须反馈光谱是否清晰，精细调节要有宽容的清晰卡位和吸附，不能要求像素级命中；精细转柄要使用小位移阈值，不能复用遮光片这类大拖动阈值；拖动过程避免使用高开销实时模糊滤镜导致卡顿；未清晰时不能记录展开光谱步骤；进入“比较偏折”步骤时，画布必须同步切到白屏比较场景并显示可拖动比较标记，不能只更新步骤文字而让热点仍停在三棱镜场景；白屏比较标记必须有紫端目标位、对准反馈和记录前校验，学生拖到正确位置后应看到明确反馈；点击分析后实验面板保持展开且不弹出遮罩，小屏下优先折叠数据面板，不能隐藏分析结论；白屏位置要避开数据抽屉，移动端白光源和器材反馈标签不能被裁切，画布内文字标签必须做边界约束；自动演示要慢速经过狭缝片、三棱镜和白屏标记三个器材热点。
- 实验 43 的色光混合台必须显示红/绿/蓝三色光源、每个光源前可拖动的滑动遮光片、柔化色光束、白屏支架和屏上混色光斑；初始状态三块遮光片均关闭，不能直接记录步骤 1；引导模式必须通过拖开红绿、遮回红并拖开蓝、再同时拖开三色遮光片形成红绿黄、蓝绿青、三色近白三组记录；自由模式下步骤框弱化/模糊，允许可逆开合遮光片和左右移动白屏，但不得把自由模式操作自动推进教材步骤；屏上颜色用半透明叠加光斑表达，不用三条硬线或面板按钮替代；数据表只保留器材状态、白屏显示和判断；点击分析后实验面板保持展开且不弹出遮罩，自动演示要慢速拉动遮光片完成三组组合。
- 光具座、屏、透镜、蜡烛必须有可见比例关系，移动对象后现象同步变化。
- 小屏下默认折叠抽屉，舞台器材不能被控制面板遮挡。
- 第三轮优化要求：实验面板不显示“操作/现象”读数块；光具座用双轨、刻度、滑块脚、镜片夹和光屏支架表达真实课堂器材。

### 复用建议
- 适用于几何光学、透镜成像、光屏观察、色光叠加类实验。
- 若继续精修，可优先加入刻度吸附、焦距数值读窗和错误位置反馈。

## Pattern AQ: 静电/磁学/电磁实物台（实验 44-51）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验44.html` 至 `初中物理实验51.html`；二轮批量生成脚本 `physics-lab-html/scripts/regenerate_38_68_realism_v2.mjs`。2026-06-05 起，实验 44 为手工静电样板页，已加入生成脚本保护名单。

### 器材对象
- 静电：塑料棒、毛皮垫、碎纸屑托盘、验电器、接地导线/接地夹。
- 磁场：条形磁铁、小磁针、铁屑、透明板、轻敲棒。
- 电生磁：直导线、螺线管、铁芯、电池组、开关、小磁针。
- 电动机/发电机：U 形磁铁、导体棒、导轨、线圈、支架、换向器、灵敏电流计。

### 核心状态
- `scenarioIndex`: 摩擦、吸引纸屑、接触验电器、接地放电、闭合、反接、插入铁芯、切割磁感线等动作阶段。
- `records`: 记录方向、偏转、运动或发电现象。
- `hintLamp`: 用于强调通电、带电、磁场增强、感应电流出现等状态。

### 操作链
1. 先完成真实器材动作，例如用塑料棒在毛皮上往复摩擦、闭合开关、移动小磁针或插入磁铁。
2. 再观察纸屑、验电器金属箔、小磁针、导体棒、电流计等可见响应。
3. 静电样板必须允许把带电棒拖到纸屑上方、拖到验电器金属球、再拖接地夹放电复位。
4. 改变方向变量：反接电源、翻转磁铁、反向移动线圈或改变手摇方向。
5. 记录正反向现象，形成“方向有关”的结论证据。

### 读数链
- 静电看吸引/张角/放电复位。
- 磁场看铁屑密集区和小磁针 N 极方向。
- 电磁看电流方向、磁场方向、导体棒受力方向或电流计偏转方向。

### 关键实现点
- 静电实验不得用横向拖动切换场景代替器材动作；必须有塑料棒、毛皮、纸屑托盘、验电器和接地夹的独立热点。
- 静电吸附、金属箔张开这类过程证据应锁存到下一真实动作，不能因带电棒离开纸屑托盘就立即清零；接地夹只让验电器金属部分放电闭合，不应把绝缘塑料棒和贴附纸屑一起清零，只有重新摩擦、棒本身放电操作或步骤重置才能改变棒/纸屑状态。
- 纸屑被吸起后应贴附在带电棒表面并随棒整体移动，不应继续画成棒下方漂浮散点云。
- 实验 45 的磁场观察台必须显示透明板、板下条形磁铁、铁屑纹理、轻敲棒和可拖动小磁针；步骤推进来自拖动轻敲棒点触透明板、拖动小磁针到测点、拖动条形磁铁翻转磁极，不能用横向拖动画布切换三张图。
- 铁屑初始应散乱，轻敲后才沿磁场分布排成弧形纹理；小磁针 N 极方向应由所在位置和磁铁 N/S 极决定，磁铁翻转后指针方向同步反向。
- 磁学和电磁页面必须有本实验器材，不允许用一套磁铁符号简单换标题。
- 小磁针、铁屑、线圈、电流计等响应对象要随情境改变可见状态。
- 自动演示要显式经过“改变方向”步骤，避免只展示单一正例。
- 二轮优化要求：条形磁铁、螺线管、U 形磁铁、线圈、灵敏电流计和电源开关都按实物台比例绘制，自动演示每步停顿足够观察指针/方向变化。

### 复用建议
- 适用于磁场方向、电生磁、电动机、发电机、电磁感应等实验。
- 后续可扩展为可拖动小磁针、磁铁插拔速度读数和电流计过零动画。

## Pattern AR: 热学与能量转化实物台（实验 52-59）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验52.html` 至 `初中物理实验59.html`；批量生成脚本 `physics-lab-html/scripts/regenerate_38_68_realism_v2.mjs`，2026-05-25 第三轮补充机械/热学真实度。

### 器材对象
- 热机/内能：试管、水、橡皮塞、酒精灯、铁架台、透明汽油机模型。
- 做功改变内能：金属筒、摩擦绳、温度贴、塞子。
- 电能转化：低压电源、小电动机、风扇、电热丝、温度计。
- 机械能/效率：轨道小球、滑轮组、弹簧测力计、钩码、刻度尺。
- 比热容：烧杯、水、食用油、电加热器、温度计、天平、秒表。

### 核心状态
- `scenarioIndex`: 加热、摩擦、释放、提升、通电、转动等过程阶段。
- `records`: 记录温度、速度、高度、做功或效率类观察。
- `progress`: 用三步任务链确保现象从准备到结果逐步出现。

### 操作链
1. 先建立实验条件，例如点燃酒精灯、接通电路、把小球拉到高处或组装滑轮组。
2. 执行真实动作，例如继续加热、快速摩擦、释放小球、匀速提升或同时加热两杯液体。
3. 观察橡皮塞弹出、温度升高、风扇转动、速度变化、测力计读数或热机冲程。
4. 数据抽屉记录能量来源、转化去向或测量量，不显示教材对应文字。

### 读数链
- 温度类读温度计或温度贴变化。
- 机械类读高度、速度、测力计、距离和效率。
- 热机类读冲程顺序和活塞/飞轮状态。

### 关键实现点
- 能量转化必须有能量输入和可见输出两个对象，不只画箭头。
- 实验 57 机械效率保留弹簧测力计、滑轮组、钩码和 `Gh/Fs` 读数关系。
- 对加热页面要保留低压/防护语义，不加入真实危险操作提示之外的网络或外部调用。
- 第三轮优化要求：机械效率、机械能和热学实验要有实验桌、支架、滑轮、钩码、绿色弹簧测力计、轨道、烧杯温度计和透明热机模型等可辨认器材，不共享抽象能量图。

### 复用建议
- 适用于热机、做功改变内能、电热、电动机能量转化、机械效率和比热容对照。
- 后续可加入温度曲线和匀速拉动吸附，让测量类页面接近实验 60 的操作颗粒度。

## Pattern AS: 电路测量/连接/安全用电实物台（实验 61-67）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验61.html` 至 `初中物理实验67.html`；二轮批量生成脚本 `physics-lab-html/scripts/regenerate_38_68_realism_v2.mjs`

### 器材对象
- 电流/电压测量：电池组、开关、小灯泡、电流表、电压表、导线。
- 电阻测量：滑动变阻器、被测电阻、双表、接线柱。
- 串并联规律：两只小灯泡、总开关、支路开关、多位置表计。
- 焦耳定律：透明容器、电阻丝、温度计、滑动变阻器。
- 安全用电：模拟火线/零线、保险丝、三孔插座、接地线、低压用电器。

### 核心状态
- `scenarioIndex`: 串联/并联、试触/量程、滑片调整、过载/接地等阶段。
- `records`: 记录读数、接法和安全判断。
- `dataPanel`: 只展示记录/图表，不展示教材对应文字。

### 操作链
1. 按教材接法建立电路：电流表串联、电压表并联、串并联支路或低压家庭电路模型。
2. 执行试触、选量程、闭合开关、调滑片、移动电表位置或模拟过载。
3. 读取表针、灯泡亮灭、温度升高、保险丝熔断或接地保护状态。
4. 自动演示必须保留风险接法的短时演示与立即断开语义。

### 读数链
- 表计类读电流、电压、量程和正负接线柱。
- 电阻类读 `R=U/I` 多次测量平均。
- 串并联类读电流分布、电压分配和支路独立性。
- 安全用电类读火线开关、保险丝和接地保护结论。

### 关键实现点
- 61-67 不应复用实验 60 的欧姆定律完整台面，但可以复用电表、开关、滑变和导线绘制语法。
- 错误接法要作为短时教学状态，不能停留在危险通电最终态。
- 控制抽屉和数据抽屉在桌面/移动视口都不能遮挡表盘、灯泡和关键接线区。
- 二轮优化要求：使用实物接线板、电池组、刀闸开关、灯泡、电表、滑动变阻器、保险丝/插座等专用对象，不再用通用电路框图。
- 第三轮优化要求：实验面板取消“操作/现象”读数块，批量页的状态切换来自实验台画布拖动；实验 60 保留开关、滑动变阻器、电阻盒的真实热点操作。

### 复用建议
- 适用于电流表、电压表、伏安法、串并联、焦耳定律和生活用电模型。
- 后续可按实验 60 标准扩展接线吸附、错误接线诊断和真实表盘读数刻度。

## Pattern AT: 新能源模型制作台（实验 68）

来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验68.html`；二轮批量生成脚本 `physics-lab-html/scripts/regenerate_38_68_realism_v2.mjs`

### 器材对象
- 太阳能电池板、小电机、风扇叶片、LED、储能模块、导线、输出读数面板。

### 核心状态
- `scenarioIndex`: 弱光、强光、储能运行三种模型工作状态。
- `records`: 记录光照角度、输出电压、风扇转速和储能表现。

### 操作链
1. 弱光照射太阳能板，观察 LED 与小电机输出较弱。
2. 调整太阳能板角度增强光照，观察输出读数和转速提高。
3. 接入储能模块后短时遮光，观察模型仍可运行一段时间。

### 读数链
- 光照角度和强度影响输出电压。
- 输出电压驱动电机转速和 LED 亮度。
- 储能模块让输出在遮光后短时维持。

### 关键实现点
- 页面必须体现“设计并制作模型”，器材对象要比单纯能源流程图更具体。
- 可复用电学 Pattern AS 的电源、导线和读数面板，但主视觉必须是太阳能板/模型结构。

### 复用建议
- 适用于新能源模型、太阳能小车、小风扇、储能演示等跨学科实践页面。

## Drawer Pattern (panel/results)

来源：高中1、2 的 `dock` 实现。

### 能力要求
- 可拖动：通过头部拖动，按钮区不触发拖拽
- 可抽拉：折叠/展开 body
- 可吸边：靠近边缘自动吸附
- 可置顶：交互即提升 z-index
- 小屏兼容：必要时从自由漂浮切换为底部抽屉

### 状态建议
- `panelCollapsed/resultsCollapsed`
- `dockPos = {x,y}`
- `zOrder`
- `dragging`

### 关键函数模板
- `bringToFront(which)`
- `setDockPos(el, x, y)`
- `snapDockToEdges(el)`
- `makeDockDraggable(el, head, kind)`

## Extended Source Map (all scanned html)

下列页面已在全量扫描中标记为器材/实验对象较完整，可优先复用：

- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验1.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验2.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验3.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验4.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验5.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验6.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验7.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验8.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验9.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验10.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验11.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验12-1.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验12-2.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验13.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验14.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验15.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验16.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验17.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验18.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验19.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验20.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验21.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验22.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验23.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验24.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验25.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验26.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验27.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验28.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验29.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验30.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验31.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验32.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/高中物理实验1.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/高中物理实验2.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/高中物理实验3.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/高中物理实验6.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/高中物理实验7.html`

## Composition Hints

- 电学实验：导电性判断用 Pattern A；欧姆定律/伏安法/滑变控制用 Pattern AO + Drawer Pattern + S1/S3（步骤状态机/自动演示）
- 光学实验 38-43：用 Pattern AP + Drawer Pattern；优先保留光具座、光屏、透镜/玻璃板/三棱镜等真实对象
- 静电/磁学/电磁实验 44-51：用 Pattern AQ + Drawer Pattern；操作证据来自摩擦、闭合开关、移动小磁针、反接、插拔磁铁或手摇
- 热学/能量/机械效率实验 52-59：用 Pattern AR + Drawer Pattern；必须有输入能量器材和可见输出对象
- 电路测量/生活用电实验 61-67：用 Pattern AS + Pattern AO 的表计绘制语法 + Drawer Pattern；错误接法只做短时教学状态
- 新能源模型实验 68：用 Pattern AT + Pattern AS 的读数面板；模型结构优先于流程图
- 温度测量类：Pattern AF + Drawer Pattern
- 晶体相变类：Pattern AG + F4（时间演化）
- 升华 / 凝华类：Pattern AH + F4（时间演化）
- 蒸发因素对照类：Pattern AI + F4（时间演化） + Drawer Pattern
- 力学测量：Pattern C 或 D + F5（记录/图像）
- 密度测量类：Pattern AJ / AK + Pattern C + F5（记录 / 分析）
- 受力读数类：Pattern F + F3（器材操作）+ Drawer Pattern
- 热学过程：Pattern B + F4（时间演化）
- 单液浮力差值类：Pattern AM + Pattern F（测力计）+ Drawer Pattern + hint-lamp
- 浮力/排液类：Pattern G / AL + Pattern F（测力计）+ F5（数据图像）
- 声学/振动传递类：Pattern AN + Drawer Pattern + F3（器材拖拽/碰撞）
- 复杂综合实验：F6（SVG/DOM/Canvas 混合）+ Drawer Pattern

## Accumulation Protocol

When creating new apparatus/object elements that are not directly reusable:

1. Add a new `Pattern <letter/name>` section in this file.
2. Include these fields:
   - Source file
   - Apparatus objects
   - State variables
   - Operation chain
   - Reading chain
   - Key implementation points
   - Reuse recommendation
3. If it defines a new family, also update `references/template-catalog.md`.

## Integration Checklist

- 是否先选定实验需要的器材模式（A-AN）？
- 每个任务是否包含“器材动作”而非仅数值阈值？
- 面板是否为可移动抽屉，且不遮挡核心器材区？
- 自动演示是否重放真实“器材操作链”？
- 结论是否由器材状态与读数链推导？
- 是否优先复用了 Pattern F 的测力计组件链（而非重写简化版）？
- 对液体实验，是否满足 Pattern G 的溢流守恒（烧杯/量筒同步）？
- 器材布局是否做了防重叠检查（尤其烧杯、量筒、测量器具）？
