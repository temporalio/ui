import{H as v,C as b}from"./index-c85ade65.js";function m(t){const r=t-1;return r*r*r+1}function q(t){return--t*t*t*t*t+1}/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */function S(t,r){var a={};for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&r.indexOf(n)<0&&(a[n]=t[n]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,n=Object.getOwnPropertySymbols(t);s<n.length;s++)r.indexOf(n[s])<0&&Object.prototype.propertyIsEnumerable.call(t,n[s])&&(a[n[s]]=t[n[s]]);return a}function M(t,{delay:r=0,duration:a=400,easing:n=m,x:s=0,y:d=0,opacity:i=0}={}){const o=getComputedStyle(t),c=+o.opacity,u=o.transform==="none"?"":o.transform,f=c*(1-i);return{delay:r,duration:a,easing:n,css:(e,l)=>`
			transform: ${u} translate(${(1-e)*s}px, ${(1-e)*d}px);
			opacity: ${c-f*l}`}}function P(t,{delay:r=0,duration:a=400,easing:n=m,start:s=0,opacity:d=0}={}){const i=getComputedStyle(t),o=+i.opacity,c=i.transform==="none"?"":i.transform,u=1-s,f=o*(1-d);return{delay:r,duration:a,easing:n,css:(e,l)=>`
			transform: ${c} scale(${1-u*l});
			opacity: ${o-f*l}
		`}}function B(t){var{fallback:r}=t,a=S(t,["fallback"]);const n=new Map,s=new Map;function d(o,c,u){const{delay:f=0,duration:e=y=>Math.sqrt(y)*30,easing:l=m}=b(b({},a),u),p=c.getBoundingClientRect(),g=o.left-p.left,$=o.top-p.top,w=o.width/p.width,x=o.height/p.height,k=Math.sqrt(g*g+$*$),h=getComputedStyle(c),_=h.transform==="none"?"":h.transform,C=+h.opacity;return{delay:f,duration:v(e)?e(k):e,easing:l,css:(y,O)=>`
				opacity: ${y*C};
				transform-origin: top left;
				transform: ${_} translate(${O*g}px,${O*$}px) scale(${y+(1-y)*w}, ${y+(1-y)*x});
			`}}function i(o,c,u){return(f,e)=>(o.set(e.key,{rect:f.getBoundingClientRect()}),()=>{if(c.has(e.key)){const{rect:l}=c.get(e.key);return c.delete(e.key),d(l,f,e)}return o.delete(e.key),r&&r(f,e,u)})}return[i(s,n,!1),i(n,s,!0)]}export{B as a,m as c,M as f,q,P as s};
