import React, { Component, useState } from 'react';
import { MDBContainer, MDBBtn, MDBModal, MDBModalBody, MDBModalHeader, MDBModalFooter } from 'mdbreact';

const ModalPage = ({children, title, onHide, isOpen}) => {
  return (
  <MDBContainer>
    <MDBModal isOpen={isOpen} toggle={onHide}>
      { title ? <MDBModalHeader toggle={onHide}>MDBModal title</MDBModalHeader> : undefined }
      <MDBModalBody>
        {children}
      </MDBModalBody>
      <MDBModalFooter>
        <MDBBtn color="primary" onClick={onHide}>Close</MDBBtn>
      </MDBModalFooter>
    </MDBModal>
  </MDBContainer>
  );
}

export default ModalPage;