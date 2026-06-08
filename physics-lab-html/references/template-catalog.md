# Template Catalog (All HTML Scan, excluding `备份 20260113`)

本目录基于当前工作目录全部 HTML 全量扫描生成（共 85 个），用于指导 `physics-lab-html` 在生成阶段选用可复用模板族，而不是临时拼接。

## Scan Snapshot

- Scanned files: 85
- Excluded path: `备份 20260113`
- Guided-lab skeleton (`task-card + toolbar + feedback`): 76
- Drawer-capable files: 11
- Pointer drag input: 16
- Canvas simulation: 43
- SVG usage: 12

## Runtime Integration Rule

- 模板层只负责页面骨架、shell 状态和 runtime 插槽，不在模板里重写器材组件内部逻辑。
- 运行时 bundle 由 `assets/runtime/manifest.js` 选择并排序，再内联到 `assets/physics-lab-template.html` 的 `physicsRuntimeBundle` 插槽。
- `references/apparatus-patterns.md` 只负责记录“模式 -> runtime family -> required primitives”，不承担加载顺序。
- 当前已直接 runtime 覆盖的器材 family：
  - `Pattern AB` -> `components/boiling-curve-lab.js`
  - `Pattern A` -> `components/conductivity-bridge.js`
  - `Pattern AC` -> `components/elastic-plastic-bench.js`
  - `Pattern AD` -> `components/magnetic-pole-bench.js`
  - `Pattern AE` -> `components/mass-volume-analysis.js`
  - `Pattern B` -> `components/heat-conduction-race.js`
  - `Pattern H` -> `components/mixture-cylinder.js`
  - `Pattern Y` -> `components/side-hole-jet.js`
  - `Pattern Z / Pattern AA` -> `components/liquid-pressure-manometer.js`
  - `Pattern AG` -> `components/phase-change-bath.js`
  - `Pattern J` -> `components/scale-reading.js`
  - `Pattern AF` -> `components/thermometer-reading.js`
  - `Pattern K` -> `components/stopwatch-timing.js`
  - `Pattern L` -> `components/speed-measurement.js`
  - `Pattern G` -> `components/overflow-cylinder.js`
  - `Pattern AL / Pattern AM` -> `components/buoyancy-kit.js`
  - `Pattern C` -> `components/balance-scale.js`
  - `Pattern F` -> `components/spring-scale.js`
  - `Pattern AN` -> `components/hammer-tuningfork-ball.js`

## Core Families

## F0. Middle-school Experiment 35 Shell (default for new middle-school labs)

### Structure
- `#spectrum` and `.task-card` share the same max-width.
- `#stage` uses a dark interaction surface with minimal top-left HUD.
- `.lab-area` contains the main canvas apparatus scene.
- Control and data panels use movable/collapsible docks with unread data notice behavior.
- Bottom toolbar keeps reset, auto-demo, and free-mode controls.
- Completion uses toast, checkmark, modal, and the explanation block below the stage.
- Web Audio hooks are available for experiments with audible phenomena; keep browser gesture-gating behavior.

### Best source
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验35.html`

### Use when
- 默认用于后续初中物理实验 HTML 生成或重构。
- 只替换实验器材、交互逻辑、记录表/图表、声音合成、自动演示脚本和结论文本。
- 如实验需要特殊布局，先保留 `35` 的视觉语法，再局部调整。

### 2026-05-25 实验 38-68 第三轮约束
- 数据面板只显示记录/图表，不显示“教材对应”来源文字。
- 实验面板只保留记录、分析等必要命令，不放“操作/现象”读数块。
- 批量页不得使用“操作器材”按钮替代实验动作；核心交互优先发生在实验台器材或画布上。
- 光学页面优先使用真实光具座、刻度轨、滑块底座、镜片夹、蜡烛和光屏支架。
- 机械/热学页面优先使用实验桌、铁架台、滑轮、钩码、绿色弹簧测力计、轨道、烧杯温度计和透明热机模型。
- 当前验收基线：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/visual-regression-output-exp38-68-realism-v3-final-20260525/report.json`。

