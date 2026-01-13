package com.ttcs.socialmedia.util.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum NotificationType {
    FOLLOW_REQUEST (" requested to follow you"),
    FOLLOW_ACCEPTED( " accepted your follow request"),

    POST_LIKE (" liked your post"),
    POST_MENTION(" mentioned you in the post"),

    COMMENT_ADD (" commented on your post"),
    COMMENT_REPLY (" replied on your comment in the post"),
    COMMENT_LIKE (" liked your comment in the post"),
    COMMENT_MENTION (" mentioned you in a comment in the post"),

    SYSTEM ("System notification");

    private String templateMessage;
}
