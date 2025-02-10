/**
 * Second attempt at editor. This one will use lexical: https://lexical.dev/docs/intro
 */

import { $getRoot, $getSelection, } from 'lexical';
import { useEffect } from 'react';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
// import {PlainTextPlugin} from '@lexical/react/LexicalPlainTextPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import {
    $convertFromMarkdownString,
    $convertToMarkdownString,
    TRANSFORMERS,
} from '@lexical/markdown';
import {MarkdownShortcutPlugin} from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode } from '@lexical/code';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { LinkNode } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin';
import { MyCustomPlugin } from './CodeTransform';
import './Editor.css';

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
function onChange(editorState) {
    editorState.read(() => {
        // Read the contents of the EditorState here.
        const root = $getRoot();
        const selection = $getSelection();

        console.log(root, selection);
    });
}

// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
function MyCustomAutoFocusPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        // Focus the editor when the effect fires!
        editor.focus();
    }, [editor]);

    return null;
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error) {
    console.error(error);
}

function Editor({ filePath }) {
    const initialConfig = {
        namespace: 'Synapse',
        theme,
        onError,
        editorState: () => $convertFromMarkdownString('# The spectacle before us...\n\n was indeed... **_sublime_**.', TRANSFORMERS),
        // nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode, HorizontalRuleNode]
        nodes: [HorizontalRuleNode, CodeNode, HeadingNode, LinkNode, ListNode, ListItemNode, QuoteNode]
    };

    //   console.log(filePath);

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <article className="mx-auto w-7xl editor prose outline-none prose-headings:my-0 prose-headings:mb-0 prose-p:my-0 prose-a:text-blue-600">
                <RichTextPlugin
                    contentEditable={<ContentEditable />}
                    placeholder={<div>Enter some text...</div>}
                    ErrorBoundary={LexicalErrorBoundary}
                    />
                <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                <LinkPlugin />
                <ClickableLinkPlugin />
                    {/* <OnChangePlugin onChange={onChange} />
                    <HistoryPlugin />
                    <MyCustomAutoFocusPlugin /> */}
                <MyCustomPlugin />
                {/* // </article> */}
            </article>
        </LexicalComposer>
    );
}

export default Editor;