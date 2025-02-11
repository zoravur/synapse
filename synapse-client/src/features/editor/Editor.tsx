/**
 * Second attempt at editor. This one will use lexical: https://lexical.dev/docs/intro
 */

import { $getRoot, $getSelection, } from 'lexical';
import { useEffect, useCallback } from 'react';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
// import {PlainTextPlugin} from '@lexical/react/LexicalPlainTextPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

import {MarkdownShortcutPlugin} from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode } from '@lexical/code';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { LinkNode } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin';
import { MyCustomPlugin } from './CodeTransform';
import { InitialEditorStateType } from '@lexical/react/LexicalComposer';
import { EditorState, LexicalEditor } from 'lexical';
import './Editor.css';


import {
    $convertFromMarkdownString,
    $convertToMarkdownString,
    TRANSFORMERS
} from '@/thirdparty/lexical-markdown/src';


const theme = {
    ltr: 'ltr',
    paragraph: 'editor-paragraph',
    rtl: 'rtl',
    text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
    }
};
// When the editor changes, you can get notified via the
// LexicalOnChangePlugin!
// function onChange(editorState) {
//     editorState.read(() => {
//         // Read the contents of the EditorState here.
//         const root = $getRoot();
//         const selection = $getSelection();

//         console.log(root, selection);
//     });
// }

// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
// function MyCustomAutoFocusPlugin() {
//     const [editor] = useLexicalComposerContext();

//     useEffect(() => {
//         // Focus the editor when the effect fires!
//         editor.focus();
//     }, [editor]);

//     return null;
// }

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.


type EditorProps = {
    markdownContent: string;
    onError?: (error: any) => void;
    onChange?: (markdownString: string) => void;
}

function onError(error: any) {
    console.error(error);
}

function Editor(props: EditorProps) {
    const {
        markdownContent,
        onChange,
    } = props;

    const myOnChange: (onChange: (_: string) => void) => (editorState: EditorState, editor: LexicalEditor, tags: Set<string>) => void = (onChange) => (editorState) => {
        return editorState.read(() => {
            onChange($convertToMarkdownString(TRANSFORMERS));
        })
    };

    const initialConfig = {
        namespace: 'Synapse',
        theme, 
        onError,
        editorState: () => $convertFromMarkdownString(markdownContent, TRANSFORMERS),
        // nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode, HorizontalRuleNode]
        nodes: [HorizontalRuleNode, CodeNode, HeadingNode, LinkNode, ListNode, ListItemNode, QuoteNode]
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <article className="mx-auto w-7xl editor outline-none prose-headings:my-0 prose-headings:mb-0 prose-p:my-0 prose-a:text-blue-600">
                <RichTextPlugin
                    contentEditable={<ContentEditable />}
                    placeholder={<div>Enter some text...</div>}
                    ErrorBoundary={LexicalErrorBoundary}
                    />
                <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                <LinkPlugin />
                <ClickableLinkPlugin />
                {onChange && <OnChangePlugin onChange={myOnChange(onChange)} />}
            </article>
        </LexicalComposer>
    );
}

export { Editor };