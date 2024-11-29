import { generateHTMLFromObject, generateObjectFromHtml } from "./transformFunctions";
import { NodeData } from "./transformFunctions";


// Example data for testing
const nodeData: Record<string, NodeData> = {
    ROOT: {
      type: "div",
      isCanvas: true,
      props: { style: { background: "#ffffff" } },
      displayName: "div",
      custom: {},
      hidden: false,
      nodes: ["node-1", "node-2"],
      linkedNodes: {},
    },
    "node-1": {
      type: "h1",
      isCanvas: false,
      props: { style: { color: "black" }, children: "Hi" },
      displayName: "h1",
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {},
    },
    "node-2": {
      type: "button",
      isCanvas: false,
      props: { children: "Click Me" },
      displayName: "button",
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {},
    },
  };
  
  const expectedHTML = `<div style="background: #ffffff"><h1 style="color: black">Hi</h1><button>Click Me</button></div>`;

  
  const normalizeHTML = (html: string): string =>
    html
      .replace(/>\s+/g, ">") // Remove spaces after '>'
      .replace(/\s+</g, "<") // Remove spaces before '<'
      .replace(/\s+/g, " ") // Collapse multiple spaces into one
      .trim(); // Remove leading/trailing spaces  
  
  describe("Transform Functions", () => {
    test("generateHTMLFromObject should generate correct HTML from NodeData", () => {
      const result = generateHTMLFromObject(nodeData, "ROOT");
      expect(normalizeHTML(result)).toEqual(normalizeHTML(expectedHTML));
    });
  
    test("generateObjectFromHtml should generate correct NodeData from HTML", () => {
      const result = generateObjectFromHtml(expectedHTML);
      const rootNode = result["ROOT"];
      expect(rootNode.type).toBe("div");
      expect(rootNode.nodes.length).toBe(2);
  
      const firstChildId = rootNode.nodes[0];
      const firstChild = result[firstChildId];
      expect(firstChild.type).toBe("h1");
      expect(firstChild.props.children).toBe("Hi");
  
      const secondChildId = rootNode.nodes[1];
      const secondChild = result[secondChildId];
      expect(secondChild.type).toBe("button");
      expect(secondChild.props.children).toBe("Click Me");
    });
  
    test("generateObjectFromHtml and generateHTMLFromObject should be reversible", () => {
      const objectFromHtml = generateObjectFromHtml(expectedHTML);
      const htmlFromObject = generateHTMLFromObject(objectFromHtml, "ROOT");
      expect(normalizeHTML(htmlFromObject)).toBe(normalizeHTML(expectedHTML));
    });
  });


  const normalizeHTMLp = (html: string): string =>
    html.replace(/\s+/g, " ").trim();
  
  describe("Transform Functions", () => {
    test("generateHTMLFromObject should generate correct HTML from NodeData", () => {
      const result = generateHTMLFromObject(nodeData, "ROOT");
      expect(normalizeHTMLp(result)).toEqual(normalizeHTMLp(expectedHTML));
    });
  
    test("generateObjectFromHtml should generate correct NodeData from HTML", () => {
      const result = generateObjectFromHtml(expectedHTML);
      const rootNode = result["ROOT"];
      expect(rootNode.type).toBe("div");
      expect(rootNode.nodes.length).toBe(2);
  
      const firstChildId = rootNode.nodes[0];
      const firstChild = result[firstChildId];
      expect(firstChild.type).toBe("h1");
      expect(firstChild.props.children).toBe("Hi");
  
      const secondChildId = rootNode.nodes[1];
      const secondChild = result[secondChildId];
      expect(secondChild.type).toBe("button");
      expect(secondChild.props.children).toBe("Click Me");
    });
  
    test("generateObjectFromHtml and generateHTMLFromObject should be reversible", () => {
      const objectFromHtml = generateObjectFromHtml(expectedHTML);
      const htmlFromObject = generateHTMLFromObject(objectFromHtml, "ROOT");
      console.log("this is", expectedHTML);
      expect(normalizeHTML(htmlFromObject)).toEqual(normalizeHTML(expectedHTML));
    });
  });