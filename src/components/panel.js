import React, { forwardRef } from 'react';
import { MDBTabPane, MDBRow, MDBContainer } from 'mdbreact';

import styled from 'styled-components';

import Tabs from './tabs';
import Scene from './three/controller/scene';

const Panel = ({ panelStyle }, panelRef) => {

  const StyledPanel = styled.div`
    background: #a0f1d7;
    box-shadow: rgba(0, 0, 0, 0.3) 0px -5px 30px -10px inset; 
  `

  return (
    <StyledPanel ref={ panelRef } style={ panelStyle }>
      <Tabs defalutname="scene" namearray={["scene","detail","setting"]}>
        <MDBTabPane tabId="scene" role="tabpanel" className="">
          <Scene/>
        </MDBTabPane>
        <MDBTabPane tabId="detail" role="tabpanel" className="">
          <p className="mt-2">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            Nihil odit magnam minima, soluta doloribus reiciendis
            molestiae placeat unde eos molestias. Quisquam aperiam,
            pariatur. Tempora, placeat ratione porro voluptate odit
            minima.
          </p>
        </MDBTabPane>
        <MDBTabPane tabId="setting" role="tabpanel" className="">
          <p className="mt-2">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            Nihil odit magnam minima, soluta doloribus reiciendis
            molestiae placeat unde eos molestias. Quisquam aperiam,
            pariatur. Tempora, placeat ratione porro voluptate odit
            minima.
          </p>
        </MDBTabPane>
      </Tabs>
    </StyledPanel>
  )
}

export default forwardRef(Panel);