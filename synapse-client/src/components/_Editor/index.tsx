import { marked , Hooks, MarkedOptions, HooksObject, HooksApi, Lexer } from 'marked';
import {useState, useEffect, Suspense, use, Fragment} from 'react';
import DOMPurify from 'dompurify';
import './Editor.css';
import { SynapseRenderer } from './Renderer';

function findLowestCommonAncestor(root, node1, node2) {
    let path1 = [];
    let path2 = [];

    // get path from root to node1
    while (node1) {
        path1.unshift(node1);
        node1 = node1.parentElement;
    }

    // get path from root to node2
    while (node2) {
        path2.unshift(node2);
        node2 = node2.parentElement;
    }

    // find the split point (lowest common ancestor)
    let lca = root;
    for (let i = 0; i < Math.min(path1.length, path2.length); i++) {
        if (path1[i] !== path2[i]) break;
        lca = path1[i];
    }

    return lca;
}

function isElementSelected(element) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;
    
    const range = selection.getRangeAt(0);
    return element.contains(range.commonAncestorContainer);
}

function elementHasCaret(element) {
    const selection = window.getSelection();
    return document.activeElement === element &&
           selection.rangeCount > 0 &&
           element.contains(selection.anchorNode);
}

function isElementActive(element) {
    return isElementSelected(element) || elementHasCaret(element);
}

function* reverseTreeWalker(root) {
    if (!root) return;
    
    let stack = [root];

    while (stack.length > 0) {
        let node = stack.pop(); // process parent first
        yield node;

        let children = [];
        let child = node.firstChild;
        while (child) {
            children.push(child);
            child = child.nextSibling;
        }

        // push children in normal order so they are processed in reverse
        stack.push(...children);
    }
}

function* forwardTreeWalker(root) {
    if (!root) return;

    let stack = [root];

    while (stack.length > 0) {
        let node = stack.pop(); // process parent first
        yield node;

        let child = node.lastChild; // push children in reverse order so they come out in normal order
        while (child) {
            stack.push(child);
            child = child.previousSibling;
        }
    }
}

// root should be the lca of start and end dom nodes
function getNodesBetween(root: Node, start: Node, end: Node) {
    function* filter (iterable: Iterable<Node>, start: Node, end: Node) {
        let between = false;
        for (let node of iterable) {
            if (node === start) {
                between = true;
            }
            if (between === true) yield node;
            if (node === end) {
                between = false;
            }
        }
    }

    const reverseSet = new Set<Node>(filter(reverseTreeWalker(root), end, start));
    const forwardSet = new Set<Node>(filter(forwardTreeWalker(root), start, end));

    return [...forwardSet].filter(i => reverseSet.has(i));
}

function getNodesWithinRange(range: Range) {
    return getNodesBetween(range.commonAncestorContainer, range.startContainer, range.endContainer);
}

// marked.use({ hooks: { 
//     processAllTokens(tokens) {
//         tokens.forEach(token => {
//             console.log('TOKEN:', token)
//             console.log('TOKEN.RAW:', token.raw);
//         })
//         return tokens;
//     }
// }})

// marked.use({hooks: { provideLexer: ((this: typeof Hooks) => provideLexer()) }})
// Apply renderer to marked
marked.setOptions({ renderer: new SynapseRenderer() });

const createMarkup = (data: string) => ({ __html: DOMPurify.sanitize(marked.parse(data, { async: false }))});
const createMarkupInline = (data: string) => ({ __html: DOMPurify.sanitize(marked.parseInline(data, { async: false }))});


function insertElementAtCursor(tagName = "span", tagId = 'cursormark', textContent = "") {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const { anchorNode, anchorOffset } = selection;

    // const newElement = document.createElement(tagName);
    // if (tagId) newElement.id = tagId;
    // newElement.textContent = textContent;

    const newElement = document.createTextNode(textContent);

    if (anchorNode.nodeType === Node.TEXT_NODE) {
        // Split the text node at the cursor position
        const textNode = anchorNode;
        const beforeText = textNode.textContent.slice(0, anchorOffset);
        const afterText = textNode.textContent.slice(anchorOffset);

        const afterNode = document.createTextNode(afterText);
        textNode.textContent = beforeText;

        // Insert new element and the split text node
        if (textNode.parentNode) {
            textNode.parentNode.insertBefore(newElement, textNode.nextSibling);
            textNode.parentNode.insertBefore(afterNode, newElement.nextSibling);
        }
    } else {
        // If the anchorNode is an element, just insert
        range.insertNode(newElement);
    }

    // Move cursor after the inserted element
    range.setStartAfter(newElement);
    range.setEndAfter(newElement);
    selection.removeAllRanges();
    selection.addRange(range);
}

