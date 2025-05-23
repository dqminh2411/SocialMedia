
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/auth/login.jsx'
import WebSocketTest from "./pages/test/WebSocketTest.jsx";
import PostForm from "./components/PostForm.jsx";
import PostPage from "./components/PostPage.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import InstagramMessengerUI from './pages/chat/message.jsx';
import Notifications from "./notifications.jsx";

// Import our new pages
import HomePage from "./pages/HomePage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import ExplorePage from "./pages/ExplorePage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CreatePostPage from "./pages/CreatePostPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

// Import global styles
import './assets/css/Global.css';

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
        <Router>
            <Routes>
                {/* New UI Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/create" element={<CreatePostPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                {/* Legacy Routes */}
                <Route path="/post" element={<PostPage />} />
                <Route path="/message" element={<InstagramMessengerUI />} />
                <Route path="/old-notifications" element={<Notifications />} />
                <Route path="/login" element={<Login />} />
                <Route path="/websocket" element={<WebSocketTest />} />
            </Routes>
        </Router>
    );
}

export default App
