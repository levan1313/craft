export type NodeData = {
    type: string;
    isCanvas: boolean;
    props: Record<string, any>;
    displayName: string;
    custom: Record<string, any>;
    hidden: boolean;
    nodes: string[];
    linkedNodes: Record<string, any>;
    parent?:string;
  };

// transforms object into html

export const generateHTMLFromObject = (
  nodesMap: Record<string, NodeData>,
  rootId: string
): string => {
  const traverse = (nodeId: string): string => {
    const node = nodesMap[nodeId];
    if (!node) return "";

    const { type, props, nodes } = node;
    const { style, children, ...restProps } = props;

    const styleString = style
      ? `style="${Object.entries(style)
          .map(([key, value]) => `${key}: ${value}`)
          .join("; ")}"`
      : "";

    const attributes = Object.entries(restProps)
      .filter(([key]) => key !== "children")
      .map(([key, value]) => ` ${key}="${value}"`)
      .join("");

    const childHTML = nodes.map(traverse).join("");

    return `<${type}${styleString ? ` ${styleString}` : ""}${attributes}>${
      children || ""
    }${childHTML}</${type}>`;
  };

  return traverse(rootId).trim();
};




//   transforms html string into object

export const generateObjectFromHtml = (html: string): Record<string, NodeData> => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  const rootElement = doc.body.firstElementChild;
  if (!rootElement) throw new Error("Invalid HTML");

  const traverse = (element: Element): [string, Record<string, NodeData>] => {
    const nodeId = `node-${element.tagName.toLowerCase()}-${Math.random()
      .toString(36)
      .substr(2, 5)}`;

    const children: string[] = [];
    const nodeData: Record<string, NodeData> = {};

    Array.from(element.children).forEach((child) => {
      const [childId, childData] = traverse(child);
      children.push(childId);
      Object.assign(nodeData, childData);
    });

    const style = element.getAttribute("style")
      ? Object.fromEntries(
          element
            .getAttribute("style")!
            .split(";")
            .filter(Boolean)
            .map((rule) => {
              const [key, value] = rule.split(":").map((s) => s.trim());
              return [key, value];
            })
        )
      : {};

    const textContent = Array.from(element.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent?.trim())
      .join("");

    nodeData[nodeId] = {
      type: element.tagName.toLowerCase(),
      isCanvas: false,
      props: {
        ...(Object.entries(style).length ? { style } : {}),
        children: textContent || undefined,
      },
      displayName: element.tagName.toLowerCase(),
      custom: {},
      hidden: false,
      nodes: children,
      linkedNodes: {},
    };

    return [nodeId, nodeData];
  };

  const [rootId, rootData] = traverse(rootElement);
  rootData["ROOT"] = {
    type: rootElement.tagName.toLowerCase(),
    isCanvas: true,
    props: {},
    displayName: "root",
    custom: {},
    hidden: false,
    nodes: [rootId],
    linkedNodes: {},
  };

  return rootData;
};

// root object is duplikaciis problemaa mosagvarebeli
// @fix me
