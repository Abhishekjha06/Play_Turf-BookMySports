import{j as e,u as n}from"./index-CsScNpCr.js";import{c as r}from"./createLucideIcon-BYpUZOsc.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=r("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);function o(t="/"){const a=n();return()=>{window.history.length>1?a(-1):a(t)}}function u({onClick:t,label:a}){const s=o();return e.jsxs("button",{onClick:t??s,className:"h-10 w-10 rounded-full glass grid place-items-center pressable","aria-label":"Back","data-testid":"back-button",children:[e.jsx(c,{className:"h-5 w-5"}),e.jsx("span",{className:"sr-only",children:a??"Back"})]})}export{u as B};