## F1. Guided Lab Skeleton (base frame)

### Structure
- `#spectrum`
- `.task-card` (`taskStep/taskText/taskHint + progress dots`)
- main stage (`#stage` or `#canvas`)
- `.toolbar` (`reset/auto/free`)
- feedback (`toast/checkmark/modal`)

### Best sources
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/三原色光交互版-模板.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/蝙蝠穿越铃铛交互版.html`

### Use when
- 几乎所有中学实验互动页作为默认骨架。

## F2. Drawer Workspace Template (movable/collapsible/edge-snap)

### Structure
- 控制抽屉 + 结果抽屉（可拖动、可折叠、可置顶）
- 抽屉头部手柄 + body collapse
- 吸边与 z-index 管理

### Best sources
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/高中物理实验1.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/高中物理实验2.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/高中物理实验6.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/高中物理实验7.html`

### Reusable primitives
- `bringToFront`
- `setDockPos`
- `snapDockToEdges`
- `makeDockDraggable`
- `setPanelCollapsed / setResultsCollapsed`

### Use when
- 需要同时呈现器材区 + 数据区 + 图像区，且存在遮挡风险。

## F3. Apparatus-First Drag/Drop Template

### Structure
- 器材架（待测件）
- 实验核心器材（目标区/托盘/接线口）
- 拖拽吸附与替换逻辑

### Best sources
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验8.html`（导电性桥接）
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验10.html`（托盘天平）
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/高中物理实验1.html`（卡尺双爪）

### Use when
- 实验核心在“器材操作过程”而非单纯参数调节。

## F4. Time-Evolution Animation Template (RAF loop)

### Structure
- `requestAnimationFrame` 驱动过程
- 每帧更新状态（进度/温度/位置/光线等）
- 阈值触发阶段性事件

### Best sources
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验9.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/高中物理实验2.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/双缝干涉观测与否交互版.html`

### Use when
- 需要展现“随时间演变”的实验现象。

## F5. Measurement + Data + Graph Template

### Structure
- 器材操作 -> 读数 -> 表格记录 -> 图像拟合/比较
- 计算按钮触发二级结论

