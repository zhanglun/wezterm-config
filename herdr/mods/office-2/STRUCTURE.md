# office-2 代码结构与 UI 维护指南

## 目录

```text
office-2/
├── main.js             # 场景状态、布局、人物状态和动画组合
├── art.js              # art 的稳定统一入口
├── art/
│   ├── render.js       # 矩形、缩放、镜像和人物高清层渲染
│   ├── people.js       # 人物站立、坐姿、行走、携带物和耳机
│   ├── palette.js      # 调色板和 agent 外观选择
│   ├── furniture.js    # 桌椅、桌子、沙发、饮水机、柜台、植物
│   ├── props.js        # 披萨、杯子、南瓜、圣诞树等小物件
│   └── cat.js          # 猫的身体和动作
├── decor.js            # decor 的稳定统一入口
└── decor/
    ├── windows.js      # 窗户、天空、城市、天气和天气卡片
    ├── room.js         # 地毯、灯、室内细节、宠物角和咖啡蒸汽
    ├── widgets.js      # 白板、日历、头像、远程视频墙、门和状态灯
    └── seasonal.js     # 季节彩灯、横幅和报警动画
```

`main.js` 只从 `art.js` 和 `decor.js` 导入。两个入口文件通过 `export *` 聚合领域模块，因此新增或移动 art/decor 代码时，不要直接改 `main.js` 的导入方式。

## 坐标系统

### 普通 art

art 数据使用矩形数组：

```js
[x, y, width, height, "paletteKey"]
```

- `x` 从部件左侧开始，向右为正。
- `y` 以地面线为 `0`，向上为负数。
- `STAND` 和 `SIT` 的物理盒子是 `16×30`。
- 人物的脚应落在接近 `y = -1` 的位置；不要随意改变部件盒子的基线。
- `P` 由场景根据窗口高度设置，art 单位会被放大为 GPUI 像素。

例如：

```js
[6, -5, 3, 1, "pants"]
```

表示从左侧 `x=6`、距离地面 `5` 个单位的位置，画一个 `3×1` 的裤子矩形。

### 人物高清层

人物基础部件仍然使用 `16×30` 盒子，但 `PERSON_HIRES` 可以为同一部件提供 `32×60` 的细节层：

```js
[STAND.body, hi(STAND.body, [
  [9, -32, 1, 1, "eye"],
])]
```

高清层只负责更细的像素和装饰。修改 `STAND.body` 的头部或身体位置时，应检查对应的 `PERSON_HIRES`，避免眼睛、头发高光或衣服细节漂移。

## 修改人物

### 外观形状

编辑 `art/people.js`：

- `STAND.body`：站立身体、头、脸、头发和衣服
- `STAND.backLeg` / `STAND.frontLeg`：站立双腿
- `STAND.walk*`：行走中的手臂和腿
- `STAND.armUp` / `armUpBack`：举手动作
- `SIT.body`：坐姿身体
- `SIT.arm` / `rest` / `lapArm`：工作、休息和放在电脑前的手臂
- `SIT.laptop` / `stool`：笔记本和凳子
- `HEADSET`：远程 agent 的耳机

修改身体轮廓后，至少检查站立、坐着工作、走路三种状态。人物的状态组合位于 `main.js` 的 `person()`、`walker()` 和 `pose()`。

### 颜色

编辑 `art/palette.js`：

- `PALETTE`：家具、道具和固定颜色
- `SKINS`：肤色候选
- `HAIRS`：头发候选
- `SHIRTS`：衣服候选
- `PANTS`：裤子候选
- `look(address)`：根据 agent 地址稳定选择一套外观

同一个 agent 的地址会产生同一套颜色。不要在渲染循环中随机取色，否则人物每次刷新都会变色。

### 状态和动作

编辑 `main.js` 的 `person()`：

```text
working  -> SIT.body + SIT.arm + laptop
couch    -> SIT.body + SIT.rest
cooler   -> STAND.body + cup
walking  -> walker()
blocked  -> STAND.armUp
 done    -> STAND.armUp + STAND.armUpBack
```

只改人物形状时不要改 `main.js`。只有需要改变“什么时候显示哪个部件”或动作速度时才改这里。

## 修改家具和装饰

- 家具的矩形数据：`art/furniture.js`
- 小物件的矩形数据：`art/props.js`
- 猫的图形和动作：`art/cat.js`
- 窗外景色和天气：`decor/windows.js`
- 室内固定细节：`decor/room.js`
- 白板、日历、远程 agent 卡片：`decor/widgets.js`
- 节日元素和警报：`decor/seasonal.js`

art 文件负责“画什么形状”，decor 文件负责“返回场景中的 GPUI 元素”。不要把场景状态逻辑复制进 art 数据文件。

## PNG 转矩形数据

已有的 PNG 转换器位于 `herdr/tools/png2rects.py`。推荐先用像素编辑器画图，再转换成矩形数据：

```sh
python3 herdr/tools/png2rects.py sprite.png --width 16 --height 30 --emit STAND.body
python3 herdr/tools/png2rects.py sprite.png --flip-x --self-check
```

PNG 的一个像素对应一个 art 单位。透明像素会被跳过；如果使用白色背景的 RGB PNG，白色会被当作真实像素，所以应使用透明背景或先裁掉背景。

## 验证和安装

修改后先运行静态检查：

```sh
cd /Users/zhanglun/Documents/mine/wezterm-config
herdr-app check herdr/mods/office-2
```

通过后安装到当前 Herdr：

```sh
./herdr/install-office-2.sh
```

日常 UI/美术调试推荐用独立预览窗口，不占用日常布局：

```sh
./herdr/preview-window.sh     # 打开/刷新预览窗口（画廊 + 实时办公室）
HERDR_APP_HOME="$HOME/.config/herdr-preview" herdr-app shot /tmp/preview.png
```

预览窗口运行在隔离的 `~/.config/herdr-preview`，画廊展示 `art/`、`decor/` 的全部部件；重复运行脚本会重新拷贝 mods 并热更新。日常窗口的布局、终端始终不受影响（原理见 `herdr/README.md` 的 "Preview the art in a separate window"）。

注：命令里的 `herdr-app` 若不在 PATH 中（本机默认不在），先执行 `alias herdr-app="$HOME/Applications/Herdr.app/Contents/MacOS/Herdr"`。

安装脚本会把仓库中的 `art/` 和 `decor/` 子目录一并复制到 `~/.config/herdr-app/mods/office-2/`。

## 维护原则

1. 优先修改对应领域文件，不要把新 art 数据塞回入口文件。
2. 保持 `art.js`、`decor.js` 的导出名稳定，减少场景层改动。
3. 不要使用 CSS 渐变或图片替代矩形像素层；当前人物和主要道具依赖硬边矩形。
4. 任何新增的非平凡状态逻辑，都要至少通过 `herdr-app check` 并做一次运行截图。
5. 不要提交 `~/.config/herdr-app` 的安装副本；源代码只维护在仓库的 `herdr/mods/office-2/`。
