// d:\hoc tap ptit\sem2 year3\basic internship\SocialMedia\frontend\src\services\auth-header.js
export default function authHeader() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.accessToken) {
        // For Spring Boot backend
        return { Authorization: 'Bearer ' + user.accessToken };

        // For Node.js Express backend
        // return { 'x-access-token': user.accessToken };
    } else {
        return {};
    }
}
