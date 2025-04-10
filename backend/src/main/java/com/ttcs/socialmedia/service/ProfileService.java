package com.ttcs.socialmedia.service;

import com.ttcs.socialmedia.domain.Profile;
import com.ttcs.socialmedia.domain.dto.ResProfileDTO;
import com.ttcs.socialmedia.repository.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URISyntaxException;

@Service
public class ProfileService {
    private final ProfileRepository profileRepository;
    private final FileService fileService;
    public ProfileService(ProfileRepository profileRepository,FileService fileService) {
        this.profileRepository = profileRepository;
        this.fileService = fileService;
    }
    public ResProfileDTO update(int id, MultipartFile avatarFile, String bio) {
        Profile profile = this.profileRepository.findById(id);
        final String directoryName = "avatars";
        if(profile != null) {
            String avatarFileName="";
            if(avatarFile!=null){
                try {
                    this.fileService.createDirectory(directoryName);
                    avatarFileName = this.fileService.save(avatarFile,directoryName);
                    this.fileService.deleteFile(profile.getAvatar(),directoryName);
                } catch (URISyntaxException | IOException e) {
                    throw new RuntimeException(e);
                }
            }

            profile.setAvatar(avatarFileName);
            profile.setBio(bio);
            profile = this.profileRepository.save(profile);

            ResProfileDTO resProfile = new ResProfileDTO(profile.getId(), profile.getAvatar(), profile.getBio(), profile.getUpdatedAt());
            return resProfile;
        }
        return null;
    }
}
