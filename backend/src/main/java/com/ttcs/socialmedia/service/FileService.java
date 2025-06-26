package com.ttcs.socialmedia.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileService {
    @Value("${app.upload-file.base-uri}")
    private String baseURI;
    private final Cloudinary cloudinary;

    public String upload(MultipartFile file, String directoryName) throws IOException {
        Map<String, String> params = ObjectUtils.asMap(
               "use_filename", "true",
               "unique_filename", "true",
               "asset_folder", "socialMedia/"+ directoryName,
               "use_asset_folder_as_public_id_prefix", "true",
               "resource_type", "auto",
               "type", "upload"
        );
        File tempFile = File.createTempFile(file.getOriginalFilename(), "-img");
        file.transferTo(tempFile);
        Map uploadResult = cloudinary.uploader().upload(tempFile,params);
        System.out.println(uploadResult.get("url").toString());
        tempFile.delete();
        return uploadResult.get("url").toString();
    }

    public void deleteFile(String fileUrl, String dirName) throws URISyntaxException, IOException {
        if (fileUrl == null || fileUrl.isEmpty()) return;
        String publicId = "socialMedia/"+dirName+"/"+fileUrl.substring(fileUrl.lastIndexOf('/')+1,  fileUrl.lastIndexOf('.'));
        Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());

    }
//    public void createDirectory(String directoryName) throws URISyntaxException {
//        URI uri = new URI(baseURI+directoryName);
//        // uri = file:///D:/hoc%20tap%20ptit/sem2%20year3/basic%20internship/SocialMedia/uploads/avatars
//        Path path = Paths.get(uri);
//        // path = D:\hoc tap ptit\sem2 year3\basic internship\SocialMedia\\uploads\avatars
//        File tmpDir = new File(path.toString());
//        if (!tmpDir.isDirectory()) {
//            try {
//                Path dirPath = Files.createDirectory(tmpDir.toPath());
//                System.out.println(">>> CREATE NEW DIRECTORY SUCCESSFUL, PATH = " + tmpDir.toPath());
//            } catch (IOException e) {
//                e.printStackTrace();
//            }
//        } else {
//            System.out.println(">>> SKIP MAKING DIRECTORY, ALREADY EXISTS");
//        }
//    }

//    public String save(MultipartFile file, String directoryName) throws URISyntaxException, IOException {
//        // generate unique name
//        String uuid = UUID.randomUUID().toString();
//        String fileName = uuid + "-" + file.getOriginalFilename();
//
//        // get destination path to fileName
//        URI uri = new URI(baseURI+directoryName+"/"+fileName);
//        Path path = Paths.get(uri);
//
//        try(InputStream inputStream = file.getInputStream()) {
//            Files.copy(inputStream,path, StandardCopyOption.REPLACE_EXISTING);
//        }
//        return fileName;
//    }
//

}
