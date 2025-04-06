import { AppBar, Toolbar, Typography, Button, Box, Paper, TextField, IconButton, Avatar, List, ListItem, ListItemText, Divider } from "@mui/material";
import EmojiPicker from "emoji-picker-react";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import SendIcon from "@mui/icons-material/Send";

export default function ChatUI({
  username,
  handleLogout,
  message, setMessage,
  image, setImage,
  messages,
  showPicker, setShowPicker,
  roomInput, setRoomInput,
  handleJoinRoom,
  sendMessage,
  users
}) {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Web Chat Real-Time</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>{username}</Typography>
            <Button color="inherit" onClick={handleLogout}>Đăng xuất</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Sidebar Users */}
        <Paper sx={{ width: 250, p: 2, overflowY: 'auto' }}>
          <Typography variant="h6">Người trong phòng:</Typography>
          <Divider sx={{ my: 1 }} />
          <List dense>
            {users.map((user, index) => (
              <ListItem key={index}>
                <Avatar sx={{ width: 24, height: 24, mr: 1 }} />
                <ListItemText primary={user.username} />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Chat Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
          
          {/* Room Input */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Nhập tên phòng..."
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
            />
            <Button variant="contained" onClick={handleJoinRoom}>Vào phòng</Button>
          </Box>

          {/* Messages */}
          <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
            {messages.map((msg, index) => (
              <Paper key={index} sx={{ p: 1, mb: 1, backgroundColor: "#f5f5f5" }}>
                <Typography sx={{ fontWeight: 'bold' }}>
                  {msg.sender}:
                </Typography>
                {msg.text && <Typography>{msg.text}</Typography>}
                {msg.image && (
                  <img
                    src={`http://localhost:3001${msg.image}`}
                    alt="sent"
                    style={{ maxWidth: "200px", marginTop: 4, borderRadius: 8 }}
                  />
                )}
              </Paper>
            ))}
          </Box>

          {/* Emoji Picker */}
          {showPicker && (
            <Box sx={{ mb: 1 }}>
              <EmojiPicker onEmojiClick={(emoji) => setMessage(prev => prev + emoji.emoji)} />
            </Box>
          )}

          {/* Message Input */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={() => setShowPicker(prev => !prev)}>
              <EmojiEmotionsIcon />
            </IconButton>

            <TextField
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Nhập tin nhắn..."
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              style={{ display: "none" }}
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button variant="outlined" component="span">Ảnh</Button>
            </label>

            <IconButton color="primary" onClick={sendMessage}>
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
