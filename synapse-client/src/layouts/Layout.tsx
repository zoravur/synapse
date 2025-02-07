import PathCrumbs from "@/containers/Pathcrumbs";
// import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { SynapseSidebar } from "@/containers/Sidebar.tsx";
import { useLocation } from "react-router-dom";



export default function Layout({ children }: { children: React.ReactNode }) {
  const loc = useLocation();

  return (
    <SidebarProvider>
      <SynapseSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            {/* <SidebarTrigger /> */}
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <PathCrumbs path={loc.pathname}/>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
