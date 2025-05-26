import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from '../../assets/css/login.module.css';
import '../../assets/css/auth-common.css'; // Import the common auth styles directly
import { defaultStyles } from '../../assets/js/defaultStyles';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const { login, currentUser } = useAuth();
    const from = location.state?.from || '/';    // Add effect to force navigation to work correctly
    useEffect(() => {
        // Add event listeners to ensure links and buttons are clickable
        const fixClickableElements = () => {
            const buttons = document.querySelectorAll('button');
            const links = document.querySelectorAll('a');

            buttons.forEach(button => {
                button.style.cursor = 'pointer';
                button.style.pointerEvents = 'auto';
            });

            links.forEach(link => {
                link.style.cursor = 'pointer';
                link.style.pointerEvents = 'auto';
            });
        };

        fixClickableElements();
        // Run the fix on every render and after a short delay
        const timeoutId = setTimeout(fixClickableElements, 500);

        return () => clearTimeout(timeoutId);
    }, []);
    // Check if user was redirected from signup page
    useEffect(() => {
        // If came from signup page with success param
        const params = new URLSearchParams(location.search);
        if (params.get('from') === 'signup') {
            setSuccess('Đăng ký thành công! Vui lòng đăng nhập với tài khoản mới của bạn.');

            // Scroll to the success message if it's not visible
            setTimeout(() => {
                const successElement = document.querySelector(`.${styles.successMessage}`);
                if (successElement) {
                    successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);

            // Auto-focus the email field
            const emailInput = document.querySelector('input[name="email"]');
            if (emailInput) {
                emailInput.focus();
            }

            // Clear the success message after 5 seconds
            setTimeout(() => {
                setSuccess('');
            }, 5000);
        }
    }, [location, styles.successMessage]);

    // If user is already authenticated, redirect to home page
    useEffect(() => {
        if (currentUser) {
            console.log('User already logged in, redirecting to:', from);
            navigate(from, { replace: true });
        }
    }, [currentUser, navigate, from]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        console.log('Login attempt with:', formData.email);

        try {
            const user = await login(formData.email, formData.password);
            console.log('Login successful, user:', user);
            console.log('Redirecting to:', from);
            navigate(from, { replace: true });
        } catch (error) {
            console.error('Login error:', error);
            setError(error.response?.data?.message || error.message || 'Login failed');
        }

        setLoading(false);
    };

    // Handle button click directly when using it outside a form
    const handleLoginClick = () => {
        handleSubmit(new Event('submit', { cancelable: true, bubbles: true }));
    };

    // Handle link click
    const handleSignupClick = () => {
        navigate('/signup');
    };

    // Combine CSS module styles with inline styles for resilience
    const combinedStyles = {
        container: { ...defaultStyles.container },
        part1: { ...defaultStyles.part1 },
        title: { ...defaultStyles.title },
        subtitle: { ...defaultStyles.subtitle },
        form: { ...defaultStyles.form },
        formInput: { ...defaultStyles.formInput },
        dangki: { ...defaultStyles.dangki, cursor: 'pointer' },
        orDivider: { ...defaultStyles.orDivider },
        termsText: { ...defaultStyles.termsText },
        part2: { ...defaultStyles.part2 },
        dangnhap: { ...defaultStyles.dangnhap, cursor: 'pointer' },
        errorMessage: { ...defaultStyles.errorMessage },
        successMessage: { ...defaultStyles.successMessage }
    };

    return (
        <div className={styles.container} style={combinedStyles.container}>
            <div className={styles.part1} style={combinedStyles.part1}>
                <h1 className={styles.title} style={combinedStyles.title}>Insta</h1>
                <p className={styles.subtitle} style={combinedStyles.subtitle}>
                    Đăng nhập để xem ảnh và video từ<br />
                    bạn bè.
                </p>

                <form className={styles.form} style={combinedStyles.form} onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="email"
                        className={styles.formInput}
                        style={combinedStyles.formInput}
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    <input
                        type="password"
                        name="password"
                        className={styles.formInput}
                        style={combinedStyles.formInput}
                        placeholder="Mật khẩu"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </form>

                {/* Login button outside the form for better click handling */}
                <button
                    className={styles.dangki}
                    style={combinedStyles.dangki}
                    disabled={loading}
                    onClick={handleLoginClick}
                >
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>

                {error && <div className={styles.errorMessage} style={combinedStyles.errorMessage}>{error}</div>}
                {success && <div className={styles.successMessage} style={combinedStyles.successMessage}>{success}</div>}

                <div className={styles.orDivider} style={combinedStyles.orDivider}>
                    <span>Hoặc</span>
                </div>

                {/* <p className={styles.p3} style={{ margin: '15px 0', cursor: 'pointer', color: '#00376b', fontSize: '14px' }}>
                    Quên mật khẩu?
                </p> */}
                <p>
                    Chưa có tài khoản? {' '}
                    {/* Use both Link and onClick for better resilience */}
                    <Link
                        to="/signup"
                        className={styles.dangnhap}
                        style={combinedStyles.dangnhap}
                        onClick={handleSignupClick}
                    >
                        Đăng ký
                    </Link>
                </p>
            </div>

        </div>
    );
};

export default Login;