import {
  ComponentInt,
  ComponentsInt,
  PropInt,
  ChildInt,
  Action
} from '../interfaces/Interfaces';

import {
  ADD_CHILD,
  ADD_COMPONENT,
  ADD_PROP,
  CHANGE_COMPONENT_FOCUS_CHILD,
  CHANGE_FOCUS_CHILD,
  CHANGE_FOCUS_COMPONENT,
  CHANGE_IMAGE_SOURCE,
  CHANGE_TUTORIAL,
  CODE_EDIT,
  CREATE_APPLICATION,
  CREATE_APPLICATION_ERROR,
  CREATE_APPLICATION_SUCCESS,
  DELETE_ALL_DATA,
  DELETE_CHILD,
  DELETE_COMPONENT,
  DELETE_IMAGE,
  DELETE_PROP,
  EDIT_COMPONENT,
  EDIT_MODE,
  EXPORT_FILES,
  EXPORT_FILES_ERROR,
  EXPORT_FILES_SUCCESS,
  HANDLE_CLOSE,
  HANDLE_TRANSFORM,
  LOAD_INIT_DATA,
  REDO,
  TOGGLE_CLASS,
  TOGGLE_STATE,
  UNDO,
  UPDATE_HTML_ATTR,
  UPDATE_CODE
} from '../actionTypes/index';
import { loadState } from '../localStorage';
import createFiles from '../utils/createFiles.util';
import createApplicationUtil from '../utils/createApplication.util';

export const addChild = ({
  title,
  childType,
  HTMLInfo
}: {
  title: string;
  childType: string;
  HTMLInfo: object;
}) => (dispatch: (arg: Action) => void) => {
  dispatch({ type: ADD_CHILD, payload: { title, childType, HTMLInfo } });
};

export const addComponent = ({ title }: { title: string }) => (
  dispatch: (arg: Action) => void
) => {
  dispatch({ type: ADD_COMPONENT, payload: { title } });
};

export const addProp = ({ key, type }: { key: string; type: string }) => ({
  type: ADD_PROP,
  payload: { key, type }
});

export const changeTutorial = (tutorial: number) => ({
  type: CHANGE_TUTORIAL,
  payload: { tutorial }
});

export const changeImagePath = (imageSource: string) => ({
  type: CHANGE_IMAGE_SOURCE,
  payload: { imageSource }
});

export const deleteChild = ({}) => (dispatch: (arg: Action) => void) => {
  // with no payload, it will delete focusd child
  dispatch({ type: DELETE_CHILD, payload: {} });
};

export const deleteComponent = ({
  componentId,
  stateComponents
}: {
  componentId: number;
  stateComponents: ComponentsInt;
}) => (dispatch: (arg: Action) => void) => {
  // find all places where the "to be deleted" is a child and do what u gotta do
  stateComponents.forEach((parent: ComponentInt) => {
    parent.childrenArray
      .filter((child: ChildInt) => child.childComponentId === componentId)
      .forEach((child: ChildInt) => {
        dispatch({
          type: DELETE_CHILD,
          payload: {
            parentId: parent.id,
            childId: child.childId,
            calledFromDeleteComponent: true
          }
        });
      });
  });

  // change focus to app
  dispatch({ type: CHANGE_FOCUS_COMPONENT, payload: { title: 'App' } });
  // after taking care of the children delete the component
  dispatch({ type: DELETE_COMPONENT, payload: { componentId } });
};

export const changeComponentFocusChild = ({
  componentId,
  childId
}: {
  componentId: number;
  childId: number;
}) => (dispatch: (arg: Action) => void) => {
  dispatch({
    type: CHANGE_COMPONENT_FOCUS_CHILD,
    payload: { componentId, childId }
  });
};

// make sure childId is being sent in
export const changeFocusChild = ({ childId }: { childId: number }) => (
  dispatch: (arg: Action) => void
) => {
  dispatch({ type: CHANGE_FOCUS_CHILD, payload: { childId } });
};

export const changeFocusComponent = ({ title }: { title: string }) => (
  dispatch: (arg: Action) => void
) => {
  dispatch({ type: CHANGE_FOCUS_COMPONENT, payload: { title } });
};

