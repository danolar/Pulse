import { useActingAs } from "~~/components/pulse/layout/ActingAsContext";

/** Console actions read the app-level Acting-as toggle (memory only). */
export const useResolvedActingRole = () => {
  const { actingAs } = useActingAs();
  return actingAs;
};
