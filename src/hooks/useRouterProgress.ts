import { useNavigation } from "react-router-dom";

/**
 * Hook that wraps React Router's `useNavigation()` to provide a
 * stable `isNavigating` boolean derived from the navigation state.
 *
 * @returns `{ isNavigating: boolean }` — true while any route transition is in flight.
 */
export function useRouterProgress(): { isNavigating: boolean } {
  const navigation = useNavigation();
  return { isNavigating: navigation.state === "loading" };
}
