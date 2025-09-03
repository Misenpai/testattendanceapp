// app/(auth)/terms.tsx
import { TermsAndConditionsScreen } from "@/component/ui/TermsAndConditionsScreen";
import { useAudio } from "@/hooks/useAudio";
import { useCamera } from "@/hooks/useCamera";
import { useGeofence as useLocation } from "@/hooks/useGeofence";
import { useRouter } from "expo-router";

export default function TermsScreen() {
  const router = useRouter();

  const { requestPermission: requestCamera } = useCamera();
  const { requestPermission: requestMic } = useAudio();
  const { requestPermission: requestLocation } = useLocation();

  const handleAccept = async () => {
    await Promise.all([
      requestCamera(),
      requestMic(),
      requestLocation(),
    ]);
    router.replace("/(tabs)");
  };

  return <TermsAndConditionsScreen onAccept={handleAccept} />;
}