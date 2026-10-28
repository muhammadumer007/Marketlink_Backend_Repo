import Order from "../models/Order.js";
import Product from "../models/productModel.js";
import Notification from "../models/Notification.js";

export const createOrder = async (req, res) => {
    try {
        const customerId = req.user._id;
        const { items, pickupDate, pickupTime, pickupTimeWindow, market, notes } = req.body;
        const resolvedPickupTime = pickupTime || pickupTimeWindow;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Cart items are required" });
        }

        if (!pickupDate || !resolvedPickupTime) {
            return res.status(400).json({ message: "Pickup date and time window are required" });
        }

        const processedItems = [];
        let totalAmount = 0;
        const farmerIds = new Set();

        for (const item of items) {
            const prodId = item.productId || item.product?._id || item.product || item._id;
            const product = await Product.findById(prodId);

            if (!product) {
                return res.status(404).json({
                    message: `Product not found: ${item.name || item.productId}`
                });
            }

            if (product.quantity < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}. Available: ${product.quantity} ${product.unit}`
                });
            }

            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;

            processedItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                unit: product.unit,
                image: product.image || item.image || "",
                farmer: product.farmer
            });

            farmerIds.add(product.farmer.toString());

            product.quantity -= item.quantity;
            if (product.quantity <= 0) {
                product.quantity = 0;
                product.status = "sold-out";
            }
            await product.save();
        }

        const order = await Order.create({
            customer: customerId,
            items: processedItems,
            totalAmount,
            pickupDate,
            pickupTime: resolvedPickupTime,
            market: market || null,
            paymentMethod: "Pay at Pickup",
            status: "Pending",
            notes: notes || ""
        });

        await Notification.create({
            recipient: customerId,
            title: "Order Placed Successfully",
            message: `Your pre-order #${order._id.toString().slice(-6)} has been placed for pickup on ${pickupDate} (${resolvedPickupTime}). Pay at pickup: Rs. ${totalAmount}`,
            type: "order",
            link: `/customer/orders`
        });

        for (const fId of farmerIds) {
            await Notification.create({
                recipient: fId,
                title: "New Incoming Pre-Order",
                message: `You have a new pre-order #${order._id.toString().slice(-6)} for pickup on ${pickupDate} (${pickupTime}).`,
                type: "order",
                link: `/farmer-dashboard/orders`
            });
        }

        return res.status(201).json({
            message: "Order placed successfully! Please pay at pickup.",
            order
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to place order",
            error: error.message
        });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user._id })
            .populate("items.product", "name image unit")
            .populate("items.farmer", "name businessName phone")
            .populate("market", "name address city")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Customer orders fetched successfully",
            orders
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch orders",
            error: error.message
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("customer", "name email phone address")
            .populate("items.product", "name image unit price")
            .populate("items.farmer", "name businessName phone address")
            .populate("market", "name address city operatingDays pickupWindows");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const isCustomer = order.customer._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";
        const isFarmer = order.items.some(
            (item) => item.farmer && item.farmer._id.toString() === req.user._id.toString()
        );

        if (!isCustomer && !isAdmin && !isFarmer) {
            return res.status(403).json({ message: "Access denied to this order" });
        }

        return res.status(200).json({
            message: "Order details fetched successfully",
            order
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch order",
            error: error.message
        });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const isCustomer = order.customer.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isCustomer && !isAdmin) {
            return res.status(403).json({ message: "You cannot cancel this order" });
        }

        if (order.status !== "Pending" && order.status !== "Confirmed") {
            return res.status(400).json({
                message: `Order cannot be cancelled because it is already '${order.status}'`
            });
        }

        order.status = "Cancelled";
        order.cancellationReason = reason || (isCustomer ? "Cancelled by customer" : "Cancelled by admin");
        await order.save();

        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
                product.quantity += item.quantity;
                if (product.quantity > 0 && product.status === "sold-out") {
                    product.status = "available";
                }
                await product.save();
            }
        }

        const farmerIds = new Set(order.items.map((i) => i.farmer.toString()));
        for (const fId of farmerIds) {
            await Notification.create({
                recipient: fId,
                title: "Order Cancelled",
                message: `Order #${order._id.toString().slice(-6)} has been cancelled. Stock has been restored.`,
                type: "order",
                link: `/farmer-dashboard/orders`
            });
        }

        return res.status(200).json({
            message: "Order cancelled successfully",
            order
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to cancel order",
            error: error.message
        });
    }
};

export const getFarmerOrders = async (req, res) => {
    try {
        const farmerId = req.user._id;

        const orders = await Order.find({ "items.farmer": farmerId })
            .populate("customer", "name email phone address")
            .populate("market", "name city address")
            .sort({ createdAt: -1 });

        const farmerOrders = orders.map((order) => {
            const filteredItems = order.items.filter(
                (item) => item.farmer.toString() === farmerId.toString()
            );

            const farmerTotal = filteredItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

            return {
                _id: order._id,
                customer: order.customer,
                items: filteredItems,
                totalAmount: farmerTotal,
                pickupDate: order.pickupDate,
                pickupTime: order.pickupTime,
                market: order.market,
                status: order.status,
                notes: order.notes,
                paymentMethod: order.paymentMethod,
                createdAt: order.createdAt
            };
        });

        return res.status(200).json({
            message: "Farmer orders fetched successfully",
            orders: farmerOrders
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch farmer orders",
            error: error.message
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = [
            "Pending",
            "Confirmed",
            "Ready for Pickup",
            "Completed",
            "Cancelled"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid order status" });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const isFarmer = order.items.some(
            (item) => item.farmer.toString() === req.user._id.toString()
        );
        const isAdmin = req.user.role === "admin";

        if (!isFarmer && !isAdmin) {
            return res.status(403).json({
                message: "Access denied. Only the involved farmer or admin can update this order status."
            });
        }

        const oldStatus = order.status;
        order.status = status;

        if (status === "Cancelled" && oldStatus !== "Cancelled") {
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.quantity += item.quantity;
                    if (product.quantity > 0 && product.status === "sold-out") {
                        product.status = "available";
                    }
                    await product.save();
                }
            }
        }

        await order.save();

        await Notification.create({
            recipient: order.customer,
            title: `Order Status: ${status}`,
            message: `Your pre-order #${order._id.toString().slice(-6)} is now ${status}. Pickup on ${order.pickupDate} (${order.pickupTime}).`,
            type: "status",
            link: `/customer/orders`
        });

        return res.status(200).json({
            message: `Order status updated to '${status}'`,
            order
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update order status",
            error: error.message
        });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("customer", "name email phone")
            .populate("market", "name city")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "All orders fetched successfully",
            orders
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch all orders",
            error: error.message
        });
    }
};

export const getOrderReports = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const completedOrders = await Order.countDocuments({ status: "Completed" });
        const pendingOrders = await Order.countDocuments({ status: "Pending" });
        const cancelledOrders = await Order.countDocuments({ status: "Cancelled" });

        const orders = await Order.find({ status: { $ne: "Cancelled" } });
        const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        return res.status(200).json({
            message: "Reports fetched successfully",
            report: {
                totalOrders,
                completedOrders,
                pendingOrders,
                cancelledOrders,
                totalRevenue
            },
            reports: {
                totalOrders,
                completedOrders,
                pendingOrders,
                cancelledOrders,
                totalRevenue
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch reports",
            error: error.message
        });
    }
};
