// components/ui/Toast.tsx
import { cn } from "@/utils/cn";
import {
  CheckCircle,
  X,
  Mail,
  Info,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { linkStyles } from "@/constants/ui/link.constant";

type MessageType =
  | string
  | {
      title: string;
      description: string;
    };

type PropsType = {
  variant?: "success" | "error" | "warning" | "info" | "default";
  undoAction?: () => void;
  onClose?: () => void;
  message: MessageType;
  children?: React.ReactNode;
  hideIcon?: boolean;
  icon?: React.ReactNode;
};

export function Toast({
  variant = "default",
  undoAction,
  onClose,
  message,
  children,
  hideIcon,
  icon,
}: PropsType) {
  return (
    <div
      className={cn(
        "flex max-w-md min-w-[24rem] items-center gap-3 rounded-lg border border-base-200 p-3 shadow-sm bg-background-100",
        typeof message === "object" && "relative items-start",
        hideIcon && "py-2",
      )}
    >
      {!hideIcon && (
        <div className="flex size-6 items-center justify-center rounded-full">
          {icon || getIcon(variant)}
        </div>
      )}

      <div
        className={cn({
          contents: typeof message === "string",
          "ml-1": typeof message === "object" && hideIcon,
        })}
      >
        {typeof message === "object" && (
          <h4 className="mb-1.5 text-lg font-semibold text-title-50">
            {message.title}
          </h4>
        )}

        <p
          className={cn({
            "text-base text-title-50 font-medium": typeof message === "string",
            "text-sm text-text-100": typeof message === "object",
            "ml-1": typeof message === "string" && hideIcon,
          })}
        >
          {typeof message === "string" ? message : message.description}
        </p>

        {typeof message === "string" && undoAction && (
          <button
            className={cn(
              linkStyles({ variant: "primary", className: "ml-auto" }),
              "text-sm",
            )}
            onClick={undoAction}
          >
            Undo
          </button>
        )}

        {children}

        <Button
          variant="ghost"
          size="xs"
          iconOnly
          onClick={onClose}
          className={cn({
            "ml-auto": !undoAction,
            "absolute top-1 right-1": typeof message === "object",
          })}
        >
          <span className="sr-only">Dismiss Toast</span>
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}

type AvatarToastProps = {
  name: string;
  description: string;
  image?: string;
  status: "none" | "online" | "offline" | "busy";
  time: string;
};

export function AvatarToast({
  name,
  description,
  image,
  status,
  time,
}: AvatarToastProps) {
  return (
    <div className="bg-background-100 relative flex min-w-90 items-start gap-4 rounded-lg border border-base-200 p-5 shadow-sm">
      <Avatar
        src={image}
        alt={`Image of ${name}`}
        status={status}
        fallback={name.charAt(0)}
        size={"lg"}
      />

      <div className="flex-1">
        <h4 className="text-sm font-semibold text-title-50">{name}</h4>
        <p className="text-sm text-text-100">{description}</p>

        <div className="mt-2 flex items-center gap-1 text-xs text-primary-500">
          <Clock className="size-3" />
          <span>{time}</span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="xs"
        iconOnly
        className="absolute top-1 right-1"
      >
        <span className="sr-only">Dismiss Toast</span>
        <X className="size-4" />
      </Button>
    </div>
  );
}

function getIcon(variant: PropsType["variant"]) {
  switch (variant) {
    case "success":
      return <CheckCircle className="text-green-500" />;
    case "error":
      return <XCircle className="text-red-500" />;
    case "warning":
      return <AlertTriangle className="text-yellow-500" />;
    case "info":
      return <Info className="text-blue-500" />;
    case "default":
      return <Mail className="text-gray-500" />;
  }
}