### Best sources
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/高中物理实验2.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/高中物理实验3.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验11.html`

### Use when
- 教学目标包含“测量法 + 数据处理 + 规律验证”。

## F6. Hybrid Render Template (SVG + DOM + Canvas)

### Structure
- SVG 画结构轮廓（线路/轨迹）
- DOM 放器材（按钮、可拖对象）
- Canvas 渲染动态图/波形/统计图

### Best sources
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验8.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/高中物理实验2.html`
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/海底气泡沉船交互版.html`

### Use when
- 同时需要结构清晰度与动态渲染性能。

## F7. Layout Safety + Conservation Template

### Structure
- 器材布局安全区（防重叠）与重排函数（`layoutApparatus`）
- 受力读数器具优先复用（测力计组件链）
- 液体守恒链（满杯溢流 -> 量筒累计）

### Best sources
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/牛顿第三定律演示.html`（测力计组件）
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验13.html`（防重叠 + 溢流守恒）

### Use when
- 需要同时保证“真实器材摆放合理”与“液体/体积读数守恒逻辑”。

## State and Flow Templates

## S1. Guided-step FSM

### Pattern
- `tasks[]` with `text/hint/check()`
- `setStepUI`
- `tryPassStep`
- `successCooldown`

### Sources
- `初中物理实验1-20` 系列
- `高中物理实验1-8` 系列

## S2. Mode switch

### Pattern
- `freeMode`: 取消步骤门禁，保留实验机制
- `autoPlaying`: 禁用户冲突输入
- `completed`: 防重复通关逻辑
- 自由模式退出需显式触发（点击自由模式切换按钮）；`步骤重置`在自由模式下仅重置场景/步骤数据，不隐式退出自由模式
- 当实验适合开放探索时，自由模式可放宽器材位置/参数范围、允许“自定义”记录与更宽分析入口；但这些自由模式记录不得破坏教材记录判定，退出自由模式后应恢复教材默认目标位/参数

### Sources
- 几乎所有 GuidedLab 页面

## S3. Auto-demo orchestrator

### Pattern
- `async autoDemo(){ try { ... } catch { ... } finally { unlock } }`
- 分段 sleep 与动作回放
- 结束后恢复按钮/输入
- 每一步包含“动作 -> 停顿观察 -> 记录/判定”节奏
- 自动演示中使用 `recalcProgress` 或等价机制，确保能走到最后一步
- 记录类步骤必须做“每步前后记录长度断言”：
  - `beforeLen = records.length`
  - 执行动作与确认后断言 `records.length > beforeLen`
  - 失败抛出显式错误码（如 `AUTO_RECORD_NOT_PERSISTED`）并快速恢复

### Sources
- `高中物理实验2.html`
- `初中物理实验10.html`
- `初中物理实验9.html`
- `初中物理实验4.html`

## S4. Progressive-disclosure UI

### Pattern
- 首屏只保留必要器材与必要控制。
- 次要模块（如结论选择、高级读数）仅在相关步骤显示。
- 重置后恢复到“次要模块隐藏”的首屏状态。

### Sources
- `/Users/lx100/projects/AI-shifu/relativity-light-clock-lab.html`

## S5. Single-stage Minimal Scene

### Pattern
- 主区仅保留一个核心实验舞台（避免双卡片并列）。
- 次要信息使用角落迷你看板（例如右下角 2 条能量条）。
- 主区文本最少化，只保留状态行和 1-2 个关键读数。
- 高级读数/表格放在折叠抽屉中，按需查看。
- 底部解释区可保持课程统一风格（标题 + 要点列表）。

### Sources
- `/Users/lx100/projects/AI-shifu/relativity-emc2-intuition-lab.html`

## S6. Data Drawer Unseen-Count Notice

### Pattern
- 数据记录后不自动展开数据抽屉。
- 数据抽屉折叠时，若有新记录，在标题处显示醒目闪烁红点并展示未读组数。
- 展开数据抽屉时，红点与计数立即清零。
- 折叠后如再有新记录，重复触发红点计数提醒。
- 点击“分析”生成结论后，实验面板不得自动折叠，也不得立即用完成弹层遮住结论；结论文本必须保持可见，不能被完成态抽屉逻辑隐藏。小屏下若实验面板与数据面板冲突，优先折叠数据面板。

### Recommended state/functions
- `dataCollapsed`
- `unseenRecordCount`
- `refreshDataNotice()`
- `addRecord()`（折叠时递增未读）
- `setDataCollapsed(on)`（展开时清零未读）
- `clearData()`（清零未读）

### Sources
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验15.html`

## S7. Boiling Lab Drawerized Control

### Pattern
- 保持器材主舞台优先，避免固定侧栏长期占位。
- 控制抽屉承载：
  - 实时过程读数（温度、加热状态、稳定沸腾时长、采样数）
  - 温度-时间图像
  - 即时操作按钮（点火/熄火、确认观察）
- 数据抽屉仅承载记录历史，不放过程实时读数。
- 自动演示期间允许用户拖动控制/数据抽屉，并在必要时重定位避免遮挡关键读数。

### Sources
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验4.html`

## S8. Elastic vs Plastic Drag Bench

### Pattern
- 三材料并列（橡皮筋、弹簧、橡皮泥）+ 顶部挂点 + 目标拉伸虚线。
- 仅手柄可拖拽，拖拽位移通过 `stiffness` 映射到材料伸长量。
- 松手后按材料分支：
  - 弹性材料：阻尼回弹到接近初始长度；
  - 塑性材料：保留残余形变长度。
- 步骤判定链：拉伸阈值 + 松手后回弹/不回弹状态 + 确认观察。
- 自动演示必须复用同一拖拽链（开始拖拽 -> 分帧拖动 -> 松手 -> 等待稳定），并做每步记录断言。

### Sources
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验6.html`

## S9. Magnetic pole interaction bench

### Pattern
- 一块活动磁铁 + 一块滑轨目标磁铁 + 可选铁钉散点区。
- 真实磁极作用层始终开启：
  - 同极相斥
  - 异极相吸
  - 不因引导模式而关闭真实物理响应
