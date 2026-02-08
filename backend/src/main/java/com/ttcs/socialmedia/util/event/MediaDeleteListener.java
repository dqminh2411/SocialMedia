package com.ttcs.socialmedia.util.event;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Component
@AllArgsConstructor
public class MediaDeleteListener {
    private final Cloudinary cloudinary;
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void onMediaDeleteEvent(MediaDeleteEvent event) {
        if (event.getFilesToDelete() == null || event.getFilesToDelete().isEmpty()) return;
        try{
            for(String fileName : event.getFilesToDelete()) {
                String publicId = fileName.substring(fileName.indexOf("socialMedia/"), fileName.lastIndexOf("."));
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                log.info("media deleted: " + publicId);
            }
        }catch(IOException e){
            e.printStackTrace();
        }
    }
}
