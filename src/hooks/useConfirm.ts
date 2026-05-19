import type { ConfirmOptions } from "@/types/confirm";
import { useConfirmContext } from "@/contexts/ConfirmContext";

/**
 * Convenience hook for showing confirmation dialogs.
 *
 * @example
 * ```tsx
 * const { confirm } = useConfirm();
 * const handleDelete = async () => {
 *   const ok = await confirm({
 *     title: "Delete Page",
 *     message: "Are you sure?",
 *     variant: "danger",
 *   });
 *   if (ok) { /* delete */ }
 * };
 * ```
 *
 * @throws If used outside a `ConfirmProvider`.
 */
export function useConfirm(): {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
} {
  const { confirm } = useConfirmContext();
  return { confirm };
}
