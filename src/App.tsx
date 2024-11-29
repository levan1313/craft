import React, { useState } from "react";
import Builder from "./components/Builder";
import { generateHTMLFromObject, generateObjectFromHtml, NodeData } from "./components/transformFunctions";



const nodeData: Record<string, NodeData> = {
  ROOT: {
    type: "section",
    isCanvas: true,
    props: { style: { background: "#f0f0f0", padding: "20px" } },
    displayName: "section",
    custom: {},
    hidden: false,
    linkedNodes: {},
    nodes: ["node-1", "node-2"],
  },
  "node-1": {
    type: "h1",
    isCanvas: false,
    props: { style: { color: "blue" }, children: "Hello, World!" },
    displayName: "h1",
    custom: {},
    hidden: false,
    linkedNodes: {},
    nodes: [],
  },
  "node-2": {
    type: "section",
    isCanvas: false,
    props: { style: { display: "flex", gap: "10px" } },
    displayName: "div",
    custom: {},
    hidden: false,
    linkedNodes: {},
    nodes: ["node-3", "node-4"],
  },
  "node-3": {
    type: "button",
    isCanvas: false,
    props: { children: "Click Me" },
    displayName: "button",
    custom: {},
    hidden: false,
    linkedNodes: {},
    nodes: [],
  },
  "node-4": {
    type: "span",
    isCanvas: false,
    props: { style: { color: "red" }, children: "I'm a span" },
    displayName: "span",
    custom: {},
    hidden: false,
    linkedNodes: {},
    nodes: [],
  },
};



const createReactElement = (
  nodeId: string,
  nodesMap: Record<string, NodeData>
): React.ReactElement | null => {
  const node = nodesMap[nodeId];
  if (!node) return null;

  const { type, props, nodes } = node;

  // Create React elements for child nodes
  const children = nodes.map((childId) =>
    createReactElement(childId, nodesMap)
  );

  // Return the React element for the current node
  return React.createElement(type, props, ...children);
};

function App() {
  const [count, setCount] = useState(0);

  // Generate HTML from the `data`
  const html = generateHTMLFromObject(nodeData, "ROOT")
  const object = generateObjectFromHtml(html);
  const html2 = generateHTMLFromObject(object, "ROOT")
  const object2 = generateObjectFromHtml(html2);
  const html3 = generateHTMLFromObject(object2, "ROOT")
  console.log(1,html);
  console.log(2,html2);
  console.log(3,html3);


  return (
    <>
      <h1>testing</h1>
      {createReactElement("ROOT",nodeData)}
      <Builder />
    </>
  );
}

export default App;