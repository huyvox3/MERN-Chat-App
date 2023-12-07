import "./App.css";
import { Route, Routes } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import ChatPage from "./Pages/ChatPage";
import VideoCall from "./Components/VideoCall";
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" Component={HomePage}></Route>
        <Route path="/chats" Component={ChatPage}></Route>
        <Route path="/videocall/:room/:user/:isGroup/:name/" Component={VideoCall}></Route>
      </Routes>
    </div>
  );
}

export default App;
