
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import PostDetailPage from "./pages/PostDetailPage.jsx";

// Import global styles
import './assets/css/Global.css';

// We need to create this component to handle the modal routing logic
const AppRoutes = () => {
    const location = useLocation();
    const background = location.state?.background;

    return (
        <>
            <Routes location={background || location}>
                {/* New UI Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/create" element={<CreatePostPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/post/:postId" element={<PostDetailPage />} />

                {/* Legacy Routes */}
                <Route path="/post" element={<PostPage />} />
                <Route path="/message" element={<InstagramMessengerUI />} />
                <Route path="/old-notifications" element={<Notifications />} />
                <Route path="/login" element={<Login />} />
                <Route path="/websocket" element={<WebSocketTest />} />
            </Routes>

            {/* Show the modal when we have a background location */}
            {background && (
                <Routes>
                    <Route path="/post/:postId" element={<PostDetailPage />} />
                </Routes>
            )}
        </>
    );
};

function App() {
    return (
        <Router>
            <AppRoutes />
        </Router>
    );
}

export default App
