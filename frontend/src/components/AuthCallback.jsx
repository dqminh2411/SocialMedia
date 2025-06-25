
import authService from "../services/auth.service";
const AuthCallback = () => {
    // get the current URL
    const currentUrl = window.location.href;
    // extract the state parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const receivedState = urlParams.get('state');
    const originalState = localStorage.getItem('oauthState');
    console.log('Received state:', receivedState);
    console.log('Original state:', originalState);
    if (receivedState !== originalState) {
        console.error('State mismatch: received state does not match original state');
        // Optionally, you can redirect to an error page or show a message
        return <div>Error: State mismatch. Please try logging in again.</div>;
    }
    const loginType = localStorage.getItem('loginType');
    localStorage.removeItem('oauthState');
    localStorage.removeItem('loginType');
    const socialLogin = async () => {
        try {
            const data = await authService.socialLogin(
                urlParams.get('code'),
                loginType
            );

            window.location.href = "/";
        }
        catch (error) {
            console.error('Social login error:', error);
            // Optionally, you can redirect to an error page or show a message
            return <div>Error: Social login failed. Please try again.</div>;
        }
    }
    // why window.location.search?
    socialLogin();
}
export default AuthCallback;