export const createApplication = ({
  path,
  components = [],
  genOption,
  appName = 'reactype_app',
  exportAppBool
}: {
  path: string;
  components: ComponentsInt;
  genOption: number;
  appName: string;
  exportAppBool: boolean;
}) => (dispatch: (arg: any) => void) => {
  if (genOption === 0) {
    exportAppBool = false;
    dispatch(
      exportFiles({
        appName,
        path,
        components,
        exportAppBool
      })
    );
  } else if (genOption) {
    exportAppBool = true;
    dispatch({
      type: CREATE_APPLICATION
    });
    createApplicationUtil({
      path,
      appName,
      genOption
    })
      .then(() => {
        dispatch({
          type: CREATE_APPLICATION_SUCCESS
        });
        dispatch(
          exportFiles({
            appName,
            path,
            components,
            exportAppBool
          })
        );
      })
      .catch((err: string) =>
        dispatch({
          type: CREATE_APPLICATION_ERROR,
          payload: { status: true, err }
        })
      );
  }
};

export const deleteAllData = () => ({
  type: DELETE_ALL_DATA
});

export const deleteImage = () => ({
  type: DELETE_IMAGE
});

export const deleteProp = (propId: number) => (
  dispatch: (arg: Action) => void
) => {
  dispatch({ type: DELETE_PROP, payload: propId });
};

export const editComponent = ({ id, title }: { id: number; title: string }) => (
  dispatch: (arg: Action) => void
) => {
  dispatch({ type: EDIT_COMPONENT, payload: { id, title } });
};

export const exportFiles = ({
  components,
  path,
  appName,
  exportAppBool
}: {
  components: ComponentsInt;
  path: string;
  appName: string;
  exportAppBool: boolean;
}) => (dispatch: (arg: Action) => void) => {
  // this dispatch sets the global state property 'loading' to true until the createFiles call resolves below
  dispatch({
    type: EXPORT_FILES
  });
  createFiles(components, path, appName, exportAppBool)
    .then((dir: any) =>
      dispatch({
        type: EXPORT_FILES_SUCCESS,
        payload: { status: true, dir: dir[0] }
      })
    )
    .catch((err: string) =>
      dispatch({
        type: EXPORT_FILES_ERROR,
        payload: { status: true, err }
      })
    );
};

export const handleClose = () => ({
  type: HANDLE_CLOSE,
  payload: false
});

export const handleTransform = (
  componentId: number,
  childId: number,
  {
    x,
    y,
    width,
    height
  }: { x: number; y: number; width: number; height: number }
) => ({
  type: HANDLE_TRANSFORM,
  payload: {
    componentId,
    childId,
    x,
    y,
    width,
    height
  }
});

export const loadInitData = () => (dispatch: (arg: Action) => void) => {
  loadState().then((data: any) => {
    dispatch({
      type: LOAD_INIT_DATA,
      payload: {
        data: data
          ? { ...data.workspace, history: [], historyIndex: 0, future: [] } //erase history upon opening app
          : {}
      }
    });
  });
};

export const redo = () => ({
  type: REDO
});

export const toggleComponentState = ({ id }: { id: number }) => (
  dispatch: (arg: Action) => void
) => {
  dispatch({ type: TOGGLE_STATE, payload: { id } });
};

export const toggleComponentClass = ({ id }: { id: number }) => (
  dispatch: (arg: Action) => void
) => {
  dispatch({ type: TOGGLE_CLASS, payload: { id } });
};

export const toggleEditMode = ({ id }: { id: number }) => (
  dispatch: (arg: Action) => void
) => {
  dispatch({ type: EDIT_MODE, payload: { id } });
};
//action creators for undo and redo
export const undo = () => ({
  type: UNDO
});

export const toggleCodeEdit = () => ({
  type: CODE_EDIT
});

export const updateCode = ({
  componentId,
  code
}: {
  componentId: number;
  code: string;
}) => (dispatch: (arg: Action) => void) => {
  dispatch({
    type: UPDATE_CODE,
    payload: { componentId, code }
  });
};

export const updateHtmlAttr = ({
  attr,
  value
}: {
  attr: string;
  value: string;
}) => (dispatch: (arg: Action) => void) => {
  dispatch({
    type: UPDATE_HTML_ATTR,
    payload: { attr, value }
  });
};
