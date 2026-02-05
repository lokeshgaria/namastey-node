const BaseRepository = require('./BaseRepository');

class ChatRepository extends BaseRepository {
    constructor(ChatModel) {
        super(ChatModel);
        this.model = ChatModel;
    }

    /**
    * Find chat  between two users (bidirectional)
    * @param {String} userId1 
    * @param {String} targetUserId 
    */
    //   const { targetUserId } = req.params;
    //   const userId = req.user._id;
    async getUserChats (userId, targetUserId) {

        // let chat = await Chat.findOne({
        //   participants: { $all: [userId, targetUserId] },
        // });

        let chat = await this.model.findOne({
            participants: { $all: [userId, targetUserId] },
        }).populate({
            path: "participants",
            select: "firstName lastName photoUrl",
        })
            .populate({
                path: "messages.senderId",
                select: "firstName lastName photoUrl",
            });

        if (!chat) {
            chat = new this.model({
                participants: [userId, targetUserId],
                messages: [],
            });

            await chat.save();
            await chat.populate({
                path: "participants",
                select: "firstName lastName photoUrl",
            });
        }
        return await chat.save();
        //   res.status(200).send({ message: "Chat fetched successfully", success: true, data: chat });

    }

}

module.exports = ChatRepository;