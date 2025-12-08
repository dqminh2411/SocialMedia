import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from '../../assets/css/login.module.css';
import '../../assets/css/auth-common.css';
import { defaultStyles } from '../../assets/js/defaultStyles';
import { useAuth } from '../../context/AuthContext';
import googleIcon from '../../assets/images/default-google.png';
import githubIcon from '../../assets/images/default-github.png'
import authService from "../../services/auth.service.jsx";
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
    const from = location.state?.from || '/';
    
    // Clear any stale auth data on mount
    useEffect(() => {
        // If coming from a logout/expired session, ensure clean state
        if (!currentUser) {
            localStorage.removeItem('user');
        }
    }, []);
    
    useEffect(() => {

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

        const timeoutId = setTimeout(fixClickableElements, 500);

        return () => clearTimeout(timeoutId);
    }, []);

    useEffect(() => {

        const params = new URLSearchParams(location.search);
        if (params.get('from') === 'signup') {
            setSuccess('Successful signup! You can now log in with your email and password.');


            setTimeout(() => {
                const successElement = document.querySelector(`.${styles.successMessage}`);
                if (successElement) {
                    successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);


            const emailInput = document.querySelector('input[name="email"]');
            if (emailInput) {
                emailInput.focus();
            }


            setTimeout(() => {
                setSuccess('');
            }, 5000);
        }
    }, [location, styles.successMessage]);


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
            const success = await login(formData.email, formData.password);
            if(success){
                console.log('Login successful!');
                navigate(from, { replace: true });
            }  else{
                console.log('Login failed!');
                setError('Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.response?.data?.message || error.message || 'Login failed');
        }
        setLoading(false);
    };


    const handleLoginClick = () => {
        handleSubmit(new Event('submit', { cancelable: true, bubbles: true }));
    };


    const handleSignupClick = () => {
        navigate('/signup');
    };

    const handleOauth2Login = async (e, loginType) => {
        e.preventDefault();
        try {
            const data = await authService.getSocialLoginPage(loginType);
            // console.log(data)
            // const loginUrl = data.loginUrl;
            // console.log(loginUrl)
            const state = new URLSearchParams(data.loginUrl).get('state');
            //console.log('State parameter:', state);
            localStorage.setItem('oauthState', state);
            localStorage.setItem('loginType', loginType);
            window.location.href = data.loginUrl;
            // get state parameter from the URL

        } catch (error) {
            console.error('Login error:', error);
            setError(error.response?.data?.message || error.message || 'Login failed');
        }

    }

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
                <h1 className={styles.title} style={combinedStyles.title}>Outstagram</h1>
                <p className={styles.subtitle} style={combinedStyles.subtitle}>
                    Login to see your friends' photos and videos.
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
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </form>

                { }
                <button
                    className={styles.dangki}
                    style={combinedStyles.dangki}
                    disabled={loading}
                    onClick={handleLoginClick}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                {error && <div className={styles.errorMessage} style={combinedStyles.errorMessage}>{error}</div>}
                {success && <div className={styles.successMessage} style={combinedStyles.successMessage}>{success}</div>}

                <div className={styles.orDivider} style={combinedStyles.orDivider}>
                    <span>Or</span>
                </div>

                <div style={{ textAlign: "center" }}><span>Hoặc sử dụng</span></div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px", marginBottom: "10px", gap: "20px" }}>
                    <button onClick={(e) => handleOauth2Login(e, "google")}>
                        <img height={"40"} width={"40"} src={googleIcon} />
                    </button>
                    <button onClick={(e) => handleOauth2Login(e, "github")}>
                        <img height={"40"} width={"40"} src={githubIcon} />
                    </button>
                </div>

                {/* <p className={styles.p3} style={{ margin: '15px 0', cursor: 'pointer', color: '#00376b', fontSize: '14px' }}>
                    Quên mật khẩu?
                </p> */}
                <p>
                    <span>Don't have an account? </span>
                    { }
                    <Link
                        to="/signup"
                        className={styles.dangnhap}
                        style={combinedStyles.dangnhap}
                        onClick={handleSignupClick}
                    >
                        Sign up
                    </Link>
                </p>
                <p>
                     <Link
                        to="/forgot-password"
                        className={styles.forgotPassword}
                        style={{ color: '#00376b', fontSize: '14px', textDecoration: 'none' }}
                        
                    >
                        Forgot your password?
                    </Link>
                </p>
            </div>

        </div>
    );
};

export default Login;
