import React, { useState, FC } from "react";
import {
  Editor,
  Frame,
  Element,
  useNode,
  useEditor,
  Node,
} from "@craftjs/core";
import * as ReactDOMServer from "react-dom/server";
import data from './data.json';
// Props for TextComponent
interface TextComponentProps {
  text: string;
}

// Main Builder Component
const Builder: FC = () => {
  return (
    <div>
      <header>Some Fancy Header</header>
      <Editor resolver={{ TextComponent, Container }}>
        {/* Editable area */}
        <Frame>
          <Element is="div" style={{ background: "#ffffff" }} canvas>
            <h1 style={{ color: "black" }}>Hi</h1>
            <div style={{ display: "flex" }}><button>i am button</button></div>
            <h2 style={{ color: "black" }}>i am headline</h2>
            {/* <img
              width={200}
              src="https://static1.srcdn.com/wordpress/wp-content/uploads/2017/08/Itachi-Uchiha-Naruto.jpg"
              alt="Itachi Uchiha"
            /> */}
          </Element>
        </Frame>
        <SaveButton />
      </Editor>
    </div>
  );
};

export default Builder;

// TextComponent with Editable Text
const TextComponent: FC<TextComponentProps> = ({ text }) => {
  const {
    connectors: { connect, drag },
    isClicked,
    actions: { setProp },
  } = useNode((state) => ({
    isClicked: state.events.selected,
  }));

  return (
    <div ref={(dom) => connect(drag(dom as HTMLElement))}>
      <h2>{text}</h2>
      {isClicked && (
        <Modal>
          <input
            type="text"
            value={text}
            onChange={(e) =>
              setProp((props: TextComponentProps) => {
                props.text = e.target.value;
              })
            }
          />
        </Modal>
      )}
    </div>
  );
};

// Modal for editing text
interface ModalProps {
  children: React.ReactNode;
}

const Modal: FC<ModalProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return isOpen ? (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "white",
        padding: "20px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
      }}
    >
      {children}
      <button onClick={() => setIsOpen(false)}>Close</button>
    </div>
  ) : null;
};

// Container Component
const Container: FC = () => {
  const {
    actions: { add },
    query: { createNode, node },
  } = useEditor();

  const {
    id,
    connectors: { drag, connect },
  } = useNode();

  return (
    <div ref={(dom) => connect(drag(dom as HTMLElement))}>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          const {
            data: { type, props },
          } = node(id).get();
          const newNode = createNode(React.createElement(type, props));
          add(newNode);
        }}
      >
        Make a Copy of Me
      </a>
    </div>
  );
};


type NodeObject = {
  [key: string]: {
    type: string;
    isCanvas: boolean;
    props: Record<string, any>;
    displayName: string;
    custom: Record<string, any>;
    parent?: string;
    hidden: boolean;
    nodes: string[];
    linkedNodes: Record<string, any>;
  };
};

const generateHTMLFromObject = (nodesMap: NodeObject, rootId: string): string => {
  const traverse = (nodeId: string): string => {
    const node = nodesMap[nodeId];
    if (!node) return "";

    const { type, props, nodes } = node;

    // Extract style and other props
    const { style, children, ...restProps } = props;

    // Convert style object to inline CSS string
    const styleString = style
      ? `style="${Object.entries(style)
          .map(([key, value]) => `${key}: ${value}`)
          .join("; ")}"`
      : "";

    // Build HTML for the current node
    const openingTag = `<${type} ${styleString} ${Object.entries(restProps)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ")}>`;
    const closingTag = `</${type}>`;

    // Recursively generate HTML for child nodes
    const childHTML = nodes.map(traverse).join("");

    return `${openingTag}${children || ""}${childHTML}${closingTag}`;
  };

  return traverse(rootId);
};

// Example usage with the provided data
console.log("jsondata",generateHTMLFromObject(data, "root"));



// SaveButton Component
const SaveButton: FC = () => {
  const { query } = useEditor();
 
  const handleExport = (): void => {
    const serializedTree = query.serialize();
    const parsedTree: Record<string, Node> = JSON.parse(serializedTree);

    // Generate HTML
    // const rootNodeId = 'root';
    // const components: ComponentsMap = { TextComponent, Container };
    // const html = generateHTML(rootNodeId as any, components, parsedTree as any);

    // // CSS Placeholder
    // const css = `
    //   body {
    //     font-family: Arial, sans-serif;
    //     margin: 0;
    //     padding: 0;
    //   }
    // `;

    // Download HTML File
    // handleDownload(html, css);
    console.log(serializedTree, parsedTree)
  };

  return <button onClick={handleExport}>Export Design</button>;
};

// Generate Static HTML from the Node Tree
interface SerializedNode {
  type: {
    resolvedName: string;
  };
  props: Record<string, any>;
  children: string[];
}

interface ComponentsMap {
  [key: string]: React.ComponentType<any>;
}

const generateHTML = (
  node: SerializedNode,
  components: ComponentsMap,
  nodesMap: Record<string, SerializedNode>
): string => {
  if (!node) return "";

  const { type, props, children } = node;
  const Component = components[type.resolvedName];

  return ReactDOMServer.renderToStaticMarkup(
    <Component {...props}>
      {children?.map((childId) =>
        generateHTML(nodesMap[childId], components, nodesMap)
      )}
    </Component>
  );
};

// Generate Exportable Document
const generateExportDocument = (html: string, css: string): string => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Exported Page</title>
      <style>${css}</style>
    </head>
    <body>${html}</body>
  </html>
`;

// Download File Utility
const downloadFile = (content: string, filename: string, type: string): void => {
  const blob = new Blob([content], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

// Handle File Download
const handleDownload = (html: string, css: string): void => {
  const documentContent = generateExportDocument(html, css);
  console.log(documentContent)
  downloadFile(documentContent, "exported-design.html", "text/html");
};

