import React, { Component } from 'react';
import { Transformer } from 'react-konva';
import { ChildInt } from '../../interfaces/Interfaces';
import Konva from 'konva';

interface TCompPropsInt {
  focusChild: ChildInt;
  color: string;
  anchorSize: number;
}

export default class TransformerComponent extends Component<TCompPropsInt> {
  componentDidMount() {
    this.checkNode();
  }

  componentDidUpdate() {
    this.checkNode();
  }
  transformer: Konva.Transformer;
  // this function makes sure the transformer follows along with the focusChild
  checkNode() {
    const stage = this.transformer.getStage();
    const { focusChild } = this.props;

    const selectedNode = stage.findOne(`.${focusChild.childId}`);

    if (selectedNode === this.transformer.node()) {
      return;
    }
    if (selectedNode) {
      this.transformer.attachTo(selectedNode);
    } else {
      this.transformer.detach();
    }
    this.transformer.getLayer().batchDraw();
  }

  render() {
    return (
      <Transformer
        className={'Transformer'}
        rotateEnabled={false}
        ref={node => {
          this.transformer = node;
        }}
        borderEnabled={false}
        anchorFill={this.props.color}
        anchorStroke={this.props.color}
        anchorSize={this.props.anchorSize}
        keepRatio={false}
      />
    );
  }
}