// function saveCursor

// Example usage
// document.addEventListener("keydown", (e) => {
//     if (e.key === "Enter") {
//         e.preventDefault(); // Prevent default Enter behavior
        // insertElementAtCursor("span#cursormark", "@%@%CURSOR_LOC%@%@");
//     }
// });

// function moveCursorInsideEmptyTag(selector, tagName) {
//     const element = document.querySelector(selector);
//     if (!element) return;

//     const emptyTag = element.querySelector(tagName);
//     if (!emptyTag) return;

//     const range = document.createRange();
//     const sel = window.getSelection();

//     // place cursor inside the empty tag
//     range.setStart(emptyTag, 0);
//     range.collapse(true);

//     sel.removeAllRanges();
//     sel.addRange(range);
// }
// example usage
//moveCursorInsideEmptyTag('#editable', 'my-special-tag');

function placeCursorAfterElement(targetElement: Node) {
    if (!targetElement || !targetElement.parentNode) return;

    let range = document.createRange();
    let selection = window.getSelection();

    // Set the range immediately after the target element
    range.setStartAfter(targetElement);
    range.collapse(true);

    // Apply the selection
    selection.removeAllRanges();
    selection.addRange(range);


    if (targetElement.parentNode) {
        targetElement.parentNode.removeChild(targetElement);
    }
}

function getTextRangeInContentEditable(contentEditableElement, searchText) {
    const range = document.createRange();
    const walker = document.createTreeWalker(contentEditableElement, NodeFilter.SHOW_TEXT, null, false);

    let node;
    while ((node = walker.nextNode())) {
        const index = node?.nodeValue?.indexOf(searchText);

        if (index !== null && index !== undefined && index >= 0) {
            // Split text node if necessary
            if (index > 0 || index + searchText.length < node.nodeValue.length) {
                const beforeText = node.nodeValue.slice(0, index);
                const matchText = node.nodeValue.slice(index, index + searchText.length);
                const afterText = node.nodeValue.slice(index + searchText.length);

                const matchNode = document.createTextNode(matchText);

                const parent = node.parentNode;
                parent.insertBefore(matchNode, node.nextSibling);
                if (afterText) {
                    parent.insertBefore(document.createTextNode(afterText), matchNode.nextSibling);
                }
                if (beforeText) {
                    node.nodeValue = beforeText;
                } else {
                    parent.removeChild(node);
                }

                range.setStart(matchNode, 0);
                range.setEnd(matchNode, matchText.length);
                return range;
            }

            // If already isolated, just set the range
            range.setStart(node, index);
            range.setEnd(node, index + searchText.length);
            return range;
        }
    }
    return null;
}

// console.log(foundRange);

function triggerHighlights() {
    // if (programmaticChange || event.defaultPrevented) {
    //     programmaticChange = false;
    //     return;
    // }

    // if (prevContainingElement) {
        
    //     prevContainingElement.classList.remove('selected');
    //     prevContainingElement.
    // }
    

    const selection = window.getSelection();
    if (!selection?.rangeCount) return false;

    const range = selection.getRangeAt(0);

    function getContainingElementWithMarkdownData(node: Node) {
        let parent: Node = node;
        
        while (!(parent instanceof HTMLElement) || !(parent?.dataset?.markdown) && parent !== document.body) {
            parent = parent.parentElement || document.body;
        }

        if (parent !== document.body) return parent;
    }

    const containingElements = new Set<Element>();
    
    let i = 0;
    getNodesWithinRange(range).filter((node: Node) => true || !node.hasChildNodes()).forEach((node) => {
        // console.log(i++, node);

        const containingEl = getContainingElementWithMarkdownData(node)
        if (containingEl) {
            containingElements.add(containingEl);
        }
    })

    // console.log(Array.from(containingElements.values()));


    // const el = getContainingElementWithMarkdownData(prevRange.commonAncestorContainer);

    // if (el) {
    //     if (window.getComputedStyle(el).display == 'block') {
    //         el.outerHTML = createMarkup(el.textContent || '').__html;
    //     } else {
    //         el.outerHTML = createMarkupInline(el.textContent || '').__html;
    //     }
    // }

    // prevRange = range;

    // const selectedSubtree = document.querySelectorAll('.selected')[0]

    Array.from(document.querySelectorAll('.selected')).forEach((el) => {
        if (!containingElements.has(el)) {
            el.classList.remove('selected');
            if (window.getComputedStyle(el).display == 'block') {
                el.outerHTML = createMarkup(el.textContent || '').__html;
            } else {
                el.outerHTML = createMarkupInline(el.textContent || '').__html;
            }
        }
    })

    containingElements.forEach((el: Element) => {
        // el.textContent = el.dataset.markdown || null;
        el.classList.add('selected');
    })
}

