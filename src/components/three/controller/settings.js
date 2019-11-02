import React, { useEffect, useState, useContext, useRef } from 'react';
import { ThreeJSContext } from '../../threeWarpper';

import styled from 'styled-components';

import { MDBRow, MDBCol, MDBContainer } from 'mdbreact';

import { ObjectDetailInput, ObjectDetailCheckbox, ObjectColorPicker } from './objectDetailInput';

const StyledCol = styled(MDBCol)``

const KeyCol = styled(StyledCol)``

const InfoCol = styled(StyledCol)``

const DetailInput = styled(ObjectDetailInput)`
  background: white;
  width : 100%;
`

const DetailCheckbox = styled(ObjectDetailCheckbox)``

const ENTER_KEY = 13;

const Settings = () => {

  const context = useContext( ThreeJSContext );
  const { settings, setSettings } = context;

  const [ rowsInfo, setRowsInfo ] = useState([]);

  const changeSetting = ( name, val ) => {
    const newsettings = Object.assign({}, settings)
    newsettings[name] = val
    setSettings(newsettings)
  }

  const acceptedKey = [
    {
      key : 'Invisible Name',
      type : 'input',
      get : () => {
        return "test"
      },
      set : newval => {
        changeSetting( 'invisname', newval )
      }
    }
  ]
  
  // Util
  const capitalizeFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const toTwoDigit = number => {
    return parseFloat(parseFloat(number).toFixed(2));
  }

  useEffect(() => {

    buildRows();

  }, [settings])

  // Event
  const onKeyDown = (e, changeHandler) => {
    if (e.keyCode === ENTER_KEY) {
      changeHandler(e.target.value)
    }
  }

  const onBlur = (e, changeHandler) => {
    changeHandler(e.target.value)
  } 

  const buildRows = () => {
    const rows = [];
    let row;

    acceptedKey.forEach(accepted => {

      row = buildRow(capitalizeFirstLetter(accepted.key), accepted.type, accepted.get(), accepted.set);
      rows.push(row);

    });

    rows.length > 0 && setRowsInfo( rows );
  } 

  // Build
  const buildRow = ( key, type, detail, changeHandler ) => {
    
    return (
      <MDBContainer key={key}>
        <MDBRow className='p-1'>
          <KeyCol size="6" className='no-gutters px-0'>
            { key } :
          </KeyCol>
          <InfoCol size="6" className='no-gutters px-0'>
            { type === 'input' && <DetailInput type='text' initvalue={detail} onKeyDown={e => onKeyDown(e, changeHandler)} onBlur={e => onBlur(e, changeHandler)} /> }
            { type === 'checkbox' && <DetailCheckbox initvalue={detail} onChange={ changeHandler } /> }
            { type === 'colorpicker' && <ObjectColorPicker initvalue={detail} onChange={ changeHandler } /> }
          </InfoCol>
        </MDBRow>
      </MDBContainer>
    )

  }

  return (
    <>
      {rowsInfo}
    </>
  )

}



export default Settings;