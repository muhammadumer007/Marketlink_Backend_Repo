export const roleMiddleware = (...roles) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        if (req.user.role === "farmer" && req.user.status !== "active") {
            return res.status(403).json({
                message: req.user.status === "pending"
                    ? "Your farmer account is waiting for admin approval"
                    : `Your farmer account is ${req.user.status}`
            });
        }

        next();
    };
};