const Editor: React.FC<{filePath: string, data?: string}> = ({filePath, data})  => {

    const [docData, setDocData] = useState<string | undefined>(data);
    

    // useEffect(() => {

    // }, [])

    useEffect(() => {

        function saveCursor() {
            insertElementAtCursor("span", "cursormark", "@%@%CURSOR_LOC%@%@");
        }

        function restoreCursor() {

            const editable = document.querySelector(".editor");
            const foundRange = getTextRangeInContentEditable(editable, "@%@%CURSOR_LOC%@%@");

            console.log(foundRange);

            // console.log('FOUNDRANGE:', foundRange);
            
            // const s = document.createElement('span');
            // s.id = 'cursormark';
            // foundRange?.surroundContents(s);
            // foundRange?.surroundContents(s)
            placeCursorAfterElement(foundRange?.commonAncestorContainer);

            // s.remove();
            // document.querySelector('#cursormark')?.remove();
        }
        // let running = false;
        let programmaticChange = false;
        function inputHandler(evt: InputEvent) {
            if (programmaticChange || evt.defaultPrevented) return;
            // programmaticChange = true;
            // if (!running) running = true;
            // to be called on 'input' events
            saveCursor();

            const editor = document.querySelector('.editor')
            if (editor) {
                editor.innerHTML = createMarkup(editor.textContent || '').__html;
            }

            // setDocData(document.querySelector('.editor')?.textContent || '');
            // console.log(evt.getTargetRanges());
            
            // setDocData(event.getTargetRanges());
            restoreCursor();
            triggerHighlights();
            // running = false;
            evt.preventDefault();
            // programmaticChange = false;
            return false;
        }


        function selectionChangeHandler(event: Event) {
            triggerHighlights();
        }

        function isInputEvent(event: Event): event is InputEvent {
            return "getTargetRanges" in event;
        }

        const inputHandlerWrapper = (event) => {
            if (isInputEvent(event)) {
                inputHandler(event);
            }
        };


        function handleEnter(event) {
            if (event.key === "Enter") {

                // event.preventDefault();
                
                const selection = window.getSelection();
                if (!selection.rangeCount) return;
                
                const range = selection.getRangeAt(0);
                // console.log(event.target);
                const brk = document.createTextNode((event.target.tagName === 'code') ? "\n" : '\n');
                // const br = document.createElement("br");
                // br.textContent = "\n\n";
                
                range.deleteContents(); // Remove any selected text
                range.insertNode(brk)
                
                // Ensure there's a second <br> after the new one, so it doesn't collapse
                // const nextSibling = br.nextSibling;
                // if (!nextSibling || nextSibling.nodeName !== "BR") {
                //   const extraBr = document.createElement("br");
                //   br.parentNode.insertBefore(extraBr, br.nextSibling);
                // }
            
                // Move cursor after the inserted <br>
                range.setStartAfter(brk);
                range.collapse(true);
                
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }

        if (!data) {
            fetch(`/api/v1/${filePath}`).then(response => response.json()).then(js => {
                setDocData(js.content);
                console.log("MJKCR");
                document.addEventListener("selectionchange", selectionChangeHandler);
                document.addEventListener("keydown", handleEnter);
                document.addEventListener("input", inputHandlerWrapper);
            });
        }
        return () => {
            document.removeEventListener("selectionchange", selectionChangeHandler);
            document.removeEventListener("keydown", handleEnter);
            document.removeEventListener("input", inputHandlerWrapper);
        }
    }, [])

    return (<>
        {(docData !== undefined) && (console.log(createMarkup(docData)),
            <article className="mx-auto w-7xl editor prose prose-headings:my-0 prose-headings:mb-0 prose-p:my-0 prose-a:text-blue-600"
                dangerouslySetInnerHTML={createMarkup(docData)}
                contentEditable />)
        }
        {(docData === undefined) && "Loading..."}
    </>)
}

export default Editor;