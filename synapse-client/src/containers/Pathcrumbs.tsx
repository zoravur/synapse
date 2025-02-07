import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/breadcrumb";

const PathCrumbs = ({ path }: { path: string | Array<string> }) => {
    if (!(path instanceof Array)) {
        path = path.split('/').filter(Boolean);
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {path.slice(0, -1).map(part => (
                    <>
                        <BreadcrumbItem className="hidden md:block">
                            {part}
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block">{"/"}</BreadcrumbSeparator>
                    </>
                ))}
                <BreadcrumbItem>
                    <BreadcrumbPage>{path[path.length-1]}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    )
}

export default PathCrumbs;