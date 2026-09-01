// constants/display/configuration.constant.ts
import type { NavItem } from "@/types/configuration.type";
import {
  LayoutDashboard,
  Newspaper,
  MessageSquareText,
  LogsIcon,
} from "lucide-react";

export const NAV_ITEMS: NavItem[] = [
  {
    path: "/",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    path: "/transactions",
    label: "Transactions",
    icon: Newspaper,
  },
  {
    path: "/iso-messages",
    label: "ISO Messages",
    icon: MessageSquareText,
  },
  {
    path: "/raw-logs",
    label: "Raw Logs",
    icon: LogsIcon,
  },
];