- 引导模式只限制步骤判定和记录，不限制真实器材相互作用。
- 异极进入吸附阈值后，切换到显式 `snapLock` 稳定锁定态，避免吸附后在 RAF 刷新中持续抖动。
- 锁定态解除条件必须明确：翻转磁极、显著拉开距离、离开作用区等。
- 若步骤包含“吸附铁钉计数”，优先使用确定性散点布局，避免自动演示受随机布局影响。

### Sources
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验7.html`

## S10. Mass-volume graph bench

### Pattern
- 单舞台同时呈现：
  - 样品块/电子天平/体积滑尺
  - `m-V` 图像画布
- 流程闭环：
  - 选择材料
  - 调体积
  - 记录质量点
  - 切换材料再记录
  - 点击拟合得出结论
- 记录与图像同源：
  - 表格新增一条，图像同步新增一个散点
  - 拟合线只能建立在真实记录点基础上
- 自动演示需要复用真实滑尺拖动链和记录链，并对每一步记录做长度断言

### Sources
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验11.html`

## S11. Ruler drag-read bench

### Pattern
- 主舞台使用刻度尺作为核心器材，不把测量流程退化成按钮操作。
- 通过拖动物体完成零刻度对齐，通过拖动竖向虚线/滑标完成末端读数。
- 零刻度吸附和末端读数吸附都提供轻量反馈，但不替代严格刻度判定。
- 放大窗显示局部尺面、虚线、末端位置和最终读数；分度规则必须与外部刻度尺一致。
- 低价值说明文字不应压在放大窗内部，避免影响局部尺面可读性。

### Sources
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验16.html`

## Interaction Templates

## I1. Pointer-first drag

### Pattern
- `pointerdown/move/up/cancel`
- `setPointerCapture`
- stage bounds clamp

### Sources
- `高中物理实验1.html`
- `高中物理实验2.html`
- `初中物理实验8.html`

## I2. Touch compatibility fallback

### Pattern
- `touchstart/move/end` fallback or guards
- Stage uses `touch-action: pan-y pinch-zoom` so a phone user can scroll the page.
- Canvas uses `touch-action: pan-y pinch-zoom` for mostly horizontal/tap interactions; for vertical/two-axis apparatus dragging, Canvas may use `touch-action: none` only with an empty-area page-pan fallback.
- Small required gesture handles may use `touch-action: none`; apparatus drag is captured by pointer handlers after the hit target is verified.
- `gesturestart` prevent default when needed

### Sources
- `高中物理实验1.html`
- `高中物理实验2.html`
- `初中物理实验3.html`

## Recent Accumulated Apparatus Patterns (2026-02-26)

已新增并验证以下器材模式（详见 `references/apparatus-patterns.md`）：

- Pattern H：双液混合量筒（分子间隙观察）  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验14.html`
- Pattern I：金属块吸附 + 弹簧测力计（分子引力观察）  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验15.html`
- Pattern J：刻度尺零刻度对齐测长  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验16.html`
- Pattern K：摆球周期 + 秒表测时  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验17.html`
- Pattern L：轨道小车速度测量（s/t）  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验18.html`
- Pattern M：施力形变对比（弹簧/海绵）  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验19.html`
- Pattern N：施力前后速度状态变化  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验20.html`
- Pattern O：闪电列车同时性实验（双参考系同屏）  
  来源：`/Users/lx100/projects/AI-shifu/einstein-relativity-level-1-simultaneity.html`
- Pattern P：飞船光钟时间膨胀（双参考系光钟）  
  来源：`/Users/lx100/projects/AI-shifu/relativity-light-clock-lab.html`
- Pattern Q：单舞台极简加速轨道 + 迷你能量看板  
  来源：`/Users/lx100/projects/AI-shifu/relativity-emc2-intuition-lab.html`
