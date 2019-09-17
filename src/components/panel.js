import React, { forwardRef } from 'react';
import { MDBRow, MDBTabPane, MDBContainer } from 'mdbreact';

// import RSC from "react-scrollbars-custom";

import styled from 'styled-components';

// import Tabs from './tabs';
import Tabs from './tabs';
import SceneTree from './three/controller/scenetree';
import ObjectInfo from './three/controller/objectinfo';

const StyledPanel = styled.div`
  background: #a0f1d7;
  box-shadow: rgba(0, 0, 0, 0.3) 0px -5px 30px -10px inset; 
    box-shadow: rgba(0, 0, 0, 0.3) 0px -5px 30px -10px inset; 
  box-shadow: rgba(0, 0, 0, 0.3) 0px -5px 30px -10px inset; 
`

const PanelSection = styled.div`
  margin: 1rem;
  padding: 0.5rem;
  overflow-y: auto;
`

const SceneSection = styled(PanelSection)`
  background: #f2f2f2;
  height: 200px;
`

const ObjDetailSection = styled(PanelSection)`
  overflow-x: none;
`

const Panel = ({ panelStyle }, panelRef) => {

  return (
    <StyledPanel ref={ panelRef } style={ panelStyle }>
      <Tabs defalutname="scene" namearray={["scene","detail","setting"]}>
        <MDBTabPane tabId="scene" role="tabpanel">
          <SceneSection>
            <SceneTree/>
          </SceneSection>
          <Tabs defalutname="geo" namearray={["geo","material","info"]}>
            <MDBTabPane tabId="geo" role="tabpanel">
              <ObjDetailSection>
                <ObjectInfo/>
              </ObjDetailSection>
            </MDBTabPane>
          </Tabs>
        </MDBTabPane>
        <MDBTabPane tabId="detail" role="tabpanel">
          <p className="mt-2">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            Nihil odit magnam minima, soluta doloribus reiciendis
            molestiae placeat unde eos molestias. Quisquam aperiam,
            pariatur. Tempora, placeat ratione porro voluptate odit
            minima.
          </p>
        </MDBTabPane>
        <MDBTabPane name="setting">
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