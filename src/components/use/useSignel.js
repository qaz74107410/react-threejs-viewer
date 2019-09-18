
import { useState, useEffect } from "react";

const DEBUG = true;

function Signel( names ) {

  const [signel, setSignel] = useState("");
  
  const useSignel = ( handler, signelsname ) => {
    return (
      useEffect(() => {
        if ( signelsname.indexOf(signel) !== -1 ) {
        console.log("[📶 signel recived] : ", signel);
          handler();
        }
      }, [signel])
    )

  }
  
  const sendSignel = ( signelname ) => {
    DEBUG && console.log("[📶 signel sended] : ", signelname);
    setSignel(signelname);
    setTimeout(() => { setSignel("") }, 100);
  }
  return {
    names,
    useSignel,
    sendSignel
  }
}

const createSignel = names => {
  const objnames = names.reduce((obj, name) => {
    obj[name] = name;
    return obj;
  }, {});
  const signel = new Signel(objnames);
  return signel
}

export default createSignel;