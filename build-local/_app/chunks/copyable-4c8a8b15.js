import{S,i as q,s as B,I as V,e as p,k as j,w as D,c as d,a as k,m as G,x as H,d as b,b as g,g as N,M as v,y as J,T as C,H as K,E as T,J as L,K as O,L as P,q as y,o as A,B as R,G as U,al as z,N as F,C as E,V as I,t as Q,h as W,R as M,j as X}from"./index-c85ade65.js";import{I as Y}from"./index-c8da0ebb.js";import{c as Z}from"./copy-to-clipboard-b8e3d18c.js";function w(e){let s,o,c;return{c(){s=p("span"),o=Q(e[0]),this.h()},l(a){s=d(a,"SPAN",{class:!0});var n=k(s);o=W(n,e[0]),n.forEach(b),this.h()},h(){g(s,"class",c=e[7].class),M(s,"select-all",!e[8].default)},m(a,n){N(a,s,n),v(s,o)},p(a,n){n&1&&X(o,a[0]),n&128&&c!==(c=a[7].class)&&g(s,"class",c),n&384&&M(s,"select-all",!a[8].default)},d(a){a&&b(s)}}}function x(e){let s,o,c,a,n,f,r,h;const _=e[10].default,u=V(_,e,e[9],null),i=u||w(e);return a=new Y({props:{name:e[4]?"checkMark":"copy",stroke:e[2],class:`${e[1]?"visible":"invisible group-hover:visible"} h-4`}}),{c(){s=p("div"),i&&i.c(),o=j(),c=p("button"),D(a.$$.fragment),this.h()},l(t){s=d(t,"DIV",{class:!0});var l=k(s);i&&i.l(l),o=G(l),c=d(l,"BUTTON",{});var m=k(c);H(a.$$.fragment,m),m.forEach(b),l.forEach(b),this.h()},h(){g(s,"class",n="group flex items-center gap-2 "+e[7]["container-class"])},m(t,l){N(t,s,l),i&&i.m(s,null),v(s,o),v(s,c),J(a,c,null),f=!0,r||(h=[C(c,"click",e[5]),C(s,"click",function(){K(e[3]?e[5]:T)&&(e[3]?e[5]:T).apply(this,arguments)})],r=!0)},p(t,[l]){e=t,u?u.p&&(!f||l&512)&&L(u,_,e,e[9],f?P(_,e[9],l,null):O(e[9]),null):i&&i.p&&(!f||l&385)&&i.p(e,f?l:-1);const m={};l&16&&(m.name=e[4]?"checkMark":"copy"),l&4&&(m.stroke=e[2]),l&2&&(m.class=`${e[1]?"visible":"invisible group-hover:visible"} h-4`),a.$set(m),(!f||l&128&&n!==(n="group flex items-center gap-2 "+e[7]["container-class"]))&&g(s,"class",n)},i(t){f||(y(i,t),y(a.$$.fragment,t),f=!0)},o(t){A(i,t),A(a.$$.fragment,t),f=!1},d(t){t&&b(s),i&&i.d(t),R(a),r=!1,U(h)}}}function $(e,s,o){let c,{$$slots:a={},$$scope:n}=s;const f=z(a);let{content:r}=s,{visible:h=!1}=s,{color:_="black"}=s,{clickAllToCopy:u=!1}=s;const{copy:i,copied:t}=Z(r,500);return F(e,t,l=>o(4,c=l)),e.$$set=l=>{o(7,s=E(E({},s),I(l))),"content"in l&&o(0,r=l.content),"visible"in l&&o(1,h=l.visible),"color"in l&&o(2,_=l.color),"clickAllToCopy"in l&&o(3,u=l.clickAllToCopy),"$$scope"in l&&o(9,n=l.$$scope)},s=I(s),[r,h,_,u,c,i,t,s,f,n,a]}class as extends S{constructor(s){super(),q(this,s,$,x,B,{content:0,visible:1,color:2,clickAllToCopy:3})}}export{as as C};
