import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import EmojiPicker from "emoji-picker-react";

const socket = io("http://localhost:3001");

const ChatBox = () => {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        messageInputRef.current &&
        !messageInputRef.current.contains(event.target)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const sendMessage = async () => {
    const formData = new FormData();
    formData.append("text", message);
    formData.append("sender", "Anonymous");

    if (image) {
      formData.append("image", image);
    }

    fetch("http://localhost:3001/upload", {
      method: "POST",
      body: formData,
    });

    setMessage("");
    setImage(null);
  };

  return (
    <div className="chat-box">
      <h1>Real-Time Chat</h1>
      <div
        style={{
          border: "1px solid #ccc",
          height: "300px",
          overflowY: "auto",
          padding: "10px",
        }}
      >
        {/* Render các tin nhắn */}
      </div>

      <button onClick={() => setShowPicker((prevState) => !prevState)}>
        😀
      </button>

      {showPicker && (
        <div
          className="emoji-picker-container"
          ref={emojiPickerRef}
          style={{
            position: "absolute",
            bottom: "60px",
            zIndex: 9999,
            border: "1px solid #ccc",
            borderRadius: "5px",
            background: "#fff",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <EmojiPicker onEmojiClick={(emoji) => setMessage((prev) => prev + emoji.emoji)} />
        </div>
      )}

      <input
        ref={messageInputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Nhập tin nhắn..."
      />

      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
        style={{ marginTop: "10px" }}
      />

      <button onClick={sendMessage}>Gửi</button>
    </div>
  );
};

export default ChatBox;
