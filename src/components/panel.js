import React, { forwardRef } from 'react';
import { MDBContainer } from 'mdbreact';

import styled from 'styled-components';

const Panel = ({ panelStyle }, panelRef) => {

  const StyledPanel = styled.div`
    background: #a0f1d7;
    /* position: absolute; */

  `

  return (
    <StyledPanel ref={ panelRef } style={ panelStyle }>
      
    </StyledPanel>
  )
}

export default forwardRef(Panel);