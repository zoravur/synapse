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


const Editor: React.FC<{filePath: string, data?: string}> = ({filePath, data})  => {

    const [docData, setDocData] = useState<string | undefined>(data);
    
    useEffect(() => {

        let prevRange: Range = new Range();
        prevRange.collapse();
        // let prevContainingElement: HTMLElement|undefined = undefined;

        function selectionChangeHandler() {
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
            getNodesWithinRange(range).filter((node: Node) => !node.hasChildNodes()).forEach((node) => {
                console.log(i++, node);

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

        if (!data) {
            fetch(`/api/v1/${filePath}`).then(response => response.json()).then(js => {
                setDocData(js.content);
                document.addEventListener("selectionchange", selectionChangeHandler);
            })
        }
        return () => {
            document.removeEventListener("selectionchange", selectionChangeHandler);
        }
    }, [data, filePath])

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