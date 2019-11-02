import React, { useEffect, useState, useContext, useRef } from 'react';
import { ThreeJSContext } from '../../threeWarpper';

import SortableTree from 'react-sortable-tree';
// import SortableTree from 'react-sortable-tree/dist/index.esm.js';
import FileExplorerTheme from 'react-sortable-tree-theme-file-explorer';
import 'react-sortable-tree/style.css'; // This only needs to be imported once in your app

import './scene.css';

import styled from 'styled-components';

import { MDBRow } from 'mdbreact';

const StyledMDBRow = styled(MDBRow)`
  display: block;
`

const SceneTree = () => {

  const context = useContext(ThreeJSContext)
  const { scene, selectObj, settings } = context;
  
  const [treeData, setTreeData] = useState([]);
  
  const sortableTreeRef = useRef();
  const wrapperRef = useRef();
  const prevRowRef = useRef();

  const mapTreeData = (realobjs, treeobjs = [], option = {}) => {
    return realobjs.filter( (robj) => {
      // 
      return robj.name !== settings.invisname
    }).map( (robj, index) => {
      if ( treeobjs.length > index ) {
        // object aleardy exist
        const tobj = treeobjs[index];

        tobj.children = robj.children.length >= 0 ? mapTreeData( robj.children, tobj.children ) : undefined

        return tobj
      } else {
        // create new object node
        const node = {};
        node.object = robj;
        node.id = robj.uuid
        node.title = robj.name ? robj.type + ' : ' + robj.name : robj.type;
        node.children = robj.children.length >= 0 ? mapTreeData( robj.children ) : undefined;
        node.expanded = option.expanded || false;
        return node;
      }
    });
  }
  
  useEffect(() => {
    if ( scene ) {
      setTreeData( mapTreeData( [scene], treeData, { expanded: true } ) );
      prevRowRef.current && toggleSelectClass(prevRowRef.current, true);
    }
  }, [JSON.stringify(scene)])

  const onSelectNode = (e, rowInfo) => {
    const elem = e.target;
    if(elem.className.includes('collapseButton') || elem.className.includes('expandButton')) {

      // Ignore the onlick, or do something different as the (+) or (-) button has been clicked.  

    } else {
      
      let rowelem = elem;
      const MAXFIND = 4
      
      for (let i = 0; i < MAXFIND; i++) {
        
        if ( rowelem.className.includes('rowContents') ) {
          
          selectObj(rowInfo.node.object);
          toggleSelectClass( rowelem );
          prevRowRef.current && toggleSelectClass(prevRowRef.current)
          prevRowRef.current = rowelem;

          break;

        } 

        rowelem = rowelem.parentNode;
     
      }

    }
  }

  const onDeselectNode = e => {
    if ( e.target !== wrapperRef.current ) return
    prevRowRef.current && toggleSelectClass(prevRowRef.current)
    prevRowRef.current = null;
    selectObj(undefined);
  }

  const toggleSelectClass = (node, bool) => {
    ! node.className.includes('rowSelected') || bool ? node.className = node.className + " rowSelected" : node.classList.remove("rowSelected");
  }

  return (
    <div
      style={{minHeight : 400}}
      onClick={e => onDeselectNode(e)}
      ref={wrapperRef}
    >
      <SortableTree
        treeData={treeData}
        canDrag={false}
        onChange={treeData => setTreeData( treeData )}  
        getNodeKey={({ node }) => node.id}
        theme={FileExplorerTheme}
        isVirtualized={false}
        generateNodeProps={rowInfo => ({
          onClick: e => onSelectNode(e, rowInfo),
        })}
        ref={sortableTreeRef}
      />
    </div>
  )
}

export default SceneTree