- Pattern R：滑动摩擦力测量台（木块 + 接触面 + 弹簧测力计）  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验21.html`
- Pattern S：弹簧测力计基础测力（调零 + 挂重物）  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验22.html`
- Pattern T：二力平衡拉环对比  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验23.html`
- Pattern U：急停惯性对比车  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验24.html`
- Pattern V：阻力跑道滑行距离对比  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验25.html`
- Pattern W：杠杆平衡力矩台  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验26.html`
- Pattern X：压强小桌 + 海绵压痕  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验27.html`
- Pattern Y：侧孔喷流（器壁压强）  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验28.html`
- Pattern Z：液体内部压强探头（同深度方向对比）  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验29.html`
- Pattern AA：液体压强控制变量槽（深度 + 密度）  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验30.html`
- Pattern AD：磁铁滑轨对极演示台（观察磁现象）  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验7.html`
- Pattern AE：质量-体积测量与 m-V 图像分析台  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验11.html`

## Recent Optimization Sync (2026-03-05)

本轮已对 Pattern `R~AA` 完成“真实模拟强化版”同步（非新增 pattern，属于同条目优化）：

- R：增加配重、拉绳、匀速拉动反馈与测力计刻度指针细节
- S：增加调零-悬挂链约束（改质量后必须重挂）
- T：增加双测力计 + 拉环偏移联动
- U：增加慢停摩擦段/急停挡块与“发车速度绑定记录”
- V：增加斜面释放端与跑道绑定读数链
- W：增加杠杆刻度挂点与倾角联动
- X：增加压放前置与海绵凹陷量反馈
- Y：增加孔深锁定与“改深度需重开孔”约束
- Z：增加方向锁定与“改方向需重旋转探头”约束
- AA：增加液体切换确认与密度-深度读数链强化；关键深度改为严格刻度命中，并补探头整刻度吸附/点击深度尺落点与 U 形管液柱差增强显示

对应共享组件优化详见：`references/apparatus-patterns.md` 中 `Pattern R~AA Shared Component Notes (2026-03-05 优化同步)`。

另已同步优化：

- J：从“零刻度对齐 + 读数窗”升级为“拖动物体零刻度吸附 + 拖动虚线读数 + 同分度局部尺面放大窗 + 低价值文案剔除”

## Recent Accumulated Apparatus Patterns (2026-05-25)

本轮为初中物理实验 38-68 的器材真实度重制新增以下族级模式。详细器材链、状态链和复用建议见 `references/apparatus-patterns.md`，教材对应见 `references/experiment-38-68-textbook-map.md`。

二轮同步：`physics-lab-html/scripts/regenerate_38_68_realism_v2.mjs` 将 38-59、61-68 升级为精简面板、慢速自动演示、移动端器材上移放大和更细的实物器材绘制库。最终验证见 `visual-regression-output-exp38-68-realism-v2-final2-20260525/report.json`。

2026-05-28 补充：实验 38 已升级为平面镜成像手工样板，采用白纸、竖直玻璃板、A/B 蜡烛、虚像和光屏检验的专用器材。

2026-05-29 补充：实验 39 已升级为凸透镜成像手工样板，采用光具座、蜡烛滑座、凸透镜夹、光屏滑座和焦点/二倍焦距刻度；`regenerate_38_68_realism_v2.mjs` 已保护实验 38、39、60，避免批量重跑覆盖手工样板。

2026-06-04 补充：实验 40 已升级为简易照相机手工样板，采用硬纸盒暗箱、前端凸透镜、半透明纸屏、滑动屏框和外部景物蜡烛；`regenerate_38_68_realism_v2.mjs` 已保护实验 38、39、40、60，避免批量重跑覆盖手工样板。最终验证见 `visual-regression-output-exp40-single-v6-20260604/report.json`。

2026-06-05 补充：实验 41 已升级为近视眼和远视眼矫正手工样板，采用眼球剖面模型、视网膜屏、平行光源、镜片插槽、可拖动凹/凸透镜和眼模型下方近视/正常/远视三档滑杆；默认正常眼，不能直接记录步骤 1，必须先拖动滑杆形成近视或远视；眼睛应有半透明眼球腔、简化角膜前缘、虹膜/瞳孔、内部双凸晶状体和弧形视网膜，眼球前段避免多层闭合弧线重叠，光路应使用柔化光束面；凹透镜必须使用中部收窄的双凹轮廓，凸透镜使用双凸玻璃轮廓，镜片本体不标“凹透镜/凸透镜”；晶状体标签应避开滑杆三档文字，平行光源标签应避开备用凹透镜；`regenerate_38_68_realism_v2.mjs` 已保护实验 38、39、40、41、60，避免批量重跑覆盖手工样板。最终验证见 `visual-regression-output-exp41-eye-front-clean-v1-20260605/report.json`。

