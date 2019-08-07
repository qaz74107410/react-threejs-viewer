const menuReducer = (state, {type, payload}) => {
  switch (type) {
    case 'FILE_NEW' :
    break;
    case 'FILE_IMPORT' :
    break;
    case 'FILE_EXPORT_DAE' :
    break;
    case 'FILE_EXPORT_GLB' :
    break;
    case 'FILE_EXPORT_GLTF' :
    break;
    case 'FILE_EXPORT_OBJ' :
    break;
    case 'FILE_EXPORT_STL' :
    break;
    case 'EDIT_UNDO' :
    break;
    case 'EDIT_REDO' :
    break;
    case 'EDIT_CLONE' :
    break;
    case 'EDIT_DELETE' :
    break;
    case 'ADD' :
      // TODO
      return state
    break;
    case 'HELP_SOURCE_CODE' :
    break;
    case 'HELP_ABOUT' :
    break;
    default:
      return state
  }
}

const menuState = {
  // FILE
  isSelectNew : false,
  isSelectImport : false,
  isSelectExportDAE : false,
  isSelectExportGLB : false,
  isSelectExportGLTF : false,
  isSelectExportSTL : false,
  // EDIT
  isSelectEditUndo : false,
  isSelectEditRedo : false,
  isSelectEditClone : false,
  isSelectEditDelete : false,
  // HELP
  isSelectHelpSourceCode : false,
  isSelectHelpAbout : false
}

export { menuReducer, menuState };