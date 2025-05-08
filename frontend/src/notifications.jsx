import React from "react";
import {
  FaInstagram,
  FaHome,
  FaSearch,
  FaRegHeart,
  FaPlusSquare,
  FaRegCircle,
  FaBars,
} from "react-icons/fa";
import { BsMessenger, BsCameraVideo } from "react-icons/bs";
import { PiNotePencilBold } from "react-icons/pi";
import { FiUser } from "react-icons/fi";
import { IoMdPaperPlane } from "react-icons/io";
import "../public/notifications.css";
function notifications() {
  return (
    <>
      <div className="part1">
        <div className="part11">
          <FaInstagram size={24} />
          <FaHome size={24} />
          <FaSearch size={24} />
          <BsCameraVideo size={24} />
          <IoMdPaperPlane size={24} />
          <FaRegHeart size={24} />
          <FaPlusSquare size={24} />
          <FiUser size={24} />
          <FaRegCircle size={24} />
          <FaBars size={24} />
        </div>
        <div className="part12">
          <h1>Notifications</h1>
          <p>This week </p>
        </div>
      </div>
      <div className="part2">
        <h3 className="text"> Sorry, this page isn't available. </h3>
        <p className="text">
          The link you followed may be broken, or the page may have been
          removed. Go back to Instagram
        </p>
        <h4 className="text">
          Meta About Blog Jobs Help API Privacy Terms Locations Instagram Lite
          Threads Contact Uploading & Non-Users Meta Verified{" "}
        </h4>
        <h4 className="text">English © 2025 Instagram from Meta</h4>
      </div>
    </>
  );
}
export default notifications;
