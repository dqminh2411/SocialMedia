import React from 'react';
import styles from '../assets/css/MessagesPage.module.css';
import Sidebar from '../components/Sidebar';

const MessagesPage = () => {

    function handleComment() {
        const [comment, setcomment] = useState("");
        const api = fetch("ws://localhost:8080/ws", {
            method: "POST",
            header: {
                "content-type": "application/json"
            },
            body: { comment }
        })
            .then(data => console.log(data))
            .then(res => res.json())
    }

    // Mock data for conversations
    const conversations = [
        {
            id: 1,
            username: 'hoangminhtrong04',
            avatar: '../assets/images/anh1.png',
            lastMessage: 'Hey, how are you?',
            time: '2h',
            unread: true
        },
        {
            id: 2,
            username: 'qingzhong04',
            avatar: '../assets/images/anh2.png',
            lastMessage: 'Let\'s meet tomorrow!',
            time: '1d',
            unread: false
        },
        {
            id: 3,
            username: 'qingzhong05',
            avatar: '../assets/images/anh3.png',
            lastMessage: 'Thanks for the info',
            time: '3d',
            unread: false
        }
    ];

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>
                <div className={styles.messagesContainer}>
                    <div className={styles.conversationList}>
                        <div className={styles.conversationHeader}>
                            <h2>Messages</h2>
                            <button className={styles.newMessageBtn}>New</button>
                        </div>

                        <div className={styles.conversations}>
                            {conversations.map(convo => (
                                <div
                                    key={convo.id}
                                    className={`${styles.conversationItem} ${convo.unread ? styles.unread : ''}`}
                                >
                                    <div className={styles.avatar}>
                                        <img src={convo.avatar} alt={convo.username} />
                                    </div>
                                    <div className={styles.conversationInfo}>
                                        <div className={styles.conversationMeta}>
                                            <span className={styles.username}>{convo.username}</span>
                                            <span className={styles.time}>{convo.time}</span>
                                        </div>
                                        <div className={styles.lastMessage}>
                                            {convo.lastMessage}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.chatArea}>
                        <div className={styles.noConversation}>
                            <div className={styles.noConversationContent}>
                                <div className={styles.iconPlaceholder}>
                                    <span>💬</span>
                                </div>
                                <h3>Your Messages</h3>
                                <p>Send private messages to a friend or group</p>
                                <input
                                    type="text"
                                    placeholder="nhập tin nhắn"
                                    onChange={(e) => setcomment(e.target.value)}
                                />
                                <button className={styles.sendMessageBtn} onClick={handleComment}>Send Message</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
