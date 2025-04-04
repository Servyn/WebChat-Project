import { useEffect, useState,useRef } from "react";
import io from "socket.io-client";
import EmojiPicker from "emoji-picker-react";


const socket = io("http://localhost:3001");

export default function Home() {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showPicker, setShowPicker] = useState(false); // Thêm state cho Emoji Picker
  const [room, setRoom] = useState("general");  // Thêm phòng chat
  const [roomInput, setRoomInput] = useState("");
  const [users, setUsers] = useState([]);
  const previousRoom = useRef(null);

  useEffect(() => {
    socket.on("load_messages", (loadedMessages) => {
      setMessages(loadedMessages);
    });
  
    socket.on("chatMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });
  
    socket.on("updateUsers", (userList) => {
      setUsers(userList);  // Cập nhật danh sách người dùng
    });
  
    if (room) {
      if (previousRoom.current && previousRoom.current !== room) {
          console.log(`🚪 Rời phòng: ${previousRoom.current}`);
          socket.emit("leaveRoom", previousRoom.current);  // Rời phòng cũ
      }
      console.log(`🔵 Tham gia phòng: ${room}`);
      socket.emit("joinRoom", room);  // Tham gia phòng mới
      previousRoom.current = room;   // Lưu lại phòng hiện tại
  }

  return () => {
      socket.off("load_messages");
      socket.off("chatMessage");
      socket.off("updateUsers");
  };
  }, [room]);
  
    // Khi room thay đổi, tham gia phòng mới






  
    const sendMessage = async () => {
      const formData = new FormData();
      formData.append("text", message);
      formData.append("sender", "Anonymous");
      formData.append("room", room);
    
      if (image) {
        formData.append("image", image);
      }
    
      try {
        const response = await fetch("http://localhost:3001/upload", {
          method: "POST",
          body: formData,
        });
    
        setMessage("");
        setImage(null);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    };
    
  

  const handleJoinRoom = () => {
    if (roomInput) {
      setRoom(roomInput);
      setRoomInput("");  // Reset input phòng sau khi tham gia
    }
  };

  return (
    <div className="chat-container">
      <h1>Real-Time Chat</h1>

      <div>
        <input
          value={roomInput}
          onChange={(e) => setRoomInput(e.target.value)}
          placeholder="Enter room name"
        />
        <button onClick={handleJoinRoom}>Join Room</button>
      </div>
      <div>
  <h3>Người trong phòng:</h3>
  <ul>
    {users.map((user, index) => (
      <li key={index}>{user}</li>
    ))}
  </ul>
</div>

      <div className="messages-container">
      {messages.map((msg, index) => {
  console.log("Image path:", msg.image);
  return (
    <div key={index} className="message">
      {msg.text && <div className="message-text">{msg.text}</div>}
      {msg.image && (
        <>
          {console.log("Image URL in chat:", `http://localhost:3001/uploads/${msg.image}`)}
          <img
            src={`http://localhost:3001${msg.image}`} alt="sent"
            className="message-image"
            style={{ maxWidth: "200px" }} // Đảm bảo ảnh không bị ẩn
          />
        </>
      )}
    </div>
  );
})}
</div>

        
      <button
        onClick={() => setShowPicker(prevState => !prevState)}
      >
        😀
      </button>

      {showPicker && (
        <div className="emoji-picker-container">
          <EmojiPicker
            onEmojiClick={(emoji) => setMessage((prev) => prev + emoji.emoji)}
          />
        </div>
      )}

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Nhập tin nhắn..."
        style={{ width: "80%", padding: "10px", marginTop: "10px" }}
      />

      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
        style={{ marginTop: "10px" }}
      />

      <button onClick={sendMessage} style={{ padding: "10px" }}>
        Gửi
      </button>
    </div>
  );
}
