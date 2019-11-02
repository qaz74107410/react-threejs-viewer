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

const ObjectInfo = () => {

  const context = useContext( ThreeJSContext );
  const { scene, selectedObj, useSignel, sendSignel, signelnames } = context;

  const [ rowsInfo, setRowsInfo ] = useState([]);

  const acceptedKey = [
    {
      key : 'type',
      type : 'input',
      get : () => {
        return selectedObj.type
      }
    },
    {
      key : 'name',
      type : 'input',
      get : () => {
        return selectedObj.name
      },
      set : name => {
        selectedObj.name = name
      }
    },
    {
      key : 'position',
      type : 'input',
      get : () => {
        return `${toTwoDigit(selectedObj.position.x)}, ${toTwoDigit(selectedObj.position.y)}, ${toTwoDigit(selectedObj.position.z)}`
      },
      set : newpos => {
        newpos = newpos.split(',').map(pos => parseFloat(pos));
        selectedObj.position.set( newpos[0], newpos[1], newpos[2] );
      }
    },
    {
      key : 'quaternion',
      type : 'input',
      get : () => {
        // maybe at setting later ?
        return `${toTwoDigit(selectedObj.quaternion._x)}, ${toTwoDigit(selectedObj.quaternion._y)}, ${toTwoDigit(selectedObj.quaternion._z)}, ${toTwoDigit(selectedObj.quaternion._w)}`
      },
      set : newquate => {
        newquate = newquate.split(',').map(quate => parseFloat(quate));
        selectedObj.quaternion.set( newquate[0], newquate[1], newquate[2], newquate[3] );
      }
    },
    {
      key : 'receiveShadow',
      type : 'checkbox',
      get : () => {
        return selectedObj.receiveShadow
      },
      set : newval => {
        selectedObj.receiveShadow = newval;
      }
    },
    {
      key : 'castShadow',
      type : 'checkbox',
      get : () => {
        return selectedObj.castShadow
      },
      set : newval => {
        selectedObj.castShadow = newval;
      }
    },
    {
      key : 'rotation',
      type : 'input',
      get : () => {
        return `${toTwoDigit(selectedObj.rotation._x)}, ${toTwoDigit(selectedObj.rotation._y)}, ${toTwoDigit(selectedObj.rotation._z)}`
      },
      set : newrot => {
        newrot = newrot.split(',').map(rot => parseFloat(rot));
        selectedObj.rotation.set( newrot[0], newrot[1], newrot[2] );
      }
    },
    {
      key : 'scale',
      type : 'input',
      get : () => {
        return `${toTwoDigit(selectedObj.scale.x)}, ${toTwoDigit(selectedObj.scale.y)}, ${toTwoDigit(selectedObj.scale.z)}`
      },
      set : newscale => {
        newscale = newscale.split(',').map(scale => parseFloat(scale));
        selectedObj.scale.set( newscale[0], newscale[1], newscale[2] );
      }
    },
    {
      key : 'visible',
      type : 'checkbox',
      get : () => {
        return selectedObj.visible
      },
      set : newval => {
        selectedObj.visible = newval;
      }
    },
    {
      // https://threejs.org/docs/#api/en/math/Color
      key : 'color',
      type : 'colorpicker',
      get : () => {
        return selectedObj.color
      },
      set : newcolor => {
        // set as hex code
        selectedObj.color.setStyle(newcolor.hex);
      }
    },
    {
      key : 'decay',
      type : 'input',
      get : () => {
        return selectedObj.decay;
      },
      set : newval => {
        selectedObj.decay = parseFloat(newval);
      }
    },
    {
      key : 'distance',
      type : 'input',
      get : () => {
        return selectedObj.distance;
      },
      set : newdist => {
        selectedObj.distance = parseFloat(newdist);
      }
    },
    {
      key : 'intensity',
      type : 'input',
      get : () => {
        return selectedObj.intensity
      },
      set : newinten => {
        selectedObj.intensity = parseFloat(newinten);
      }
    },
    {
      key : 'penumbra',
      type : 'input',
      get : () => {
        return selectedObj.penumbra;
      },
      set : newpenumbra => {
        selectedObj.penumbra = parseFloat(newpenumbra);
      }
    },
    {
      key : 'target',
      type : 'input',
      get : () => {
        return `${toTwoDigit(selectedObj.target.position.x)}, ${toTwoDigit(selectedObj.target.position.y)}, ${toTwoDigit(selectedObj.target.position.z)}`
      },
      set : newpos => {
        newpos = newpos.split(',').map(pos => parseFloat(pos));
        if ( selectedObj.target.parent === null ) {
          selectedObj.target.name = "SpotLightTarget" + selectedObj.uuid.slice(0,3);
          scene.add( selectedObj.target );
        }
        selectedObj.target.position.set( newpos[0], newpos[1], newpos[2] );
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

  // Effect
  useEffect(() => {

    buildRows();

  }, [selectedObj])

  useSignel(() => {

    buildRows();

  }, [signelnames.three_forceupdate])

  // Event
  const onKeyDown = (e, changeHandler) => {
    if (e.keyCode === ENTER_KEY) {
      changeHandler(e.target.value)
    }
  }

  const onBlur = (e, changeHandler) => {
    changeHandler(e.target.value)
    sendSignel(signelnames.three_forceupdate)
  } 

  const buildRows = () => {
    const rows = [];
    let row;

    acceptedKey.forEach(accepted => {

      if ( selectedObj !== undefined && selectedObj[accepted.key] !== undefined ) {
        row = buildRow(capitalizeFirstLetter(accepted.key), accepted.type, accepted.get(), accepted.set);
        rows.push(row);
      }

    });

    rows.length > 0 ? setRowsInfo( rows ) : setRowsInfo( [<span key='annount'>Please select object at selector panel.</span>] );
  } 

  // Build
  const buildRow = ( key, type, detail, changeHandler ) => {
    
    return (
      <MDBContainer key={key}>
        <MDBRow className='p-1'>
          <KeyCol size="6" className='no-gutters px-0'>
            {key} :
          </KeyCol>
          <InfoCol size="6" className='no-gutters px-0'
            // style={
            //   type === 'colorpicker' ? { position : 'unset' } : {}
            // }
          >
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



export default ObjectInfo;