const BaseRepository = require("./BaseRepository");

class OrderRepository extends BaseRepository {
    constructor(OrderModel) {
        super(OrderModel);
        this.model = OrderModel;
    }
    // route to upgrade user plan

    async createOrder(orderData) {
        const newOrder = await this.model.create(orderData);

        await newOrder.save();
        return newOrder;
    }
    // route to verify payment
    async updateOneByQuery(query, data, options = { new: true }) {
        return await this.model.findOneAndUpdate(query, data, options);

    }

    // route for razor pay webhook

}

module.exports = OrderRepository;