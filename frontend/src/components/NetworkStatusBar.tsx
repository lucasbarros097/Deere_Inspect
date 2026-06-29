import { useState, useEffect, useRef } from "react";
import { WifiOff, Wifi } from "lucide-react";

const NetworkStatusBar = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [visible, setVisible] = useState(false);
  const [showOnlineBar, setShowOnlineBar] = useState(false);
  const isFirstRender = useRef(true);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineBar(true);
      setVisible(true);
      clearTimeout(hideTimeout.current);
      hideTimeout.current = setTimeout(() => setVisible(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineBar(false);
      setVisible(true);
      clearTimeout(hideTimeout.current);
    };

    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!navigator.onLine) {
        setVisible(true);
      }
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearTimeout(hideTimeout.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-500 animate-in slide-in-from-top ${
        isOnline && showOnlineBar
          ? "bg-green-600 text-white"
          : "bg-zinc-800 text-zinc-100"
      }`}
    >
      {isOnline && showOnlineBar ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Você está online novamente</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Você está offline</span>
        </>
      )}
    </div>
  );
};

export default NetworkStatusBar;