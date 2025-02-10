import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $createTextNode, $getSelection, ElementNode, TextNode } from "lexical";
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
// import { registerLexicalDevTools } from "@lexical/devtools";
import { TreeView } from '@lexical/react/LexicalTreeView';
// import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
// import { useEffect } from "react";

export function MyCustomPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // return editor.registerNodeTransform(TextNode, (node) => {
    //   const parent = node.getParent();
    //   if (parent instanceof HeadingNode) {
    //     if (! /^#+\s/.test(node.getTextContent())) {
    //       console.log(node.getTextContent());
    //       console.log(node);
    //       const level = parseInt(parent.getTag()[1]);
    //       node.setTextContent('#'.repeat(level) + ' ' + node.getTextContent());
    //     }
    //   }
    // })
    // return editor.registerNodeTransform(HeadingNode, (node) => {
    //   console.log(node);
    //   if (! /^#+\s/.test(node.getTextContent())) {
    //     console.log(node.getTextContent());
    //     console.log(node);
    //     const level = parseInt(node.getTag()[1]);
    //     if (node instanceof ElementNode) {
    //       node.getFirstChild()?.insertBefore($createTextNode('#'.repeat(level) + ' '))
    //       // node.setTextContent('#'.repeat(level) + ' ' +node.getTextContent())
    //     }
    //   }
    // });
  }, [editor]);




  useEffect(() => {
    // return editor.registerUpdateListener(({editorState}) => {
      // The latest EditorState can be found as `editorState`.
      // To read the contents of the EditorState, use the following API:
    
      // editorState.read(() => {
      //   console.log('READING')

      //   console.log('SELECTION: ', $getSelection());
      //   console.log('selection.getNodes()', $getSelection()?.getNodes().forEach(node => {
      //     // nod
      //   }));
      //   // Just like editor.update(), .read() expects a closure where you can use
      //   // the $ prefixed helper functions.
      // });

      // editor.update(() => {
      //   console.log('WRITING');
      //   // Just like editor.update(), .read() expects a closure where you can use
      //   // the $ prefixed helper functions.
      // });
    // });
  }, [editor]);

  // useEffect(() => {
  //   registerLexicalDevTools(editor);
  // }, [editor]);


  return <TreeView editor={editor} />
}


// export default DebugPlugin;