2026-06-05 补充：实验 42 已升级为白光色散手工样板，采用白光源、可调狭缝片、可转动玻璃三棱镜、白屏色带和桌面支架；初始状态为遮光片未取下，不能直接记录步骤 1，点击狭缝片不能直接出光谱，必须拖动遮光片超过阈值；自由模式下步骤框弱化/模糊并表现为不可用，状态统一为自由调节器材；自由模式下狭缝片可逆，打开后可向上拖回遮光片关闭光路；自由模式下拖动三棱镜不能自动打开狭缝或生成光谱，只有真实打开狭缝后才显示光路；自由模式允许白屏左右移动等额外器材自由度，且白屏光谱上下展开宽度必须随屏距变化，屏远色带更宽、屏近色带更窄；三棱镜和白屏色带标记也通过拖动调节；光路使用柔化白光束和彩色光束面，避免七条硬线堆叠；白屏光谱必须是连续渐变色带，不能画成分立色块；转动三棱镜时，出射光束方向、白屏色带位置、展开宽度和清晰度同步变化；三棱镜转柄只在转动步骤或拖动时显示，且转柄本身必须可直接拖动，不能只是视觉标记；白屏必须反馈光谱是否清晰，精细调节采用宽容卡位和吸附，不要求像素级命中；转柄使用小位移阈值，拖动过程避免高开销实时模糊滤镜，未清晰时不能记录展开光谱步骤；进入“比较偏折”步骤时必须同步切换画布场景并显示白屏比较标记，不能只推进步骤卡；白屏比较标记必须有明确紫端目标位和对准反馈，未对准时不能记录比较步骤；点击“分析”后实验面板必须保持展开，且不立刻弹出遮罩挡住分析结论；小屏下若数据面板会遮住结论，则完成态优先折叠数据面板；白屏位置需避开数据抽屉，移动端白光源和反馈标签不能裁切，Canvas 标签需做边界约束；`regenerate_38_68_realism_v2.mjs` 已保护实验 38、39、40、41、42、60，避免批量重跑覆盖手工样板。最终验证见 `visual-regression-output-exp42-screen-distance-v11-20260605/report.json`。

2026-06-05 补充：实验 43 已升级为 RGB 色光混合手工样板，采用红/绿/蓝三色光源、每个光源前的滑动遮光片、柔化色光束、白屏支架和屏上叠加光斑；初始状态三块遮光片均关闭，不能直接记录步骤 1；引导模式必须通过拖动遮光片形成红绿黄、蓝绿青、三色近白三组记录，第二步需遮回红光并打开蓝光；自由模式下步骤框弱化/模糊，允许可逆开合遮光片和左右移动白屏；屏上颜色使用半透明叠加光斑而不是硬线或按钮切换；点击“分析”后实验面板保持展开且不弹出遮罩；`regenerate_38_68_realism_v2.mjs` 已保护实验 38、39、40、41、42、43、60，避免批量重跑覆盖手工样板。最终验证见 `visual-regression-output-exp43-rgb-mix-v1-20260605/report.json`。

