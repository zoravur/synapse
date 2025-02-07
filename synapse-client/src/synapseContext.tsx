import { createContext, useReducer, useContext } from "react";
import { reducer, initialArg, init, StateType, DispatchType } from './synapseStore';

const SynapseContext = createContext<StateType | null>(null);
const SynapseDispatchContext = createContext<DispatchType | null>(null);

function SynapseProvider({children}: React.PropsWithChildren) {
    const [store, dispatch] = useReducer(reducer, initialArg, init);

    return (
        <SynapseContext.Provider value={store}>
            <SynapseDispatchContext.Provider value={dispatch}>
                {children}
            </SynapseDispatchContext.Provider>
        </SynapseContext.Provider>
    )
}


type Selector<V> = (state: StateType) => V;
function useSynapseSelector<V>(selector: Selector<V>) {
    const state = useContext(SynapseContext);
    if (state !== null) {
        return selector(state);
    } else {
        console.error(`useSynapseSelector used on null state`);
        // throw new Error(`useSynapseSelector used on null state`);
    }
}

function useSynapseDispatch() {
    const dispatch = useContext(SynapseDispatchContext);
    if (dispatch !== null) {
        return dispatch;
    } else {
        console.error(`useSynapseDispatch used on null dispatch`)
        // throw new Error(`useSynapseDispatch used on null dispatch`);
    }
}

export {
    SynapseProvider,
    useSynapseSelector,
    useSynapseDispatch
}

