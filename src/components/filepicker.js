import React, { forwardRef } from 'react';

const FilePicker = ({ onChange  }, filePickerRef) => {

  return (
    <input id="fileInput" type="file" style={{ display: 'none' }} ref={ filePickerRef } onChange={ (e) => onChange(e.target.files) }/>
  )
}

export default forwardRef(FilePicker);