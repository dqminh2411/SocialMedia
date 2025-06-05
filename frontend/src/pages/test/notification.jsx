import React, { useState } from 'react';
import { Stomp } from "@stomp/stompjs";
import SockJS from 'sockjs-client';
function Notification(){
    const socket = new SockJS('/ws'); 
    const stompClient = Stomp.over(socket);

    const user = JSON.parse(localStorage.getItem('user'))
    const accessToken = user?.accessToken

    console.log("jwt: " + accessToken)
    stompClient.connect({ Authorization: "Bearer " + accessToken}, function(frame) {
        console.log('Connected: ' + frame);

        stompClient.subscribe('/topic/notifications', function(message) {
            const data = JSON.parse(message.body);
            const li = document.createElement("li");
            li.textContent = data.sender + ": " + data.message;
            document.getElementById("noti-list").appendChild(li);
        });
    });
    return (
        <>
            <h3>Notifications:</h3>
            <ul id="noti-list"></ul>
        </>
    )
}

export default Notification;
