import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router";
import { useUisfx } from "@/audio/useUisfx";
import { cn } from "@/utils/cn";

type SurfaceButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> & {
  children: ReactNode;

  /**
   * Action exécutée après le son "release".
   */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void | Promise<void>;

  /**
   * Navigation exécutée après le son "release".
   */
  linkTo?: string;

  /**
   * Active ou désactive les effets sonores.
   */
  sound?: boolean;
};

export const SurfaceButton = forwardRef<HTMLButtonElement, SurfaceButtonProps>(
  (
    {
      children,
      className,
      onClick,
      onPointerDown,
      linkTo,
      sound = true,
      disabled,
      ...props
    },
    ref,
  ) => {
    const { play } = useUisfx();
    const navigate = useNavigate();

    const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
      onPointerDown?.(event);

      if (event.defaultPrevented || disabled) {
        return;
      }

      if (sound) {
        play("press");
      }
    };

    const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      if (disabled) {
        return;
      }

      try {
        // Release avant l'action
        if (sound) {
          play("release");
        }

        // Action personnalisée
        if (onClick) {
          await onClick(event);
          return;
        }

        // Navigation
        if (linkTo) {
          navigate(linkTo);
        }
      } catch (error) {
        console.error("SurfaceButton error:", error);
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        {...props}
        className={cn(className)}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        {children}
      </button>
    );
  },
);

SurfaceButton.displayName = "SurfaceButton";
