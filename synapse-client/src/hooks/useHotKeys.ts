import { getUserOS } from '@/util/index.ts';
import useKeyBindings from '@/hooks/useKeyBindings.ts';
import hotkeysMac from '@/../configs/hotkeys/macos.json';
import hotkeysWindows from '@/../configs/hotkeys/windows.json';
// import React from 'react';
// import { DispatchType } from '../../synapseStore.ts';
import { useSynapseDispatch } from '@/synapseContext.tsx';
import { mapObjectValues } from '@/util/index';

type Command = string;
type Key = string;
type KeyMap = Array<{key: Key, command: Command}>;
// type ActionMap = any;

function keyListToObject(km: KeyMap): Record<Key, Command> {
    return Object.fromEntries(km.map(({key, command}) => [key, command]));
}

const useHotKeys = (userKeyMap?: KeyMap) => {

    const dispatch = useSynapseDispatch();

    const keyCmds = {};
    Object.assign(keyCmds, keyListToObject((getUserOS() === "MacOS" ? hotkeysMac : hotkeysWindows).keymap));
    if (userKeyMap) {
        Object.assign(keyCmds, keyListToObject(userKeyMap));
    }

    const keyDispatches = mapObjectValues(keyCmds, (val: string) => () => dispatch({type: val}));

    useKeyBindings(keyDispatches);
}

export default useHotKeys;