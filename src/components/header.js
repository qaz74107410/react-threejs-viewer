import React, { forwardRef, useContext, useRef } from 'react';
import styled from 'styled-components';
import { MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle, MDBRow } from 'mdbreact';

import { ThreeJSContext } from './threeWarpper';
import FilePicker from './filepicker';
import Loader from './three/loader';

const Header = ({ headerStyle }, ref) => {

  const context = useContext(ThreeJSContext)
  const { sendSignel, scene } = context;

  // import
  const filePickerRef = useRef();

  const menus = {
    "File" : [
      "New",
      "-",
      "Import",
      "-",
      "Export DAE",
      "Export GLB",
      "Export GLTF",
      "Export OBJ",
      "Export STL",
    ],
    "Edit" : [
      "Undo",
      "Redo",
      "-",
      "Clone",
      "Delete"
    ],
    "Help" : [
      "Source Code",
      "About"
    ]
  }

  const onClickHandler = menuname => {
    switch ( menuname ) {
      case "New":
        sendSignel("menu_new");
        break;
      case "Import":
        filePickerRef.current.click();  
        break;
    
      default:
        break;
    }
  }

  const loader = new Loader( scene );
  const onImport = files => {
    loader.loadFiles( files, () => {
      sendSignel("menu_import")
    })
  }

  const StyledMDBRow = styled(MDBRow)`
    background: #77ecc6;
    box-shadow: rgba(0, 0, 0, 0.3) 0px -5px 30px -10px inset;
    font-size : 0.9rem;
  `
  
  const dropdowns = [];
  for ( const key in menus ) {
    if ( menus.hasOwnProperty(key) ) {
      const items = [];
      menus[key].forEach((submenu, index) => {
        if ( submenu !== "-" ) {
      items.push(<MDBDropdownItem key={index+key} onClick={e => onClickHandler( submenu )}>{submenu}</MDBDropdownItem>)
        } else {
          items.push(<MDBDropdownItem key={index+key} divider />)
        }
      });
      dropdowns.push(
        <MDBDropdown key={key}>
          <MDBDropdownToggle caret color="white" className="py-1">
            {key}
          </MDBDropdownToggle>
          <MDBDropdownMenu basic>
            {items}
          </MDBDropdownMenu>
        </MDBDropdown>
      )
    }
  }
    
  return (
    <StyledMDBRow ref={ref} style={ headerStyle }>
      <FilePicker ref={filePickerRef} onChange={onImport}/>
      {dropdowns}
      ⚡⚡⚡
    </StyledMDBRow>
  )
}

export default forwardRef(Header);
