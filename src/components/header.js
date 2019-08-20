import React, { forwardRef, useContext } from 'react';
import styled from 'styled-components';
import { MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle, MDBRow } from 'mdbreact';

import { ThreeJSContext } from './threeWarpper';

const Header = ({ headerStyle }, ref) => {

  const context = useContext(ThreeJSContext)
  const { sendSignel } = context;

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
    
      default:
        break;
    }
  }

  const StyledMDBRow = styled(MDBRow)`
    background: #77ecc6;
    box-shadow: rgba(0, 0, 0, 0.3) 0px -5px 30px -10px inset;
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
      {dropdowns}
      ⚡⚡⚡
    </StyledMDBRow>
  )
}

export default forwardRef(Header);
