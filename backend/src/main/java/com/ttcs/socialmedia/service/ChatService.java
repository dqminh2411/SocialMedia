package com.ttcs.socialmedia.service;

import com.ttcs.socialmedia.domain.Chat;
import com.ttcs.socialmedia.domain.Message;
import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.ChatDTO;
import com.ttcs.socialmedia.domain.dto.MessageDTO;
import com.ttcs.socialmedia.repository.ChatRepository;
import com.ttcs.socialmedia.repository.MessageRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ChatService {
    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final UserService userService;

    public Chat getChatById(Integer chatId) {
        return chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found with id: " + chatId));
    }

    public Message saveMessage(MessageDTO messageDTO) {
        // Convert MessageDTO to Message entity
        Message message = new Message();
        Chat chat = chatRepository.findById(messageDTO.getChatId())
                .orElseThrow(() -> new RuntimeException("Chat not found with id: " + messageDTO.getChatId()));
        User sender = userService.getUserById(messageDTO.getSenderId());
        message.setContent(messageDTO.getContent());
        message.setSender(sender);
        message.setChat(chat);
        message.setSentAt(messageDTO.getSentAt());
        message.setRead(messageDTO.isRead());

        return messageRepository.save(message);
    }

    public List<MessageDTO> getMessagesByChatId(Integer chatId) {
        List<Message> messages = messageRepository.findByChatId(chatId);
        if (messages.isEmpty()) {
            return List.of(); // Return an empty list if no messages found
        }
        return messages.stream()
                .map(this::messageToDTO)
                .collect(Collectors.toList());
    }

    public MessageDTO messageToDTO(Message message) {
        MessageDTO messageDTO = new MessageDTO();
        messageDTO.setId(message.getId());
        messageDTO.setContent(message.getContent());
        messageDTO.setSenderId(message.getSender().getId());
        messageDTO.setChatId(message.getChat().getId());
        messageDTO.setSentAt(message.getSentAt());
        messageDTO.setRead(message.isRead());
        return messageDTO;
    }

    public MessageDTO getLastMessageByChatId(Integer chatId) {
        Message lastMessage = messageRepository.findTopByChatIdOrderBySentAtDesc(chatId);
        if (lastMessage == null) {
            return null;
        }
        return messageToDTO(lastMessage);
    }

    public List<ChatDTO> getChatsByUserId(Integer userId) {
        User user = userService.getUserById(userId);
        if (user == null) {
            throw new RuntimeException("User not found with id: " + userId);
        }
        return chatRepository.findByOneUser(user.getId()).stream()
                .map(chat -> chatToDTO(chat, user))
                .collect(Collectors.toList());
    }

    public ChatDTO chatToDTO(Chat chat, User thisUser) {
        ChatDTO chatDTO = new ChatDTO();
        chatDTO.setId(chat.getId());
        chatDTO.setThisUser(userService.userToUserDTO(thisUser));
        int otherUserId = chat.getUser1().getId() == thisUser.getId() ? chat.getUser2().getId()
                : chat.getUser1().getId();
        User otherUser = userService.getUserById(otherUserId);
        chatDTO.setOtherUser(userService.userToUserDTO(otherUser));
        chatDTO.setLastMessage(getLastMessageByChatId(chat.getId()));
        return chatDTO;
    }

    public ChatDTO createChat(ChatDTO chatDTO) {
        boolean exists = chatRepository.existsByUsers(chatDTO.getThisUserId(), chatDTO.getOtherUserId());
        if (exists) {
            throw new RuntimeException("Chat already exists between users");
        }
        Chat chat = new Chat();
        chat.setUser1(userService.getUserById(chatDTO.getThisUserId()));
        chat.setUser2(userService.getUserById(chatDTO.getOtherUserId()));
        chat = chatRepository.save(chat);
        return chatToDTO(chat, chat.getUser1());
    }

    public int getTotalChatCount() {
        return (int) chatRepository.count();
    }
}
