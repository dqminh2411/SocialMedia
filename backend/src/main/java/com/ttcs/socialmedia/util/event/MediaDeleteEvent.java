package com.ttcs.socialmedia.util.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@AllArgsConstructor
public class MediaDeleteEvent {
    private List<String> filesToDelete;
    private String mediaDir;
}
