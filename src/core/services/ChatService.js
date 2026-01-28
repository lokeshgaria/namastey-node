class ChatService {
    constructor(chatRepository, cacheService) {
        this.chatRepository = chatRepository;
        this.cache = cacheService;
    }

    // async getUserChats(userId, targetUserId) {
    //     try {
    //         return await this.chatRepository.getUserChats(userId, targetUserId);
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    ////

    getUserChats = async (userId, targetUserId) => {
        // const userId = req.user._id;
        return await this.cache.getChats(
            userId, targetUserId,
            async () => {
                // Fetch from database if not in cache
                const chat = await this.chatRepository.getUserChats(userId, targetUserId);
                if (!chat) {
                    throw new Error('User not found');
                }
                return chat.toObject();
            }
        );
    }
}

module.exports = ChatService;