import { useEffect } from "react";
import { useRouter } from "next/router";
import useChat from "@/hooks/useChat";
import ChatUI from "@/components/ChatUI";

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) {
      router.push("/login");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    router.push("/login");
  };

  const chat = useChat();

  return (
    <ChatUI
      {...chat}
      username={localStorage.getItem("username")}
      handleLogout={handleLogout}
    />
  );
}
