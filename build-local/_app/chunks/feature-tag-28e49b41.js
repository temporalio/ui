import{S as k,i as g,s as y,l as d,g as b,n as F,o as f,p as v,q as _,d as p,N as w,e as N,c as S,a as q,b as E,R as m,E as h,I as T,J as A,K as C,L as I}from"./index-c85ade65.js";import{a as J}from"./feature-tag.svelte_svelte_type_style_lang-0f55e153.js";function K(o){let e;return{c(){e=N("span"),this.h()},l(t){e=S(t,"SPAN",{class:!0}),q(e).forEach(p),this.h()},h(){E(e,"class","new-tag svelte-1f2k1i0"),m(e,"alpha",o[0])},m(t,a){b(t,e,a)},p(t,a){a&1&&m(e,"alpha",t[0])},i:h,o:h,d(t){t&&p(e)}}}function L(o){let e;const t=o[5].default,a=T(t,o,o[4],null);return{c(){a&&a.c()},l(l){a&&a.l(l)},m(l,i){a&&a.m(l,i),e=!0},p(l,i){a&&a.p&&(!e||i&16)&&A(a,t,l,l[4],e?I(t,l[4],i,null):C(l[4]),null)},i(l){e||(_(a,l),e=!0)},o(l){f(a,l),e=!1},d(l){a&&a.d(l)}}}function P(o){let e,t,a,l;const i=[L,K],r=[];function u(s,n){return s[1]?0:1}return e=u(o),t=r[e]=i[e](o),{c(){t.c(),a=d()},l(s){t.l(s),a=d()},m(s,n){r[e].m(s,n),b(s,a,n),l=!0},p(s,[n]){let c=e;e=u(s),e===c?r[e].p(s,n):(F(),f(r[c],1,1,()=>{r[c]=null}),v(),t=r[e],t?t.p(s,n):(t=r[e]=i[e](s),t.c()),_(t,1),t.m(a.parentNode,a))},i(s){l||(_(t),l=!0)},o(s){f(t),l=!1},d(s){r[e].d(s),s&&p(a)}}}function R(o,e,t){let a,l;w(o,J,n=>t(3,l=n));let{$$slots:i={},$$scope:r}=e,{feature:u}=e,{alpha:s=!1}=e;return o.$$set=n=>{"feature"in n&&t(2,u=n.feature),"alpha"in n&&t(0,s=n.alpha),"$$scope"in n&&t(4,r=n.$$scope)},o.$$.update=()=>{o.$$.dirty&12&&t(1,a=l==null?void 0:l.includes(u))},[s,a,u,l,r,i]}class B extends k{constructor(e){super(),g(this,e,R,P,y,{feature:2,alpha:0})}}export{B as F};
