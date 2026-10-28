import Category from "../models/categoryModel.js";

export const createCategory = async (req, res) => {

    try {

        const { name, description } = req.body
        if (!name) {
            return res.status(400).json({
                message: "Category name required "

            });
        }

        const categoryExists = await Category.findOne({ name })
        if (categoryExists) {
            return res.status(409).json({ message: "Category alreagy exists" })

        }

        const category = await Category.create({
            name,
            description
        });

        return res.status(200).json({
            message: "Category created ", category
        })

    } catch (error) {
        return res.status(500).json({
            message: "operation failed ", error: error.message
        });
    }



}

export const getCategories = async (req, res) => {
    try {
        const categories = await Category
            .find({})

        return res.status(200).json({
            message: "Categories fetched successfully",
            categories
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch categories",
            error: error.message
        });
    }
};




export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        if (name) {
            const duplicate = await Category.findOne({
                name,
                _id: { $ne: id }
            });

            if (duplicate) {
                return res.status(409).json({
                    message: "Category already exists"
                });
            }

            category.name = name.trim();
        }

        
        if (description !== undefined) {
            category.description = description.trim();
        }

        if (status) {
            if (!["active", "inactive"].includes(status)) {
                return res.status(400).json({
                    message: "Invalid status"
                });
            }

            category.status = status;
        }

        await category.save();

        return res.status(200).json({
            message: "Category updated successfully",
            category
        });

    } catch (error) {
        return res.status(500).json({
            message: " Operation Failed to update category",
            error: error.message
        });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        await Category.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Category deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Operation Failed to delete category",
            error: error.message
        });
    }
};