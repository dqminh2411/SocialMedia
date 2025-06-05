import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from './pages/auth/login.jsx'
import SignUp from './pages/auth/signup.jsx'
import PostForm from "./components/PostForm.jsx";
import PostPage from "./components/PostPage.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminProtectedRoute from "./components/AdminProtectedRoute.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";
import { AdminProvider } from "./context/AdminContext.jsx";



import HomePage from "./pages/HomePage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import ExplorePage from "./pages/ExplorePage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CreatePostPage from "./pages/CreatePostPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import PostDetailPage from "./pages/PostDetailPage.jsx";
import HashtagPage from "./pages/HashtagPage.jsx";


import AdminLogin from "./pages/admin/AdminLogin.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import UserManagement from "./pages/admin/UserManagement.jsx";
import PostManagement from "./pages/admin/PostManagement.jsx";



import './assets/css/Global.css';
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { ChatProvider } from "./context/ChatContext.jsx";


const AppRoutes = () => {
    const location = useLocation();
    const background = location.state?.background;

    return (
        <>

            <Routes location={background || location}>
                { }
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />

                { }
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
                <Route path="/profile/un/:username" element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                } />
                <Route path="/post/:postId" element={
                    <ProtectedRoute>
                        <PostDetailPage />
                    </ProtectedRoute>
                } />


                <Route path="/hashtag/:hashtagName" element={
                    <ProtectedRoute>
                        <HashtagPage />
                    </ProtectedRoute>
                } />

                { }
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


                { }
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>

            { }
            {background && (
                <Routes>
                    <Route path="/post/:postId" element={
                        <ProtectedRoute>
                            <PostDetailPage />
                        </ProtectedRoute>
                    } />
                    { }
                    {/* <Route path="/hashtag/:hashtagName/post/:postId" element={
                        <ProtectedRoute>
                            <PostDetailPage />
                        </ProtectedRoute>
                    } /> */}
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
                    <NotificationProvider>
                        <ChatProvider>
                            <AppRoutes />
                        </ChatProvider>
                    </NotificationProvider>
                </AdminProvider>
            </AuthProvider>
        </Router>
    );
}

export default App
