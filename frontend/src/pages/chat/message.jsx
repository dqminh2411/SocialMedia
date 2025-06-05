import React, { useState } from "react";
import {
  FaInstagram, FaHome, FaSearch, FaRegHeart, FaPlusSquare, FaRegCircle, FaBars
} from "react-icons/fa";
import { BsMessenger, BsCameraVideo } from "react-icons/bs";
import { PiNotePencilBold } from "react-icons/pi";
import { FiUser } from "react-icons/fi";
import { IoMdPaperPlane } from "react-icons/io";

import "../../../public/message.module.css";
export default function InstagramMessengerUI() {

  function handleComment() {
    const [comment, setcomment] = useState("");
    const api = fetch("ws:
      method: "POST",
      header: {
        "content-type": "application/json"
      },
      body: { comment }
    })
      .then(data => console.log(data))
      .then(res => res.json())
  }
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {}
      <div className="sidebar">
        <FaInstagram size={24} />
        <FaHome size={24} />
        <FaSearch size={24} />
        <BsCameraVideo size={24} />
        <IoMdPaperPlane size={24} />
        <div className="icon-notification">
          <FaRegHeart size={24} />
        </div>
        <FaPlusSquare size={24} />
        <FiUser size={24} />
        <FaRegCircle size={24} />
        <FaBars size={24} />

      </div>

      {}
      <div style={{ display: "flex", flex: 1 }}>
        {}
        <div className="message-sidebar">
          <div className="message-header">
            <h2 style={{ fontSize: "1.125rem", fontWeight: "bold" }}>ttn_046</h2>
            <PiNotePencilBold size={20} />
          </div>

          <div className="profile-preview">
            <div className="avatar-placeholder" />
            <div>
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Your note</p>
            </div>
          </div>

          <div className="message-tabs">
            <span className="active">Messages</span>
            <span>Requests</span>
          </div>

          <div style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#6b7280", textAlign: "center" }}>
            No messages found.
          </div>
          <input
            type="text"
            placeholder="nhập tin nhắn"
            onChange={(e) => setcomment(e.target.value)}
          />
        </div>






        {}
        <div className="chat-empty">

          <BsMessenger size={48} className="mb-4" />
          <h2>Your messages</h2>
          <p>Send a message to start a chat.</p>
          <button onClick={handleComment}>Send message</button>
        </div>
      </div>
    </div>
  );
}
