import { useEffect, useState, useRef } from "react";
import socket from "@/socket";
import { uploadMessage } from "@/services/api";

export default function useChat() {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [room, setRoom] = useState("general");
  const [roomInput, setRoomInput] = useState("");
  const [users, setUsers] = useState([]);
  const previousRoom = useRef(null);
  const [currentRoom, setCurrentRoom] = useState("");


  const username = typeof window !== "undefined" ? localStorage.getItem("username") : "";

  useEffect(() => {
    socket.on("load_messages", (loadedMessages) => {
      setMessages(loadedMessages);
    });

    socket.on("chatMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("updateUsers", (userList) => {
      setUsers(userList);
    });

    if (room) {
      if (previousRoom.current && previousRoom.current !== room) {
        socket.emit("leaveRoom", previousRoom.current);
      }
      socket.emit("joinRoom", room, username); 
      previousRoom.current = room;
    }

    return () => {
      socket.off("load_messages");
      socket.off("chatMessage");
      socket.off("updateUsers");
    };
  }, [room]);

  const sendMessage = async () => {
    try {
      if (!message && !image) return;

      let imageUrl = null;

      if (image) {
        const formData = new FormData();
        formData.append("text", message);
        formData.append("sender", username || "Anonymous");
        formData.append("room", room);
        formData.append("image", image);

        const response = await fetch("http://localhost:3001/api/message/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        imageUrl = data.imageUrl;
      }

      socket.emit("chatMessage", {
        text: message,
        image: imageUrl || "",
        sender: username || "Anonymous",
        room,
      });

      setMessage("");
      setImage(null);

    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
    }
  };

  const handleJoinRoom = () => {
    if (roomInput) {
      setRoom(roomInput);
      setCurrentRoom(roomInput);
      setRoomInput("");
    }
  };

  return {
    message, setMessage,
    image, setImage,
    messages,
    showPicker, setShowPicker,
    roomInput, setRoomInput,
    handleJoinRoom,
    sendMessage,
    users,
    currentRoom
  };
}
