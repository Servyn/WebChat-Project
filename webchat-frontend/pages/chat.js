import { useRouter } from "next/router";
import useChat from "@/hooks/useChat";
import { useEffect, useState } from "react";
import ChatUI from "@/components/ChatUI";



export default function ChatPage() {
  const router = useRouter();
  const [username, setUsername] = useState(null);
  const chat = useChat();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      router.push("/login");
    } else {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    router.push("/login");
  };


  if (!username) return null;

  return (
    <ChatUI
      {...chat}
      username={username}
      handleLogout={handleLogout}
      currentRoom={chat.currentRoom}
    />
  );
}
