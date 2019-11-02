
import { useState, useEffect } from "react";

function Signel( names ) {

  const signelList = names.reduce((obj, name) => {
    obj[name] = false;
    return obj;
  }, {})

  const objnames = names.reduce((obj, name) => {
    obj[name] = name;
    return obj;
  }, {});
  
  const useSignel = ( handler, signelsname ) => {

    const deps = signelsname.reduce((arr, name) => { 
      arr.push(signelList[name]) 
      return arr
    }, []);

    return (
      useEffect(() => {
        console.log("[📶 signel recived] : ", signelsname , deps);
        handler();
      }, deps)
    )

  }
  
  const sendSignel = ( signelname ) => {
    console.log("[📶 signel sended] : ", signelname);
    // debugger;
    // let newsignellist = Object.assign({}, signelList)
    // newsignellist[signelname] = !signelList[signelname]
    // // signelList[signelname] = !signelList[signelname]
    // setSignelList(signelList);
    signelList[signelname] = !signelList[signelname]
    console.log(signelList);
    console.log(signelList[signelname]);
    console.log(!signelList[signelname]);
  }

  return {
    names : objnames,
    useSignel,
    sendSignel
  }
  
}

const createSignel = names => {
  const signel = new Signel( names );
  return signel
}

export default createSignel;