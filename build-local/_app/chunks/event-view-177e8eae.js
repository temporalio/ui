import{d as s}from"./index-203c0d43.js";import{p as i}from"./stores-2c13cc16.js";import{p as t}from"./persist-store-9b44ce28.js";import{s as p}from"./settings-3cc4c6ae.js";import{c as d,i as a}from"./version-check-cead3852.js";import{b as m}from"./is-18735aa3.js";const c=s([d],([e])=>e==null?void 0:e.serverVersion),h=s([p],([e])=>e==null?void 0:e.version),O=t("eventView","feed"),P=t("expandAllEvents","false"),v=t("eventFilterSort","descending"),x=t("eventShowElapsed","false"),y=s([i],([e])=>e.url.searchParams.get("category")),f=s([i],([e])=>{const r=e.url.searchParams.get("sort");return m(r)?r:"descending"}),l=s([c,p],([e,r])=>r.runtimeEnvironment.isCloud?!0:(console.log("supports reverse",a(e,"1.16.0")),a(e,"1.16.0"))),b=s([v,l,f],([e,r,n])=>{let o;if(r){if(n)return n;o=e}else o="ascending";return o});export{b as a,y as b,x as c,v as d,O as e,P as f,l as s,c as t,h as u};
