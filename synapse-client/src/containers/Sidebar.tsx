/**
 * The SynapseSidebar component will have the following capabilities:
 */
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  SidebarGroupContent,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

import { Settings, FolderClosed, Network, MessageCirclePlus } from "lucide-react"
import { Link } from "react-router-dom"


// Menu items.
const items = [
  {
    title: "File Explorer",
    url: "#",
    icon: FolderClosed
  },
  {
    title: "View Graph",
    url: '#',
    icon: Network,
  },
  {
    title: "New Chat",
    url: '',
    icon: MessageCirclePlus,
  },
  // {
  //   title: "Inbox",
  //   url: "#",
  //   icon: Inbox,
  // },
  // {
  //   title: "Calendar",
  //   url: "#",
  //   icon: Calendar,
  // },
  // {
  //   title: "Search",
  //   url: "#",
  //   icon: Search,
  // },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]


export function SynapseSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Synapse</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
