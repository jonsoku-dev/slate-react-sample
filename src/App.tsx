// Import React dependencies.
import React, { FC, useEffect, useCallback, useMemo, useState } from "react";
// Import the Slate editor factory.
import { createEditor, Transforms, Editor, Text, Node } from "slate";

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";

// Import the `Node` helper interface from Slate.

const App: FC = ({ children }) => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState<any>(
    deserialize(localStorage.getItem("content") || "") || ""
  );

  // Define a rendering function based on the element passed to `props`. We use
  // `useCallback` here to memoize the function for subsequent renders.
  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "code":
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  // Define a leaf rendering function that is memoized with `useCallback`.
  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />;
  }, []);

  // Render the Slate context.
  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(value: any) => {
        console.log(value);
        setValue(value);
        const content = JSON.stringify(value);
        localStorage.setItem("content", content);
      }}
    >
      <div>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleBoldMark(editor);
          }}
        >
          Bold
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleCodeBlock(editor);
          }}
        >
          Code Block
        </button>
      </div>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(event) => {
          if (!event.ctrlKey) {
            return;
          }

          // Replace the `onKeyDown` logic with our new commands.
          switch (event.key) {
            case "`": {
              event.preventDefault();
              CustomEditor.toggleCodeBlock(editor);
              break;
            }

            case "b": {
              event.preventDefault();
              CustomEditor.toggleBoldMark(editor);
              break;
            }
          }
        }}
      />
    </Slate>
  );
};
export default App;

const DefaultElement = (props: any) => {
  return <p {...props.attributes}>{props.children}</p>;
};

// Define a React component renderer for our code blocks.
const CodeElement = (props: any) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

// Define a React component to render leaves with bold text.
const Leaf = (props: any) => {
  return (
    <span
      {...props.attributes}
      style={{ fontWeight: props.leaf.bold ? "bold" : "normal" }}
    >
      {props.children}
    </span>
  );
};

// Define our own custom set of helpers.
const CustomEditor = {
  isBoldMarkActive(editor: Editor) {
    const [match]: any = Editor.nodes(editor, {
      match: (n) => n.bold === true,
      universal: true,
    });

    return !!match;
  },

  isCodeBlockActive(editor: Editor) {
    const [match]: any = Editor.nodes(editor, {
      match: (n) => n.type === "code",
    });

    return !!match;
  },

  toggleBoldMark(editor: Editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    Transforms.setNodes(
      editor,
      { bold: isActive ? null : true },
      { match: (n) => Text.isText(n), split: true }
    );
  },

  toggleCodeBlock(editor: Editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : "code" },
      { match: (n) => Editor.isBlock(editor, n) }
    );
  },
};

// Define a serializing function that takes a value and returns a string.
const serialize = (value: any) => {
  return (
    value
      // Return the string content of each paragraph in the value's children.
      .map((n: any) => Node.string(n))
      // Join them all with line breaks denoting paragraphs.
      .join("\n")
  );
};

// Define a deserializing function that takes a string and returns a value.
const deserialize = (string: string) => {
  // Return a value array of children derived by splitting the string.
  return string.split("\n").map((line: any) => {
    return {
      children: [{ text: line }],
    };
  });
};
