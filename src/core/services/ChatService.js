class ChatService {
    constructor(chatRepository) {
        this.chatRepository = chatRepository;
    }

    async getUserChats(userId, targetUserId) {
        try {
            return await this.chatRepository.getUserChats(userId, targetUserId);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ChatService;