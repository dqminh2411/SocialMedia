import '../../assets/css/login.css'
import React, { useState } from 'react';
//import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth.service';
function Login(){
    const[email, setEmail] = useState('')
    const[password, setPassword] = useState('')
    const [message, setMessage] = useState('');
    //const navigate = useNavigate();

    const handleLogin = async (e)=>{
        e.preventDefault();
        try{
            await AuthService.login(email,password);
            setMessage('')
        }catch(error){

            setMessage(error.response?.data.message || error.message);
        }
    }
    return(
        <>
            <div className="part1">
                <h1><b className="title">Insta</b></h1>
                <form onSubmit={handleLogin}>
                    <p className="text1">Tài khoản <input type="text" placeholder="Email"
                                                          size="50" value={email}
                                                          onChange={(e) => setEmail(e.target.value)} required/>
                    </p>
                    <p className="text2">Mật khẩu <input type="password" placeholder="Password" size="50"
                                                         value={password} onChange={(e) => {
                        setPassword(e.target.value)
                    }} required/></p>
                    <br/>
                    <div className="errMsg">{message}</div>
                    <button className="button1">Đăng nhập</button>
                </form>

                <div className="or-divider">
                    <span>Hoặc</span>
                </div>

                <p className="p3">Quên mật khẩu?</p>
            </div>

            <div className="div2">
                <p className="po1">Chưa có tài khoản? <span className="po"><a href="signup.html">Đăng ký</a></span></p>
            </div>
        </>
    )
}
export default Login