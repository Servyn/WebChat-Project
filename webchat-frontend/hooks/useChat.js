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

  // Khai báo username
  const username = typeof window !== "undefined" ? localStorage.getItem("username") : "";

  useEffect(() => {
    socket.on("load_messages", (loadedMessages) => {
      setMessages(loadedMessages);
    });

    socket.on("chatMessage", (newMessage) => {
      console.log("New message received:", newMessage);
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("updateUsers", (userList) => {
      setUsers(userList);
    });

    if (room) {
      if (previousRoom.current && previousRoom.current !== room) {
        socket.emit("leaveRoom", previousRoom.current);
      }
      console.log("Joining room", room, "as", username);
      socket.emit("joinRoom", room, username);  // Gửi username vào khi join phòng
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
      console.log("Message before send:", message);  // Debug giá trị tin nhắn
      console.log("Image before send:", image);  // Debug giá trị ảnh
      if (!message && !image) return;

      let imageUrl = null;

      // 🧠 Chỉ upload khi có ảnh
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
        console.log("Image upload response:", data);
        imageUrl = data.imageUrl;
      }

      // 🔥 Gửi tin nhắn sau khi ảnh upload (hoặc không cần ảnh)
      console.log("Sending message:", { text: message, image: imageUrl, room });
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
    users
  };
}
