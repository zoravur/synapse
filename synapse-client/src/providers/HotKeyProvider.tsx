import useHotKeys from "@/hooks/useHotKeys";

const HotKeyProvider = ({children}: React.PropsWithChildren) => {
    useHotKeys();
    return (
        <>
            {children}
        </>
    )
}

export default HotKeyProvider;