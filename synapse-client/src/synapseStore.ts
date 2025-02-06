/**
 * Global store, to be mounted in ./App.tsx.
 * 
 * Usage:
 * 
 * const [state, dispatch] = React.useReducer(reducer, initialArg, init)
 */
const initialArg = {
  ui: {
    modalOpen: false,
    sidebarOpen: false,
  }
}
type State = typeof initialArg;

const actions = [
  {
    type: "TOGGLE_SEARCH_MODAL",
  },
];
type Action = typeof actions[number];

/**
 * The top level reducer.
 */
const reducer: React.Reducer<State, Action> = (state, action) => {
switch (action.type) {
    case 'TOGGLE_SEARCH_MODAL': {
      return {
        ...state,
        ui: {
          ...state.ui,
          modalOpen: !state.ui.modalOpen,
        }
      }
    };
    default: {
      const errMsg = `Unexpected action type: ${action}`;
      throw new Error(errMsg);
      // console.error(errMsg);
      // return state;
    }
  }
}

const init = (initialArg: State) => initialArg;

export {
  reducer,
  initialArg,
  init,
}

export type DispatchType = React.Dispatch<Action>;
export type StateType = React.ReducerState<typeof reducer>;