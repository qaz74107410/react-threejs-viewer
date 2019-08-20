import { useReducer } from 'react';

const [signel, dispatch] = useReducer(reducer, state);

const reducer = (state, {type, payload}) => {
  switch (type) {
    // Menu file
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
    // Menu Edit
    case 'EDIT_UNDO' :
      break;
    case 'EDIT_REDO' :
      break;
    case 'EDIT_CLONE' :
      break;
    case 'EDIT_DELETE' :
      break;
    // Menu Add
    case 'ADD' :
      // TODO
      return state
      break;
    // Menu Help
    case 'HELP_SOURCE_CODE' :
      break;
    case 'HELP_ABOUT' :
      break;

    // Object manipulate
    case 'OBJ_SELECT' :
      state.isObjectSelect = true;
      return state
    case 'OBJ_ADD' :
      state.isObjectAdd = true;
      return state
    case 'OBJ_REMOVE' :
      state.isObjectRemove = true;
      return state

    // break;
    default:
      return state
  }
}

const state = {

  // MENU
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
  isSelectHelpAbout : false,

  // OBJ MANIPULATE
  isObjectSelect : false,
  isObjectAdd : false,
  isObjectRemove : false
}

export { signel, dispatch };