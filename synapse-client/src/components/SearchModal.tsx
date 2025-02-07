/**
 * This component is overlays for quick search / features with Command+P
 * Command+Shift+P opens the command menu
 */
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    // CommandShortcut,
} from "@/components/ui/command";
import { useSynapseDispatch, useSynapseSelector } from '@/synapseContext';

const SearchModal = () => {
    const dispatch = useSynapseDispatch();
    const modalOpen = useSynapseSelector(state => state.ui.modalOpen);

    return (
        <CommandDialog open={modalOpen} onOpenChange={() => dispatch({type: 'TOGGLE_SEARCH_MODAL'})}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                    <CommandItem>Calendar</CommandItem>
                    <CommandItem>Search Emoji</CommandItem>
                    <CommandItem>Calculator</CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Settings">
                    <CommandItem>Profile</CommandItem>
                    <CommandItem>Billing</CommandItem>
                    <CommandItem>Settings</CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}

export default SearchModal;