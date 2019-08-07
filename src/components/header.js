import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle, MDBRow } from 'mdbreact';

const Header = ({ headerStyle }, ref) => {

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

  const StyledMDBRow = styled(MDBRow)`
    background: #77ecc6;
  `
  
  const dropdowns = [];
  for ( const key in menus ) {
    if ( menus.hasOwnProperty(key) ) {
      const items = [];
      menus[key].forEach((submenu, index) => {
        if ( submenu !== "-" ) {
          items.push(<MDBDropdownItem key={index+key} >{submenu}</MDBDropdownItem>)
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
