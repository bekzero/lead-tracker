import { PublicPage } from "@/components/PublicPage";
import { getEventName } from "@/lib/config";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return <PublicPage eventName={getEventName()} />;
}
