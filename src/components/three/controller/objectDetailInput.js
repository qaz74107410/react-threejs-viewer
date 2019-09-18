import React, { useEffect, useState, useContext, useRef } from 'react';

import styled from 'styled-components';

import { ChromePicker } from 'react-color'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`

const ObjectDetailInput = ({initvalue, onKeyDown, onBlur}) => {
  
  const [ value, setValue ] = useState('');

  useEffect(() => {
    setValue(initvalue);
  }, [initvalue]);

  const onChange = e => {
    setValue(e.target.value);
  }

  return (
    <input 
      type='text' 
      value={value} 
      onKeyDown={onKeyDown} 
      onBlur={onBlur} 
      onChange={onChange} 
      style={{ width: '100%' }}
    />
  )

}

const ObjectDetailCheckbox = ({initvalue, onChange}) => {

  const [ value, setValue ] = useState(false);

  useEffect(() => {
    setValue(Boolean(initvalue));
  }, [initvalue]);

  useEffect(() => {
    onChange && onChange(value);
  }, [value])

  const onThisChange = e => {
    setValue(!value);
  }

  return (
    <input 
      type='checkbox' 
      checked={value}
      value={value} 
      onChange={onThisChange} 
      style={{
        height : '1.2rem',
        width : '1.2rem',
        transform: 'translateY(0.3rem)'
      }}
    />
  )

}

const ObjectColorPicker = ({initvalue, onChange}) => {

  const [ color, setColor ] = useState({ hex : '#000' });
  const [ display, setDisplay ] = useState(false)

  const ColorPreview = styled.div`
    border : 2px solid white;
    background : ${color.hex};
    height : 100%;
    position: relative;
    cursor: pointer;
  `

  useEffect(() => {
    if ( initvalue.isColor ) {
      setColor({
        hex : `#${initvalue.getHexString ()}`
      })
    } else if ( initvalue.r !== undefined && initvalue.g !== undefined && initvalue.b !== undefined ) {
      setColor({ 
        hex : rgbToHex(
          initvalue.r, 
          initvalue.g, 
          initvalue.b
        )
      });
    } else {
      // format not support
    }
  }, [initvalue]);


  const rgbToHex = (r, g, b) => {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

  const componentToHex = c => {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  const showDisplay = e => {
    setDisplay( true );
  }

  const hideDisplay = e => {
    setDisplay( false );
  }

  const onThisChange = color => {
    setColor(color);
    onChange && onChange(color)
  }

  return (
    <>
      <ColorPreview value={color} onClick={showDisplay}></ColorPreview>
      { display && 
      <div style={{ overflow: 'hidden' }}>
        <Overlay onClick={hideDisplay}/>
        <div style={{ position: 'absolute', zIndex: 4, bottom: '100%', right: 0 }} >
            <ChromePicker color={color} onChange={onThisChange} disableAlpha/> 
        </div>
      </div>
      }
    </>
  )

}

export { ObjectDetailInput, ObjectDetailCheckbox, ObjectColorPicker };