// build-figma.js — 从 index.html 生成 5 个 Figma 导入版（每阶段一个独立文件）
// 变更点：去掉内部滚动容器/固定高度/sticky/fixed，让页面随内容自然撑开，并展开全部折叠内容。
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const STAGES = ['S1', 'S2', 'S3', 'S4', 'S5'];
const STAGE_NAME = { S1:'首轮 battle', S2:'偏好纠偏', S3:'倾向形成', S4:'版本确认', S5:'行动承接' };

// 覆盖样式：解除一屏限制，改为内容自然高度、完整展开
const OVERRIDE_CSS = `
/* ===== Figma 导入覆盖：取消内部滚动 / 固定高度 / sticky / fixed ===== */
html, body { height: auto !important; min-height: 0 !important; overflow: visible !important; }
.switcher-wrap { position: static !important; backdrop-filter: none !important; }
.phone { height: auto !important; }
.phone-screen { height: auto !important; min-height: 0 !important; overflow: visible !important; }
.scroll { height: auto !important; max-height: none !important; overflow: visible !important; overflow-y: visible !important; flex: 0 0 auto !important; }
.ev-head { position: static !important; }
.backbar { position: static !important; }
.toast { display: none !important; }
.phones { align-items: flex-start !important; }
.link-arrow { padding-top: 360px !important; }
`;

// 在初始化渲染后：展开全部论证卡、展开“其他候选车”，保证内容完整可见
const EXPAND_JS = `
;(function(){
  try {
    document.querySelectorAll('.ev').forEach(function(e){ e.classList.add('open'); });
    var w = document.getElementById('otherWrap'); if (w) { w.style.display = 'block'; }
  } catch(e) {}
})();
`;

STAGES.forEach(function (k) {
  let html = src;

  // 1) 固定为当前阶段
  html = html.replace('let stage="S1";', 'let stage="' + k + '";');

  // 2) 注入覆盖样式（置于 </style> 前，靠源码顺序 + !important 取胜）
  html = html.replace('</style>', OVERRIDE_CSS + '\n</style>');

  // 3) 注入展开脚本（置于 </script> 前，初始化渲染之后执行）
  html = html.replace('</script>', EXPAND_JS + '\n</script>');

  // 4) 标题区分
  html = html.replace(
    /<title>[\s\S]*?<\/title>/,
    '<title>figma-import · ' + k + ' ' + STAGE_NAME[k] + ' · Model Y vs 极氪7X</title>'
  );

  const out = path.join(__dirname, 'figma-import-' + k + '.html');
  fs.writeFileSync(out, html);
  console.log('written', out, html.length, 'bytes');
});
