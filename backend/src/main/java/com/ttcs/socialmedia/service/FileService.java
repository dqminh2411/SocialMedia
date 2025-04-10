package com.ttcs.socialmedia.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileService {
    @Value("${app.upload-file.base-uri}")
    private String baseURI;

    public void createDirectory(String directoryName) throws URISyntaxException {
        URI uri = new URI(baseURI+directoryName);
        // uri = file:///D:/hoc%20tap%20ptit/sem2%20year3/basic%20internship/SocialMedia/uploads/avatars
        Path path = Paths.get(uri);
        // path = D:\hoc tap ptit\sem2 year3\basic internship\SocialMedia\\uploads\avatars
        File tmpDir = new File(path.toString());
        if (!tmpDir.isDirectory()) {
            try {
                Path dirPath = Files.createDirectory(tmpDir.toPath());
                System.out.println(">>> CREATE NEW DIRECTORY SUCCESSFUL, PATH = " + tmpDir.toPath());
            } catch (IOException e) {
                e.printStackTrace();
            }
        } else {
            System.out.println(">>> SKIP MAKING DIRECTORY, ALREADY EXISTS");
        }
    }

    public String save(MultipartFile file, String directoryName) throws URISyntaxException, IOException {
        // generate unique name
        String uuid = UUID.randomUUID().toString();
        String fileName = uuid + "-" + file.getOriginalFilename();

        // get destination path to fileName
        URI uri = new URI(baseURI+directoryName+"/"+fileName);
        Path path = Paths.get(uri);

        try(InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream,path, StandardCopyOption.REPLACE_EXISTING);
        }
        return fileName;
    }
    
    public void deleteFile(String fileName, String directoryName) throws URISyntaxException, IOException {
        URI uri = new URI(baseURI+directoryName+"/"+fileName);
        Path path = Paths.get(uri);
        Files.deleteIfExists(path);
    }
}
