import{S as L,i as M,s as z,I as G,e as b,t as J,k as N,w as S,c as w,a as E,h as O,d as f,m as j,x as C,b as v,g as I,M as g,y as V,J as P,K as Q,L as R,q as T,o as y,B as H}from"../../../../../../../chunks/index-c85ade65.js";import{f as A}from"../../../../../../../chunks/route-for-ef692dd7.js";import{T as U,a as D}from"../../../../../../../chunks/toggle-buttons-9d795aae.js";import W from"../../../../../_event-history-import.svelte-1fffbc6b.js";import"../../../../../../../chunks/index-c8da0ebb.js";import"../../../../../../../chunks/stores-2c13cc16.js";import"../../../../../../../chunks/navigation-6709cf39.js";import"../../../../../../../chunks/singletons-d1fb5791.js";import"../../../../../../../chunks/button-e0b13963.js";import"../../../../../../../chunks/badge-d2c94945.js";import"../../../../../../../chunks/index-eb012da8.js";import"../../../../../../../chunks/is-http-249a0663.js";import"../../../../../../../chunks/index-203c0d43.js";import"../../../../../../../chunks/persist-store-9b44ce28.js";import"../../../../../../../chunks/is-function-b969a126.js";import"../../../../../../../chunks/data-converter-config-b3e1b826.js";import"../../../../../../../chunks/atob-eb4fc9a1.js";import"../../../../../../../chunks/format-date-f8f72e15.js";import"../../../../../../../chunks/to-duration-3f40f60b.js";import"../../../../../../../chunks/is-18735aa3.js";import"../../../../../../../chunks/get-event-categorization-732ccf42.js";import"../../../../../../../chunks/has-038f0a2e.js";import"../../../../../../../chunks/simplify-attributes-6c8439d9.js";import"../../../../../../../chunks/notifications-9d24bb07.js";import"../../../../../../../chunks/import-events-cf01b60a.js";function X(i){let t;return{c(){t=J("Timeline")},l(s){t=O(s,"Timeline")},m(s,o){I(s,t,o)},d(s){s&&f(t)}}}function Y(i){let t;return{c(){t=J("Compact")},l(s){t=O(s,"Compact")},m(s,o){I(s,t,o)},d(s){s&&f(t)}}}function Z(i){let t;return{c(){t=J("JSON")},l(s){t=O(s,"JSON")},m(s,o){I(s,t,o)},d(s){s&&f(t)}}}function tt(i){let t,s,o,p,a,$;return t=new D({props:{icon:"feed",href:A({importType:"events",view:"feed"}),$$slots:{default:[X]},$$scope:{ctx:i}}}),o=new D({props:{icon:"compact",href:A({importType:"events",view:"compact"}),$$slots:{default:[Y]},$$scope:{ctx:i}}}),a=new D({props:{icon:"json",href:A({importType:"events",view:"json"}),$$slots:{default:[Z]},$$scope:{ctx:i}}}),{c(){S(t.$$.fragment),s=N(),S(o.$$.fragment),p=N(),S(a.$$.fragment)},l(e){C(t.$$.fragment,e),s=j(e),C(o.$$.fragment,e),p=j(e),C(a.$$.fragment,e)},m(e,r){V(t,e,r),I(e,s,r),V(o,e,r),I(e,p,r),V(a,e,r),$=!0},p(e,r){const _={};r&2&&(_.$$scope={dirty:r,ctx:e}),t.$set(_);const c={};r&2&&(c.$$scope={dirty:r,ctx:e}),o.$set(c);const u={};r&2&&(u.$$scope={dirty:r,ctx:e}),a.$set(u)},i(e){$||(T(t.$$.fragment,e),T(o.$$.fragment,e),T(a.$$.fragment,e),$=!0)},o(e){y(t.$$.fragment,e),y(o.$$.fragment,e),y(a.$$.fragment,e),$=!1},d(e){H(t,e),e&&f(s),H(o,e),e&&f(p),H(a,e)}}}function et(i){let t,s,o,p,a,$,e,r,_,c,u,q,h;e=new W({}),u=new U({props:{$$slots:{default:[tt]},$$scope:{ctx:i}}});const x=i[0].default,l=G(x,i,i[1],null);return{c(){t=b("section"),s=b("nav"),o=b("h3"),p=J("Event History"),a=N(),$=b("div"),S(e.$$.fragment),r=N(),_=b("nav"),c=b("div"),S(u.$$.fragment),q=N(),l&&l.c(),this.h()},l(n){t=w(n,"SECTION",{id:!0});var m=E(t);s=w(m,"NAV",{class:!0});var d=E(s);o=w(d,"H3",{class:!0});var k=E(o);p=O(k,"Event History"),k.forEach(f),a=j(d),$=w(d,"DIV",{class:!0});var B=E($);C(e.$$.fragment,B),B.forEach(f),d.forEach(f),r=j(m),_=w(m,"NAV",{class:!0});var F=E(_);c=w(F,"DIV",{id:!0,class:!0});var K=E(c);C(u.$$.fragment,K),K.forEach(f),F.forEach(f),q=j(m),l&&l.l(m),m.forEach(f),this.h()},h(){v(o,"class","text-lg font-medium"),v($,"class","flex gap-4"),v(s,"class","flex items-end justify-between gap-4 pb-4"),v(c,"id","event-view-toggle"),v(c,"class","flex gap-4"),v(_,"class","flex items-end justify-end gap-4 pb-4"),v(t,"id","event-history")},m(n,m){I(n,t,m),g(t,s),g(s,o),g(o,p),g(s,a),g(s,$),V(e,$,null),g(t,r),g(t,_),g(_,c),V(u,c,null),g(t,q),l&&l.m(t,null),h=!0},p(n,[m]){const d={};m&2&&(d.$$scope={dirty:m,ctx:n}),u.$set(d),l&&l.p&&(!h||m&2)&&P(l,x,n,n[1],h?R(x,n[1],m,null):Q(n[1]),null)},i(n){h||(T(e.$$.fragment,n),T(u.$$.fragment,n),T(l,n),h=!0)},o(n){y(e.$$.fragment,n),y(u.$$.fragment,n),y(l,n),h=!1},d(n){n&&f(t),H(e),H(u),l&&l.d(n)}}}function st(i,t,s){let{$$slots:o={},$$scope:p}=t;return i.$$set=a=>{"$$scope"in a&&s(1,p=a.$$scope)},[o,p]}class jt extends L{constructor(t){super(),M(this,t,st,et,z,{})}}export{jt as default};
