const o=300,r=async(s,e,t)=>{e.set(!0);try{await t()}catch(a){console.error(a)}s.set(!1),setTimeout(()=>{e.set(!1)},300)};export{o as d,r as w};
