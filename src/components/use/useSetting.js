import { useState } from 'react';

const initialValue = {
  
  invisname : 'invisible',

  key_translate : 'w',
  key_rotate : 'e',
  key_scale : 'r',

  key_deselect : 'Escape'
  
}

function useSetting( key = 'setting' ) {

  const storageSetting = localStorage.getItem( key );

  let setting;

  if ( storageSetting === undefined || storageSetting === null ) {
    setting = initialValue
  } else {
    setting = JSON.parse(storageSetting);
    if ( typeof(setting) !== "object" || Object.keys(setting).length === 0 ) {
      setting = initialValue
      localStorage.removeItem( key )
    }
  }
  
  const [ settingStore, setSettingStore ] = useState( setting );

  const setSettings = ( newsettings ) => {
    setSettingStore( newsettings );
    // localStorage.setItem( key, JSON.stringify( newsettings ) );
  };

  return [ settingStore, setSettings ];

}

export { useSetting };