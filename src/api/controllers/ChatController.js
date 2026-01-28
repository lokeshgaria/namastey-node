class ChatController {
    constructor(chatService) {
        this.chatService = chatService;

        console.log('chat controller constructor',chatService)
    }


    getUserChats = async (req, res, next) => {
        try {
            const userId = req.user._id;
            const targetUserId = req.params.targetUserId;
            const chats = await this.chatService.getUserChats(userId, targetUserId);
            res.status(200).json({
                success: true,
                data: chats,
                message: "Chats fetched successfully"
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ChatController;