import React, { useEffect, useState, useContext, useRef } from 'react';

const ObjectDetailInput = ({value, onKeyDown, onBlur}) => {
  
  const [ dvalue, setDValue ] = useState();

  useEffect(() => {
    setDValue(value);
  }, [value]);

  const onChange = e => {
    setDValue(e.target.value);
  }

  return (
    <input type='text' value={dvalue} onKeyDown={onKeyDown} onBlur={onBlur} onChange={onChange} />
  )

}

export default ObjectDetailInput;