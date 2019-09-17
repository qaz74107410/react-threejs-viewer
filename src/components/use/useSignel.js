import { useState, useEffect } from "react";

// import createPersistedState from 'use-persisted-state';
// const useSignelState = createPersistedState('signel');

// const useSignel = initSignel => {
//   const [signel, setSignel] = useSignelState(initSignel);

//   return {
//     ...signel,
//     send: ( targetSignel ) => {
//       let currentSignel = { ...signel };
//       currentSignel[targetSignel] = true;
//       setSignel( currentSignel );
//       currentSignel[targetSignel] = false;
//       setSignel( currentSignel );      
//     }
//   };
// };

// export default useSignel;

function Signel( names ) {

  const [signel, setSignel] = useState("");
  
  const useSignel = ( handler, signelsname ) => {
    return (
      useEffect(() => {
        if ( signelsname.indexOf(signel) !== -1 ) {
          console.log("[📶 signel recived] : ", signelsname);
          handler();
        }
      }, signelsname)
    )

  }
  
  const sendSignel = ( signelname ) => {
    console.log("[📶 signel sended] : ", signelname);
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