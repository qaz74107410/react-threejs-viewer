import { useState } from 'react';

function useSetting( initialValue, key = 'setting' ) {

  const setting = localStorage.getItem( key );
  initialValue = setting ? JSON.parse( setting ) : initialValue;
  
  const [ settingStore, setSettingStore ] = useState( initialValue );

  const setSetting = ( property, value ) => {
    let newsetting;
    newsetting = Object.assign({}, settingStore );
    newsetting[property] = value;
    setSettingStore( {} );
    localStorage.setItem( key, JSON.stringify( newsetting ) );
  };

  return [ settingStore, setSetting ];

}

// function useSetting( property, initialValue, key = 'setting' ) {

//   const [ settingStore, setSettingStore ] = useState(() => {
//     const setting = window.localStorage.getItem( key );
//     return setting ? JSON.parse( setting ) : {};
//   });

//   const [ propertyValue, setPropertyValue ] = useState(() => {
//     return settingStore[property] ? settingStore[property] : initialValue
//   })

//   const setValueProperty = value => {
//     setPropertyValue(value);
//     const newsetting = settingStore;
//     newsetting[property] = value;
//     setSettingStore(newsetting)
//     window.localStorage.setItem( key, JSON.stringify( newsetting ) );
//   };

//   return [ propertyValue, setValueProperty ];
// }

export { useSetting };