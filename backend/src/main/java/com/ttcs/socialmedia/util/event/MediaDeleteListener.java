package com.ttcs.socialmedia.util.event;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.io.IOException;
import java.util.Map;

@Component
@AllArgsConstructor
public class MediaDeleteListener {
    private final Cloudinary cloudinary;
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onMediaDeleteEvent(MediaDeleteEvent event) {
        if (event.getFilesToDelete() == null || event.getFilesToDelete().isEmpty()) return;
        try{
            for(String fileName : event.getFilesToDelete()) {
                String publicId = fileName.substring(fileName.indexOf("socialMedia/"), fileName.lastIndexOf("."));
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        }catch(IOException e){
            e.printStackTrace();
        }
    }
}
