import{u as c,j as e,L as l,b as n}from"./index-CsScNpCr.js";import{M as o}from"./MobileShell-BQd6mTIP.js";import{A as d,a as m,B as p}from"./BottomNav-Cg2aSTlc.js";import{u as x}from"./use-auth-BQcDyxZE.js";import{b as h}from"./auth-CXEyiOU-.js";import{c as s}from"./createLucideIcon-BYpUZOsc.js";import{S as u}from"./shield-check-CjOn3caA.js";import"./house-B8En0un5.js";import"./trophy-Duzxljez.js";import"./proxy-Beak8hJL.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=s("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=s("CircleHelp",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=s("CircleUserRound",[["path",{d:"M18 20a6 6 0 0 0-12 0",key:"1qehca"}],["circle",{cx:"12",cy:"10",r:"4",key:"1h16sb"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=s("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=s("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]),q=()=>{const{user:t}=x(),i=c(),r=[{label:"Notifications",icon:m,to:"#"},{label:"Terms of Service",icon:b,to:"#"},{label:"Help & Support",icon:g,to:"#"},...t!=null&&t.is_admin?[{label:"Admin Panel",icon:u,to:"/admin"}]:[]];return e.jsxs(o,{children:[e.jsx(d,{}),e.jsx("section",{className:"px-4 mt-4",children:e.jsxs("div",{className:"card-panel rounded-3xl p-4 flex items-center gap-3",children:[e.jsx("div",{className:"h-14 w-14 rounded-full bg-gradient-neon text-primary-foreground grid place-items-center font-bold text-xl",children:t?(t.name[0]??"U").toUpperCase():e.jsx(f,{className:"h-6 w-6"})}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"font-semibold text-sm",children:(t==null?void 0:t.name)??"Guest"}),e.jsx("p",{className:"text-xs text-muted2 truncate",children:(t==null?void 0:t.email)??"Sign in to start booking"})]}),!t&&e.jsx(l,{to:"/login",className:"bg-primary text-primary-foreground rounded-full px-4 py-2 text-xs font-semibold shadow-neon",children:"Sign in"})]})}),e.jsxs("section",{className:"px-4 mt-5 flex flex-col gap-2",children:[r.map(a=>e.jsxs(l,{to:a.to,className:"card-panel rounded-2xl px-4 py-3 flex items-center gap-3 pressable",children:[e.jsx("div",{className:"h-9 w-9 rounded-full bg-panel-3 grid place-items-center",children:e.jsx(a.icon,{className:"h-4 w-4 text-primary"})}),e.jsx("span",{className:"flex-1 text-sm",children:a.label}),e.jsx(y,{className:"h-4 w-4 text-muted2"})]},a.label)),t&&e.jsxs("button",{onClick:async()=>{await h(),n.success("Signed out"),i("/")},className:"card-panel rounded-2xl px-4 py-3 flex items-center gap-3 pressable text-left","data-testid":"logout-btn",children:[e.jsx("div",{className:"h-9 w-9 rounded-full bg-destructive/15 grid place-items-center",children:e.jsx(j,{className:"h-4 w-4 text-destructive"})}),e.jsx("span",{className:"flex-1 text-sm",children:"Log out"})]})]}),e.jsx(p,{})]})};export{q as default};
