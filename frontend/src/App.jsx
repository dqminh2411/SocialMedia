
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/auth/login.jsx'
import WebSocketTest from "./pages/test/WebSocketTest.jsx";
import PostEditor from "./components/PostForm.jsx";
import PostForm from "./components/PostForm.jsx";
import PostPage from "./components/PostPage.jsx";
import PostEditor1 from "./components/PostEditor1.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import InstagramMessengerUI from './pages/chat/message.jsx';
import Notification from "./pages/test/notification.jsx";
import Notifications from "./notifications.jsx";

function App() {
    // const isLoggedIn = !!localStorage.getItem("user");

    // return (
    //     <Router>
    //         <Routes>
    //             <Route path="/login" element={<Login />} />
    //             <Route
    //                 path="/websocket"
    //                 element={isLoggedIn ? <WebSocketTest /> : <Navigate to="/login" />}
    //             />
    //             <Route path="*" element={<Navigate to={isLoggedIn ? "/websocket" : "/login"} />} />
    //         </Routes>
    //     </Router>
    // );

    return (
        <>
            <PostPage />
        </>
    );

}

export default App
