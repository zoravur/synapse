import { createContext, useReducer, useContext } from "react";
import { reducer, initialArg, init, StateType, DispatchType } from './synapseStore';

const SynapseContext = createContext<StateType | null>(null);
const SynapseDispatchContext = createContext<DispatchType | null>(null);

function SynapseProvider({children}: React.PropsWithChildren) {
    const [store, dispatch] = useReducer(reducer, initialArg, init);

    return (
        <SynapseContext.Provider value={store}>
            <SynapseDispatchContext value={dispatch}>
                {children}
            </SynapseDispatchContext>
        </SynapseContext.Provider>
    )
}


type Selector<V> = (state: StateType) => V;
function useSynapseSelector<V>(selector: Selector<V>) {
    const state = useContext(SynapseContext);
    if (state !== null) {
        return selector(state);
    } else {
        throw new Error(`useSynapseSelector used on null state`);
    }
}

function useSynapseDispatch() {
    return useContext(SynapseDispatchContext);
}

export {
    SynapseProvider,
    useSynapseSelector,
    useSynapseDispatch
}

