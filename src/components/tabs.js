import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from 'react-router-dom'; 
import { MDBContainer, MDBCol, MDBRow, MDBTabContent, MDBNav, MDBNavItem, MDBNavLink } from "mdbreact";

import styled from 'styled-components';

const StyledMDBNavLink = styled(MDBNavLink)`
  background: white;
  color: black;
  box-shadow: rgba(0,0,0,0.2) 0px -5px 30px -10px inset;
  border: none; 
  padding : 0.3rem 0.6rem;
`

const StyledMDBNavItem = styled(MDBNavItem)`
`

const StyledMDBRow = styled(MDBRow)`
  background: #5ef2c6;
`

const StyledMDBTabContent = styled(MDBTabContent)`
  width: 100%;
`

const Tabs = ({ children, namearray, defalutname }) => {
  const [activeItem, setActiveItem] = useState(defalutname);
  const [tabLinks, setTabLinks] = useState([]);

  return (
    <MDBContainer fluid>
      <Router>
        <StyledMDBRow>
          <MDBCol className='no-gutters px-0'>
            <MDBNav className="nav-tabs">
              { namearray.map(name =>         
              <StyledMDBNavItem key={name}>
                <StyledMDBNavLink 
                  to="#" 
                  active={activeItem === name} 
                  style={ activeItem === name ? { background : '#0d9b71', color: 'white'} : {}} 
                  onClick={() => setActiveItem(name)} 
                  role="tab" 
                >
                  {name.toUpperCase()}
                </StyledMDBNavLink>
              </StyledMDBNavItem>
              ) }
              {/* {tabLinks} */}
            </MDBNav>
          </MDBCol>
        </StyledMDBRow>
        <MDBRow>
          <MDBCol className='no-gutters px-0'>
            <StyledMDBTabContent activeItem={activeItem} >
              { children }
            </StyledMDBTabContent>
          </MDBCol>
        </MDBRow>
      </Router>
    </MDBContainer>
  )
}

export default Tabs;