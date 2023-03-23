import { Component, Injectable, ChangeDetectionStrategy } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

// Interface used for representing a node of data
export interface FakeNode {
  name: string;
  children: FakeNode[];
}

const MAX_LEVELS = 3;
const MAX_NODES_PER_LEVEL = 5; 

// Generates fake data
@Injectable()
export class RandomDataProvider {
  data: FakeNode[] = [];

  constructor() {
    for(let i = 0; i < MAX_NODES_PER_LEVEL; i++) {
      this.data.push(generateNode(0, i));
    }
  }
}

// Function for generating a fake data node
function generateNode(level: number, index: number): FakeNode {
  let children: FakeNode[] = [];
  if (level < MAX_LEVELS) {
    for (let i = 0; i < Math.round(Math.random() * MAX_NODES_PER_LEVEL); i++) {
      children.push(generateNode(level + 1, i));
    }
  }

  return {
    name: 'level ' + level + ' index ' + index,
    children,
  };
}

// Interface used for representing a node of data within the flat tree component
export interface FakeFlatNode {
  name: string;
  level: number;
  hasChildren: boolean;
}

// Component containing virtual scrolling flat tree 
@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ],
  providers: [RandomDataProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent  {
  // Provided generated data
  readonly providedData = this.dataProvider.data;
  // Tree control to feed to the cdk tree 
  readonly treeControl: FlatTreeControl<FakeFlatNode> = 
    new FlatTreeControl<FakeFlatNode>(getNodeLevel, getIsNodeExpandable);
  // Data source fed into the cdk tree control 
  readonly dataSource: MatTreeFlatDataSource<FakeNode, FakeFlatNode>;

  constructor(readonly dataProvider: RandomDataProvider) {
    // Tells tree data source builder how to flatten our nested node data into flat nodes
    const treeFlattener = 
      new MatTreeFlattener<FakeNode, FakeFlatNode>(
        nodeTransformer, 
        getNodeLevel, 
        getIsNodeExpandable, 
        getNodeChildren,
      );
    // Populates our flattened data into the tree control
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, treeFlattener);
    this.dataSource.data = this.providedData;
    console.log(this.dataSource.data);
  }

  // Number of dom nodes rendered in the virtually scrolling tree
  get numTreeNodes() {
    return document.querySelectorAll('.node').length;
  }

  // Number of dom nodes rendered in the non-virtually scrolling cdk-tree
  get numCdkTreeNodes() {
    return document.querySelectorAll('cdk-tree-node').length;
  }

  hasChild(index: number, nodeData: FakeFlatNode) {
    return getIsNodeExpandable(nodeData);
  }
}

// Function that maps a nested node to a flat node
function nodeTransformer(node: FakeNode, level: number) {
  return {
    name: node.name,
    level,
    hasChildren: node.children.length > 0,
  };
}

// Function that gets a flat node's level
function getNodeLevel({level}: FakeFlatNode) {
  return level;
}

// Function that determines whether a flat node is expandable or not
function getIsNodeExpandable({hasChildren}: FakeFlatNode) {
  return hasChildren;
}

// Function that returns a nested node's list of children 
function getNodeChildren({children}: FakeNode) {
  return children;
}