2026-06-05 补充：实验 44 已升级为静电手工样板，采用塑料棒、毛皮垫、碎纸屑托盘、验电器和接地夹；引导模式必须依次拖动塑料棒在毛皮上往复摩擦、靠近纸屑、接触验电器金属球，再拖接地夹放电复位，不能通过横向拖动画布或点击按钮切换场景；纸屑吸起后应作为带电棒的过程证据持续，不能在移向验电器或接地夹放电视觉后立即掉落，吸起的纸屑应贴附在塑料棒表面而不是漂浮在棒下方；接地夹只让验电器金属部分放电闭合，不应把绝缘塑料棒和贴附纸屑一起清零；数据面板记录器材状态、可见结果和判断；自由模式下步骤框弱化/模糊，允许学生自由拖动塑料棒和接地夹重做静电过程；点击“分析”后实验面板保持展开且不弹出遮罩；`regenerate_38_68_realism_v2.mjs` 已保护实验 38、39、40、41、42、43、44、60，避免批量重跑覆盖手工样板。最终验证见 `visual-regression-output-exp44-static-electricity-v1-20260605/report.json`。

2026-06-05 补充：实验 45 已升级为磁场观察手工样板，采用透明板、板下条形磁铁、铁屑纹理、轻敲棒和可拖动小磁针；引导模式必须通过拖动轻敲棒点触透明板三次、拖动小磁针到白色测点、拖动条形磁铁一端翻转磁极完成三组记录，不能通过横向拖动画布或按钮切换场景；铁屑初始散乱，轻敲后才沿磁场排成弧形纹理，小磁针 N 极随位置和磁极方向偏转，磁铁翻转后指针方向同步反向；数据面板记录器材状态、可见结果和判断；自由模式下步骤框弱化/模糊，允许学生自由调节轻敲棒、小磁针和磁铁；点击“分析”后实验面板保持展开且不弹出遮罩；`regenerate_38_68_realism_v2.mjs` 已保护实验 38、39、40、41、42、43、44、45、60，避免批量重跑覆盖手工样板。

- Pattern AO：欧姆定律实物电路台  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验60.html`
- Pattern AP：光学光具座与屏幕族  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验38.html` 至 `初中物理实验43.html`
- Pattern AQ：静电/磁学/电磁实物台  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验44.html` 至 `初中物理实验51.html`
- Pattern AR：热学与能量转化实物台  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验52.html` 至 `初中物理实验59.html`
- Pattern AS：电路测量/连接/安全用电实物台  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验61.html` 至 `初中物理实验67.html`
- Pattern AT：新能源模型制作台  
  来源：`/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验68.html`

## Selection Guide

1. 先按 `references/教材与目录来源索引.md` 锁定教材页与目录编号映射。
2. 再按 `references/reuse-and-accumulation-workflow.md` 检索可复用模式。
3. 再选实验目标类型：
   - 现象观察类 -> F1 + F4
   - 器材操作类 -> F1 + F3 (+F2)
   - 测量分析类 -> F1 + F5 (+F2)
   - 液体守恒/浮力类 -> F1 + F3 + F5 + F7
4. 再选渲染策略：
   - 结构为主 -> SVG/DOM
   - 动态图像为主 -> Canvas
   - 混合 -> F6
5. 最后选面板策略：
   - 无遮挡风险 -> 固定面板
   - 有遮挡风险 -> F2 抽屉面板（推荐）
   - 需要极简首屏 -> S5 单舞台 + 角落迷你看板
6. 布局与真实性兜底：
   - 若存在烧杯/量筒/测量器具 -> 启用 F7 防重叠布局
   - 若存在受力读数 -> 先复用 `牛顿第三定律演示.html` 的测力计组件链
   - 若存在排液 -> 使用累计守恒，不做“提起即清零”

## Reuse Priority Rule

- Do not create a new apparatus/object pattern until F1-F7 families are checked.
- If an existing family can be adapted with limited changes, reuse that family.
- New family creation requires accumulation backfill in:
  - `references/apparatus-patterns.md`
  - this file (`template-catalog.md`) if family-level capability changed

## Anti-patterns

- 仅用滑杆 + 图表，无器材对象与操作链。
- 任务 `check()` 只看数字阈值，不看器材状态。
- 面板固定遮挡实验区，无法移动或折叠。
- 自动演示不释放锁，导致后续不可操作。
- 量筒与烧杯/测量器具重叠，未做布局安全检查。
- 液体实验中“量筒读数脱离溢流过程”或“提起物体后量筒瞬间清零”。
- 自动演示过快（用户看不清步骤）或中途停止在非最终步骤。
