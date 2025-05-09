import React, {useState, useRef, useEffect} from "react";
import { Stomp } from "@stomp/stompjs";
import SockJS from 'sockjs-client';


const WebSocketTest = () => {
    const [toUser, setToUser] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    const isConnected = useRef(false)
    const stompClient = useRef(null);

    const user = JSON.parse(localStorage.getItem('user'))
    const username = user?.email
    const accessToken = user?.accessToken

    console.log("jwt: " + accessToken)

    const connect = () => {
        const socket = new WebSocket("ws://localhost:8080/ws"); // Match Spring Boot port!
        stompClient.current = Stomp.over(socket);

        stompClient.current.connect(
            { Authorization: `Bearer ${accessToken}` },
            () => {
                //setIsConnected(true);
                console.log('connected')
                stompClient.current.subscribe("/user/topic", (msg) => {// msg is STOMP message
                    const data = JSON.parse(msg.body); // msg.body is message payload (JSON string) that backend sends
                    setMessages((prev) => [...prev, data]);
                });
            }
        );
    };
    useEffect(() => {
        if(isConnected.current === false){
            connect()
            isConnected.current = true
        }

    }, []);
    const sendMessage = (e) => {
        e.preventDefault();
        stompClient.current.send(
            "/app/chat",
            {},
            JSON.stringify({
                recipient: {
                    email: toUser,
                },
                content: message,
                sender: {
                    email: username,
                }
            })
        );
        setMessage("");
    };

    return (
        <div className="container mt-4 text-white">
            <div className="row border-bottom border-3 mb-4">
                <div className="col-6">
                    <h1>WebSocket Test</h1>
                </div>
                {
                //     !isLoggedIn ? (
                //     <div className="col-6">
                //         <form onSubmit={handleLogin} className="d-flex gap-2">
                //             <input
                //                 type="text"
                //                 className="form-control"
                //                 placeholder="username"
                //                 value={username}
                //                 onChange={(e) => setUsername(e.target.value)}
                //                 required
                //             />
                //             <input
                //                 type="password"
                //                 className="form-control"
                //                 placeholder="password"
                //                 value={password}
                //                 onChange={(e) => setPassword(e.target.value)}
                //                 required
                //             />
                //             <button type="submit" className="btn btn-primary btn-sm px-4">
                //                 Login
                //             </button>
                //         </form>
                //     </div>
                // )
                }


            </div>

            <div className="row mb-3">
                <div className="col-12">
                    <h4>Send Message</h4>
                </div>
                <form
                    onSubmit={sendMessage}
                    className="col-12 d-flex align-items-end gap-3"
                >
                    <div className="w-100">
                        <label className="form-label text-black">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            value={toUser}
                            onChange={(e) => setToUser(e.target.value)}
                            required
                        />
                    </div>
                    <div className="w-100">
                        <label className="form-label text-black">Message</label>
                        <input
                            type="text"
                            className="form-control"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        />
                    </div>
                    <div className="d-grid">
                        <button type="submit" className="btn btn-warning" disabled={!isConnected}>
                            SEND
                        </button>
                    </div>
                </form>
            </div>

            <div className="row">
                <div className="col-12">
                    <h4>Messages</h4>
                </div>
                <div className="col-12">
                    <table className="table table-striped text-white">
                        <thead>
                        <tr>
                            <th>Message</th>
                            <th>From</th>
                        </tr>
                        </thead>
                        <tbody>
                        {messages.map((msg, idx) => (
                            <tr key={idx}>
                                <td>{msg.content}</td>
                                <td>{msg.sender.email}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WebSocketTest;
