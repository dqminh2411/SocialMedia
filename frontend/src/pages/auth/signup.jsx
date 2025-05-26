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

    // Add effect to force navigation to work correctly
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

        // Basic validation
        if (!formData.fullname || !formData.email || !formData.rePassword || !formData.password) {
            setError('Vui lòng điền đầy đủ thông tin');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            setLoading(false);
            return;
        }
        if (formData.password !== formData.rePassword) {
            setError('Mật khẩu không khớp');
            setLoading(false);
            return;
        }

        try {
            const response = await AuthService.signup(formData);

            setSuccess('Đăng ký thành công! Chuyển hướng đến trang đăng nhập...');


            navigate('/login')

        } catch (err) {
            setError('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.');
        }

        setLoading(false);
    };

    // Handle button click directly when using it outside a form
    const handleSignupClick = () => {
        handleSubmit(new Event('submit', { cancelable: true, bubbles: true }));
    };

    // Handle link click
    const handleLoginClick = () => {
        navigate('/login');
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
                    Đăng ký để xem ảnh và video từ<br />
                    bạn bè.
                </p>

                <div className={styles.orDivider} style={combinedStyles.orDivider}>
                    <span>Hoặc</span>
                </div>

                <form className={styles.form} style={combinedStyles.form} onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="fullname"
                        className={styles.formInput}
                        style={combinedStyles.formInput}
                        placeholder="Họ và tên"
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
                        type="text"
                        name="password"
                        className={styles.formInput}
                        style={combinedStyles.formInput}
                        placeholder="Mật khẩu"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    <input
                        type="password"
                        name="rePassword"
                        className={styles.formInput}
                        style={combinedStyles.formInput}
                        placeholder="Nhập lại mật khẩu"
                        value={formData.rePassword}
                        onChange={handleChange}
                    />
                </form>

                {/* Signup button outside the form for better click handling */}
                <button
                    className={styles.dangki}
                    style={combinedStyles.dangki}
                    disabled={loading}
                    onClick={handleSignupClick}
                >
                    {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                </button>

                {error && <div className={styles.errorMessage} style={combinedStyles.errorMessage}>{error}</div>}
                {success && <div className={styles.successMessage} style={combinedStyles.successMessage}>{success}</div>}

                <p className={styles.termsText} style={combinedStyles.termsText}>
                    Bằng cách đăng ký, bạn đồng ý với Điều khoản,<br />
                    Chính sách dữ liệu và Chính sách cookie của<br />
                    chúng tôi.
                </p>
                <p>
                    Bạn có tài khoản? {' '}
                    {/* Use both Link and onClick for better resilience */}
                    <Link
                        to="/login"
                        className={styles.dangnhap}
                        style={combinedStyles.dangnhap}
                        onClick={handleLoginClick}
                    >
                        Đăng nhập
                    </Link>
                </p>
            </div>


        </div>
    );
};

export default SignUp;
