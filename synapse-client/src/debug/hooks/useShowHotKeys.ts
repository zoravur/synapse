import { getUserOS } from '../../util/index.ts';
import useKeyBindings from '../hooks/useKeyBindings.tsx';
import hotkeysMac from '../../../configs/hotkeys/macos.json';
import hotkeysWindows from '../../../configs/hotkeys/windows.json';
import React from 'react';
import type { DispatchType } from '../../synapseStore.ts';

type KeyMap = any;
type ActionMap = any;

const useShowHotKeys = (userKeyMap?: KeyMap) => {
    console.log(hotkeysMac);
    console.log(hotkeysWindows);

    const useSynapseDispatch()
    
    const keymap = {};
    Object.assign(keymap, (getUserOS() === "MacOS" ? hotkeysMac : hotkeysWindows).keymap);
    if (userKeyMap) {
        Object.assign(keymap, userKeyMap);
    }

    useKeyBindings(userKeyMap)
}