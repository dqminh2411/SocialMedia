import s from '../../assets/css/login.module.css'
import React, {useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth.service';
import {Stomp} from "@stomp/stompjs";
function Login(){
    const[email, setEmail] = useState('')
    const[password, setPassword] = useState('')
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e)=>{
        e.preventDefault();
        try{
            await AuthService.login(email,password);
            setMessage('')
            navigate("/websocket")
        }catch(error){

            setMessage(error.response?.data.message || error.message);
        }

    }

    return(
        <>
            <div className={s.part1}>
                <h1><b className={s.title}>Insta</b></h1>
                <form onSubmit={handleLogin}>
                    <p className={s.text1}>Tài khoản <input type="text" placeholder="Email"
                                                            size="50" value={email}
                                                            onChange={(e) => setEmail(e.target.value)} required/>
                    </p>
                    <p className={s.text2}>Mật khẩu <input type="password" placeholder="Password" size="50"
                                                           value={password} onChange={(e) => {
                        setPassword(e.target.value)
                    }} required/></p>
                    <br/>
                    <div className={s.errMsg}>{message}</div>
                    <button className={s.button1}>Đăng nhập</button>
                </form>

                <div className={s.orDivider}>
                    <span>Hoặc</span>
                </div>

                <p className={s.p3}>Quên mật khẩu?</p>
                <p className={s.po1}>Chưa có tài khoản? <span className={s.po}><a href="signup.html">Đăng ký</a></span>
                </p>

            </div>
        </>
    )
}

export default Login