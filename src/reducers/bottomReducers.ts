import cloneDeep from '../helperFunctions/cloneDeep';
import {
  ApplicationStateInt,
  ChildInt,
  ComponentInt,
  ComponentsInt,
  PropInt
} from '../interfaces/Interfaces';
import { createHistory } from '../helperFunctions/createHistory';

export const addProp = (
  state: ApplicationStateInt,
  {
    key,
    value = null,
    required,
    type
  }: { key: string; value: string; required: boolean; type: string }
) => {
  if (!state.focusComponent.id) {
    console.log('Add prop error. no focused component ');
    return state;
  }

  const selectedComponent = state.components.find(
    (comp: ComponentInt) => comp.id === state.focusComponent.id
  );

  if (!state.codeReadOnly) {
    const check = window.confirm(
      `Are you sure you want to add a Prop to the ${state.focusComponent.title} component while the program is in the "Edit Mode"? \n\nAll of the changes to the "Code Preview" for the ${state.focusComponent.title} component will be overridden!`
    );
    if (!check) {
      return {
        ...state
      };
    }
  }
  const newProp: PropInt = {
    id: selectedComponent.nextPropId,
    key,
    value: value || key,
    required,
    type
  };
  const newProps = [...selectedComponent.props, newProp];

  const modifiedComponent: ComponentInt = {
    ...selectedComponent,
    props: newProps,
    nextPropId: selectedComponent.nextPropId + 1,
    changed: true
  };

  const newComponents: ComponentsInt = state.components.filter(
    (comp: ComponentInt) => comp.id !== selectedComponent.id
  );
  newComponents.push(modifiedComponent);
  const { history, historyIndex, future } = createHistory(state);

  return {
    ...state,
    components: newComponents,
    focusComponent: modifiedComponent,
    historyIndex,
    history,
    future,
    codeReadOnly: true
  };
};

export const deleteProp = (state: ApplicationStateInt, propId: number) => {
  if (!state.focusComponent.id) {
    console.log('Delete prop error. no focused component ');
    return state;
  }

  const modifiedComponent: any = cloneDeep(
    state.components.find(
      (comp: ComponentInt) => comp.id === state.focusComponent.id
    )
  );
  if (!state.codeReadOnly) {
    const check = window.confirm(
      `Are you sure you want to delete a Prop from the ${state.focusComponent.title} component while the program is in the "Edit Mode"? \n\nAll of the changes to the "Code Preview" for the ${state.focusComponent.title} component will be overridden!`
    );
    if (!check) {
      return {
        ...state
      };
    }
  }

  const indexToDelete = modifiedComponent.props.findIndex(
    (prop: PropInt) => prop.id === propId
  );
  if (indexToDelete === -1) {
    console.log(
      `Delete prop Error. Prop id:${propId} not found in ${modifiedComponent.title}`
    );
    return state;
  }

  modifiedComponent.props.splice(indexToDelete, 1);

  modifiedComponent.changed = true;

  const newComponentsArray = state.components.filter(
    (comp: ComponentInt) => comp.id !== modifiedComponent.id
  );
  newComponentsArray.push(modifiedComponent);
  const { history, historyIndex, future } = createHistory(state);

  return {
    ...state,
    components: newComponentsArray,
    focusComponent: modifiedComponent,
    history,
    historyIndex,
    future
  };
};

export const handleClose = (state: ApplicationStateInt, status: string) => ({
  ...state,
  errorOpen: status,
  successOpen: status
});

export const toggleCodeEdit = (state: ApplicationStateInt) => ({
  ...state,
  codeReadOnly: !state.codeReadOnly
});

export const updateChildrenSort = (
  state: ApplicationStateInt,
  { newSortValues }: { newSortValues: any }
) => {
  const modifiedChildrenArray: any = cloneDeep(
    state.focusComponent.childrenArray
  );

  for (let i = 0; i < modifiedChildrenArray.length; i += 1) {
    const currChild = modifiedChildrenArray[i];
    const currChildId = currChild.childId;
    const newValueObj = newSortValues.find(
      (n: any) => n.childId === currChildId
    );
    const newSortValue = newValueObj.childSort;
    console.log(
      ` currChildId  ${currChildId} currSortValue: ${currChild.childSort} newSortValue:${newSortValue}`
    );
    currChild.childSort = newSortValue;
  }

  const modifiedComponent = state.components.find(
    (comp: ComponentInt) => comp.id === state.focusComponent.id
  );
  modifiedComponent.childrenArray = modifiedChildrenArray;

  const modifiedComponentsArray = state.components.filter(
    (comp: ComponentInt) => comp.id !== state.focusComponent.id
  );
  modifiedComponentsArray.push(modifiedComponent);

  return {
    ...state,
    components: modifiedComponentsArray,
    focusComponent: modifiedComponent
  };
};

export const updateCode = (
  state: ApplicationStateInt,
  { componentId, code }: { componentId: number; code: string }
) => {
  //creates a deep copy of the components
  const componentsCopy = cloneDeep(state.components);
  const focusCompCopy = cloneDeep(state.focusComponent);
  if (focusCompCopy.id === componentId) {
    focusCompCopy.code = code;
    focusCompCopy.changed = false;
  }
  componentsCopy.forEach((comp: ComponentInt) => {
    if (comp.id === componentId) {
      comp.code = code;
      comp.changed = false;
    }
  });
  return {
    ...state,
    components: componentsCopy,
    focusComponent: focusCompCopy
  };
};

export const updateHtmlAttr = (
  state: ApplicationStateInt,
  { attr, value }: { attr: string; value: string }
) => {
  if (!state.focusChild.childId) {
    console.log('Update HTML error. no focused child ');
    return state;
  }

  if (!state.codeReadOnly) {
    const check = window.confirm(
      `Are you sure you want to update the HTML attributes of the ${state.focusComponent.title} component while the program is in the "Edit Mode"? \n\nAll of the changes to the "Code Preview" for the ${state.focusComponent.title} component will be overridden!`
    );
    if (!check) {
      return {
        ...state
      };
    }
  }
  const modifiedChild: any = cloneDeep(state.focusChild);
  modifiedChild.HTMLInfo[attr] = value;

  const modifiedComponent: ComponentInt = JSON.parse(
    JSON.stringify(
      state.components.find(
        (comp: ComponentInt) => comp.id === state.focusComponent.id
      )
    )
  );
  modifiedComponent.changed = true;
  modifiedComponent.childrenArray = modifiedComponent.childrenArray.filter(
    (child: ChildInt) => child.childId !== modifiedChild.childId
  );
  modifiedComponent.childrenArray.push(modifiedChild);

  const newComponentsArray = state.components.filter(
    (comp: ComponentInt) => comp.id !== modifiedComponent.id
  );
  newComponentsArray.push(modifiedComponent);
  const { history, historyIndex, future } = createHistory(state);

  return {
    ...state,
    components: newComponentsArray,
    focusComponent: modifiedComponent,
    focusChild: modifiedChild,
    history,
    historyIndex,
    future,
    codeReadOnly: true
  };
};
