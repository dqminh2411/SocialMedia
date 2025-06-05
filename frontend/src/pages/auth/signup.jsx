import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../../assets/css/signup.module.css';
import '../../assets/css/auth-common.css';
import { defaultStyles } from '../../assets/js/defaultStyles';
import AuthService from '../../services/auth.service.jsx';

const SignUp = () => {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        rePassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    
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
        setSuccess('');

        
        if (!formData.fullname || !formData.email || !formData.rePassword || !formData.password) {
            setError('Vui lòng điền đầy đủ thông tin');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự');
            setLoading(false);
            return;
        }
        if (formData.password !== formData.rePassword) {
            setError('Mật khẩu không khớp');
            setLoading(false);
            return;
        } try {
            const response = await AuthService.signup(formData);

            setSuccess('Đăng ký thành công! Chuyển hướng đến trang đăng nhập...');

            
            setTimeout(() => {
                const successElement = document.querySelector(`.${styles.successMessage}`);
                if (successElement) {
                    successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);

            
            setTimeout(() => {
                navigate('/login?from=signup');
            }, 1500);

        } catch (err) {
            setError('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.');
        }

        setLoading(false);
    };

    
    const handleSignupClick = () => {
        handleSubmit(new Event('submit', { cancelable: true, bubbles: true }));
    };

    
    const handleLoginClick = () => {
        navigate('/login');
    };

    
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
                    Sign up to see your friends' photos and videos
                </p>

                <div className={styles.orDivider} style={combinedStyles.orDivider}>
                    <span>Or</span>
                </div>

                <form className={styles.form} style={combinedStyles.form} onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="fullname"
                        className={styles.formInput}
                        style={combinedStyles.formInput}
                        placeholder="Full Name"
                        value={formData.fullname}
                        onChange={handleChange}
                    />

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

                    <input
                        type="password"
                        name="rePassword"
                        className={styles.formInput}
                        style={combinedStyles.formInput}
                        placeholder="Confirm Password"
                        value={formData.rePassword}
                        onChange={handleChange}
                    />
                </form>

                {}
                <button
                    className={styles.dangki}
                    style={combinedStyles.dangki}
                    disabled={loading}
                    onClick={handleSignupClick}
                >
                    {loading ? 'Signing up...' : 'Sign up'}
                </button>

                {error && <div className={styles.errorMessage} style={combinedStyles.errorMessage}>{error}</div>}
                {success && <div className={styles.successMessage} style={combinedStyles.successMessage}>{success}</div>}

                <p className={styles.termsText} style={combinedStyles.termsText}>
                    By signing up, you agree to our Terms,<br />
                    Data Policy and Cookie Policy.
                </p>
                <p>
                    Don't have an account? {' '}
                    {}
                    <Link
                        to="/login"
                        className={styles.dangnhap}
                        style={combinedStyles.dangnhap}
                        onClick={handleLoginClick}
                    >
                        Login
                    </Link>
                </p>
            </div>


        </div>
    );
};

export default SignUp;
