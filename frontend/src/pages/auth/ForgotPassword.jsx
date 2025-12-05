import {useState, useEffect} from 'react';
import styles from '../../assets/css/login.module.css';
import authService from '../../services/auth.service.jsx';
const ForgotPassword = () => {

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [displayPin, setDisplayPin] = useState(false);
    const [displayNewPassword, setDisplayNewPassword] = useState(false);
    const [pin, setPin] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const handleSubmit = async () => {
        setLoading(true);
        try {
            alert('submit');
            console.log('Submitting email for password reset:', email);
            const response = await authService.sendResetPasswordEmail(email);
            if (response){
                alert('success');
                setSuccess(`A reset password PIN code has been sent to your email address: ${email}`);
                setDisplayPin(true);
            }
        }
        catch (err) {
            setError('Failed to send reset password email. Please try again.');
        } finally {
            setLoading(false);
        }
    }
    const handleChange = (e) => {
        setEmail(e.target.value);
        console.log('Email input changed:', email);
    }
    return (
        <>
        <div className={styles.container} >
            <div className={styles.part1} >
                <h1 className={styles.title} >Outstagram</h1>
                <p className={styles.subtitle} >
                    {
                        !displayPin? 'To reset your password, please enter your email address below.': !displayNewPassword? 'Please enter the PIN code sent to your email address.': 'Please enter your new password.' 
                    }
                    
                </p>
                    
                <form className={styles.form}  onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="email"
                        className={styles.formInput}
                        
                        placeholder="Email"
                        value={email}
                        onChange={handleChange}
                    />
                    <button
                        className={styles.dangki}
                        disabled={loading}
                        
                    >
                        {loading ? 'Loading' : 'Submit'}
                    </button>
                </form>

                { }
                

                {error && <div className={styles.errorMessage} >{error}</div>}
                {success && <div className={styles.successMessage} >{success}</div>}

                
            </div>

        </div>
        </>
    )
}
export default ForgotPassword;