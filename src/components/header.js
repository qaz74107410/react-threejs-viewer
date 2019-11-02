import React, { forwardRef, useContext, useRef, useState } from 'react';
import styled from 'styled-components';
import { MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle, MDBRow } from 'mdbreact';

import ModalPage from './modal';

import { ThreeJSContext } from './threeWarpper';
import FilePicker from './filepicker';
import Loader from './three/loader';

const Header = ({ headerStyle }) => {

  const context = useContext(ThreeJSContext)
  const { sendSignel, scene } = context;

  const [ modalShow, setModalShow ] = useState(false);
  const [ modalTitle, setModalTitle ] = useState("");
  const [ modalChildren, setModalChildren ] = useState(null);

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
      "Example",
      "About"
    ],
  }

  const onClickHandler = menuname => {
    switch ( menuname.toLowerCase() ) {
      case "new":
        sendSignel("menu_new");
        break;
      case "import":
        filePickerRef.current.click();  
        break;

      case "example":
        showModal( menuname );
        break;
      default:
        break;
    }
  }

  // Modal manage

  const showModal = ( name ) => {
    setModalTitle( name );
    setModalShow( true );
    switch ( name.toLowerCase() ) {
      case "example":
        setModalChildren(<h2>Test :D</h2>)
        break;
    
      default:
        break;
    }
  }

  // Loader

  const loader = new Loader( scene );
  const onImport = files => {
    loader.loadFiles( files, () => {
      sendSignel("menu_import")
    })
  }

  // Styled

  const StyledMDBRow = styled(MDBRow)`
    background: #77ecc6;
    box-shadow: rgba(0, 0, 0, 0.3) 0px -5px 30px -10px inset;
    font-size : 0.9rem;
  `

  // Menu builder
  
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
    <StyledMDBRow style={ headerStyle }>
      <FilePicker ref={filePickerRef} onChange={onImport}/>
      {dropdowns}
      ⚡⚡⚡
      <ModalPage isOpen={modalShow} title={ modalTitle } onHide={() => setModalShow(false)} >{ modalChildren }</ModalPage>
    </StyledMDBRow>
  )
}

export default Header;
