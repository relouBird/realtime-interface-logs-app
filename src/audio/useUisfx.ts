import { useContext } from "react";
import { UisfxContext, type UisfxContextType } from "./UisfxContext";

export function useUisfx(): UisfxContextType {
  const ctx = useContext(UisfxContext);
  if (!ctx) throw new Error("useUisfx must be used inside UisfxProvider");
  return ctx;
}
