import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from 'react-router-dom'; 
import { MDBContainer, MDBRow, MDBTabContent, MDBNav, MDBNavItem, MDBNavLink } from "mdbreact";

import styled from 'styled-components';

const Tabs = ({ children, namearray, defalutname }) => {
  const [activeItem, setActiveItem] = useState(defalutname);
  const [tabLinks, setTabLinks] = useState([]);

  const StyledMDBNavLink = styled(MDBNavLink)`
    background: white;
    color: black;
    box-shadow: rgba(0,0,0,0.2) 0px -5px 30px -10px inset;
    border: none; 
  `

  const StyledMDBNavItem = styled(MDBNavItem)`
  `

  const StyledMDBRow = styled(MDBRow)`
    background: #5ef2c6;
  `

  // useEffect(() => {
  //   const tabs = []
  //   namearray.forEach(name => {
  //     const showname = name.toUpperCase();
  //     tabs.push(
  //       <StyledMDBNavItem key={name}>
  //         <StyledMDBNavLink 
  //           to="#" 
  //           active={activeItem === name} 
  //           style={ activeItem === name ? { background : '#0d9b71', color: 'white'} : {}} 
  //           onClick={() => setActiveItem(name)} 
  //           role="tab" 
  //         >
  //           {showname}
  //         </StyledMDBNavLink>
  //       </StyledMDBNavItem>
  //     );
  //   });
  //   setTabLinks(tabs)
  //   return () => {
  //     setTabLinks([]);
  //   }
  // }, [activeItem])

  return (
    <MDBContainer fluid>
      <Router>
        <StyledMDBRow>
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
        </StyledMDBRow>
        <MDBTabContent activeItem={activeItem} >
          { children }
        </MDBTabContent>
      </Router>
    </MDBContainer>
  )
}

export default Tabs;