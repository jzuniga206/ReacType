import {
  ComponentInt,
  ComponentsInt,
  ChildInt,
  ChildrenInt,
  PropInt
} from '../interfaces/Interfaces';
import cloneDeep from '../helperFunctions/cloneDeep';

const componentRender = (
  component: ComponentInt,
  components: ComponentsInt
) => {
  const {
    childrenArray,
    title,
    props,
    stateful,
    classBased
  }: {
    childrenArray: ChildrenInt;
    title: string;
    props: PropInt[];
    stateful: boolean;
    classBased: boolean;
  } = component;
  function typeSwitcher(type: string) {
    switch (type) {
      case 'string':
        return 'string';
      case 'number':
        return 'number';
      case 'object':
        return 'object';
      case 'array':
        return 'any[]';
      case 'boolean':
        return 'boolean';
      case 'function':
        return '() => any';
      case 'tuple':
        return '[any]';
      case 'enum':
        return '{}';
      case 'any':
        return 'any';
      default:
        return 'any';
    }
  }

  /*
  Function: propDrillTextGenerator

  Input:  child - the element of type  'ChildInt' that is being added to the code preview

  Output: a string literal to be used in the code preview section fro the prop -drilled components and 
    the HTML attributes 
    
  Description: Fucntion that getnerates the code preview for both the prop drilled properties 
    as well as HTML attributes
    added a conditional that checks whether the html  prop is 'src' if so it doesnt 
    use htmlAttrSanitizer.
    This leaves special characters in the source link of the image
  */
  function propDrillTextGenerator(child: ChildInt) {
    if (child.childType === 'COMP') {
      return components
        .find((c: any) => c.id === child.childComponentId)
        .props.map((prop: PropInt) => `${prop.key}={${prop.value}}`)
        .join(' ');
    }
    if (child.childType === 'HTML') {
      const keys: string[] = Object.keys(child.HTMLInfo);
      return keys
        .map(key => {
          if (key !== 'src') {
            return `${key}='${htmlAttrSanitizer(child.HTMLInfo[key])}'`;
          } else {
            return `${key}='${child.HTMLInfo[key]}'`;
          }
        })
        .join(' ');
    }
    return '';
  }

  function htmlAttrSanitizer(element: string) {
    // TODO: debug localForage unhappiness to renable image imports
    // this shouldn't be needed, but some characters make localForage unhappy
    //Deleted touppercase for word[0] --Tony I
    return element
      .replace(/[a-z]+/gi, word => word[0] + word.slice(1))
      .replace(/[-_\s0-9\W]+/gi, '');
  }

  function componentNameGenerator(child: ChildInt) {
    if (child.childType === 'HTML') {
      switch (child.componentName) {
        case 'Image':
          return 'img';
        case 'Form':
          return 'form';
        case 'Button':
          return 'button';
        case 'Link':
          return 'a href=""';
        case 'List':
          return 'ul';
        case 'Paragraph':
          return 'p';
        default:
          return 'div';
      }
    } else {
      return child.componentName;
    }
  }
  // logic below consists of conditional that will render depending
  // on the toggling of "state" and/or "class"
  // class components can optioally have a state which will
  // return "Component" from react to extend from
  //
  return `
    ${stateful && !classBased ? `import React, {useState} from 'react';` : ''}
    ${classBased ? `import React, {Component} from 'react';` : ''}
    ${!stateful && !classBased ? `import React from 'react';` : ''}

    ${childrenArray
      .filter(child => child.childType !== 'HTML')
      .map(
        child =>
          `import ${child.componentName} from './${child.componentName}.tsx'`
      )
      .reduce((acc: Array<string>, child) => {
        if (!acc.includes(child)) {
          acc.push(child);
          return acc;
        }
        return acc;
      }, [])
      .join('\n')}
    
    ${
      title == 'App'
        ? ''
        : `interface Props {
      ${props.map(prop => `${prop.key}: ${typeSwitcher(prop.type)}\n`)}
    };`
    }
    

      ${
        classBased
          ? `class ${title} extends Component {`
          : title == 'App'
          ? `const ${title} = () => {`
          : `const ${title} = (props: Props) => {`
      }
      ${
        stateful && !classBased
          ? `const  [prop, setProp] = useState("INITIAL VALUE FOR PROP");`
          : ``
      }
      ${
        classBased && stateful
          ? `constructor(props) {
        super(props);
        this.state = {}
       }`
          : ``
      }
      ${classBased ? `render(): JSX.Element {` : ``}
      ${
        title === 'App'
          ? ''
          : `const {${props.map(el => el.key).join(', ')}} = ${
              classBased ? `this.props` : `props`
            }`
      }
      
      return (
        <div>
        ${cloneDeep(childrenArray)
          .sort((a: ChildInt, b: ChildInt) => a.childSort - b.childSort)
          .map((child: ChildInt) => {
            if (child.componentName == 'Button') {
              return `
              <${componentNameGenerator(child)} ${propDrillTextGenerator(
                child
              )}>${child.HTMLInfo.value}</${componentNameGenerator(child)}>`;
            } else
              return `
              <${componentNameGenerator(child)} ${propDrillTextGenerator(
                child
              )}/>`;
          })
          .join(' ')}
        </div>
      );
    }
    ${classBased ? `}` : ``}
    export default ${title};
  `;
};

export default componentRender;
