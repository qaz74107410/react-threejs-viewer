import React, { useEffect, useState, useContext, useRef } from 'react';
import { ThreeJSContext } from '../../threeWarpper';

import styled from 'styled-components';

import { MDBRow, MDBCol, MDBContainer } from 'mdbreact';

import ObjectDetailInput from './objectDetailInput';

const StyledCol = styled(MDBCol)`
`

const KeyCol = styled(StyledCol)`
`

const InfoCol = styled(StyledCol)`
`

const DetailInput = styled(ObjectDetailInput)`
  background: white;
  width : 100%;
`

const ENTER_KEY = 13;

const ObjectInfo = () => {

  const context = useContext( ThreeJSContext );
  const { selectedObj } = context;

  const [ rowsInfo, setRowsInfo ] = useState([]);

  const acceptedKey = [
    {
      key : 'type',
    },
    {
      key : 'name',
      set : name => {
        selectedObj.name = name
      }
    }
  ]

  // Util
  const capitalizeFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Effect
  useEffect(() => {

    const rows = [];
    let row;

    acceptedKey.forEach(key => {
      if ( selectedObj !== undefined && selectedObj[key] !== undefined ) {
        row = buildRow(capitalizeFirstLetter(key), selectedObj[key]);
        rows.push(row);
      }
    });

    rows.length > 0 && setRowsInfo( rows );

  }, [selectedObj])

  // Event
  const onKeyDown = (e, changeHandler) => {
    if (e.keyCode === ENTER_KEY) {
      changeHandler(e.target.value)
    }
  }

  const onBlur = changeHandler => {
    changeHandler(e.target.value)
  } 

  // Build
  const buildRow = ( key, detail, changeHandler ) => {

    return (
      <MDBContainer key={key}>
        <MDBRow className='p-1'>
          <KeyCol size="4" className='no-gutters px-0'>
            {key} :
          </KeyCol>
          <InfoCol size="8" className='no-gutters px-0'>
            <DetailInput type='text' value={detail} onKeyDown={e => onKeyDown(e, changeHandler)} onBlur={onBlur(changeHandler)} />
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



export default ObjectInfo;