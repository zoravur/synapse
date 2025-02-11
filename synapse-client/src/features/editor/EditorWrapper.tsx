/**
 * Editor wrapper component.
 */
import { useAutoSaveFile } from "./useAutoSave";
import { Editor } from "./Editor";
import { Skeleton } from "@/components/ui/skeleton";
import { useFileLoader } from "./useFileLoader";
import { useAutoSave } from "./useAutoSave";
import { useState, useCallback, useEffect } from 'react';
import { loadFileContents, saveFile } from './api';

const EditorWrapper: React.FC<{filePath: string}> = ({filePath}) => {
    const loadFn = useCallback(() => loadFileContents(filePath), [filePath]);
    const saveFn = useCallback((content: string) => saveFile(filePath, content), [filePath]);
  
    const { content, loading, error } = useFileLoader(loadFn);
    // Only set currentContent once we have the initial content loaded
    const [currentContent, setCurrentContent] = useState<string | null>(null);
  
    // Update currentContent when initial content loads
    useEffect(() => {
      if (content) {
        setCurrentContent(content);
      }
    }, [content]);
  
    const { saving, lastSaved, saveError } = useAutoSave(currentContent, saveFn);
  
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!currentContent) return null; // Or some loading state
    
    return (
      <div>
        <Editor 
          markdownContent={currentContent} 
          onChange={setCurrentContent} 
        />
        {saving && <div>Saving...</div>}
        {saveError && <div>Save failed: {saveError.message}</div>}
        {lastSaved && <div>Last saved: {lastSaved.toLocaleString()}</div>}
      </div>
    );
}

export {
    EditorWrapper
};