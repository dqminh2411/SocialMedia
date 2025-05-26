
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from './pages/auth/login.jsx'
import SignUp from './pages/auth/signup.jsx'
import WebSocketTest from "./pages/test/WebSocketTest.jsx";
import PostForm from "./components/PostForm.jsx";
import PostPage from "./components/PostPage.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import InstagramMessengerUI from './pages/chat/message.jsx';
import Notifications from "./notifications.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminProtectedRoute from "./components/AdminProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AdminProvider } from "./context/AdminContext.jsx";
import AuthStatus from "./components/AuthStatus.jsx";

// Import our new pages
import HomePage from "./pages/HomePage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import ExplorePage from "./pages/ExplorePage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CreatePostPage from "./pages/CreatePostPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import PostDetailPage from "./pages/PostDetailPage.jsx";

// Import admin pages
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import UserManagement from "./pages/admin/UserManagement.jsx";
import PostManagement from "./pages/admin/PostManagement.jsx";
import Statistics from "./pages/admin/Statistics.jsx";

// Import global styles
import './assets/css/Global.css';

// We need to create this component to handle the modal routing logic
const AppRoutes = () => {
    const location = useLocation();
    const background = location.state?.background;

    return (
        <>
            <AuthStatus />
            <Routes location={background || location}>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />

                {/* Protected Routes */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <HomePage />
                    </ProtectedRoute>
                } />
                <Route path="/search" element={
                    <ProtectedRoute>
                        <SearchPage />
                    </ProtectedRoute>
                } />
                <Route path="/explore" element={
                    <ProtectedRoute>
                        <ExplorePage />
                    </ProtectedRoute>
                } />
                <Route path="/messages" element={
                    <ProtectedRoute>
                        <MessagesPage />
                    </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                    <ProtectedRoute>
                        <NotificationsPage />
                    </ProtectedRoute>
                } />
                <Route path="/create" element={
                    <ProtectedRoute>
                        <CreatePostPage />
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                } />
                <Route path="/post/:postId" element={
                    <ProtectedRoute>
                        <PostDetailPage />
                    </ProtectedRoute>
                } />

                {/* Legacy Routes */}
                <Route path="/post" element={
                    <ProtectedRoute>
                        <PostPage />
                    </ProtectedRoute>
                } />
                <Route path="/message" element={
                    <ProtectedRoute>
                        <InstagramMessengerUI />
                    </ProtectedRoute>
                } />
                <Route path="/old-notifications" element={
                    <ProtectedRoute>
                        <Notifications />
                    </ProtectedRoute>
                } />
                <Route path="/websocket" element={
                    <ProtectedRoute>
                        <WebSocketTest />
                    </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={
                    <AdminProtectedRoute>
                        <Dashboard />
                    </AdminProtectedRoute>
                } />
                <Route path="/admin/users" element={
                    <AdminProtectedRoute>
                        <UserManagement />
                    </AdminProtectedRoute>
                } />
                <Route path="/admin/posts" element={
                    <AdminProtectedRoute>
                        <PostManagement />
                    </AdminProtectedRoute>
                } />
                <Route path="/admin/statistics" element={
                    <AdminProtectedRoute>
                        <Statistics />
                    </AdminProtectedRoute>
                } />

                {/* Default route - redirect to login */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>

            {/* Show the modal when we have a background location */}
            {background && (
                <Routes>
                    <Route path="/post/:postId" element={
                        <ProtectedRoute>
                            <PostDetailPage />
                        </ProtectedRoute>
                    } />
                </Routes>
            )}
        </>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <AdminProvider>
                    <AppRoutes />
                </AdminProvider>
            </AuthProvider>
        </Router>
    );
}

export default App
