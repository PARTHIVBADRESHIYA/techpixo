import Blog from '../model/Blog.js';
import moment from 'moment';

// ✅ Create Blog
export const createBlog = async (req, res) => {
    try {
        const { title, description, category } = req.body;
        const image = req.file?.path || "";

        const blog = await Blog.create({ title, description, category, image });
        res.status(201).json({ message: "Blog created successfully", blog });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Failed to create blog", error: error.message });
    }
};

// ✅ Update Blog (with Cloudinary image handling)
export const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, removeImage } = req.body;

        const blog = await Blog.findById(id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        // ✅ If new image uploaded
        if (req.file) {
            // delete old image from Cloudinary (if exists)
            if (blog.image) {
                const publicId = blog.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(`blogs/${publicId}`);
            }
            blog.image = req.file.path;
        }

        // ✅ Remove image manually
        if (removeImage === "true" && blog.image) {
            const publicId = blog.image.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`blogs/${publicId}`);
            blog.image = "";
        }

        // ✅ Update fields
        if (title) blog.title = title;
        if (description) blog.description = description;
        if (category) blog.category = category;

        await blog.save();

        res.status(200).json({ message: "Blog updated successfully", blog });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Failed to update blog", error: error.message });
    }
};
// Get Blog Details
export const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch blog details', error: error.message });
    }
};


export const getAllBlogs = async (req, res) => {
    try {
        const { category, limit, sortBy } = req.query;
        const query = category ? { category } : {};

        // Sorting Logic
        let sortOption = { createdAt: -1 }; // Default: Most Recent
        if (sortBy === 'title') sortOption = { title: 1 };              // A–Z
        else if (sortBy === 'oldest') sortOption = { createdAt: 1 };    // Oldest First

        const blogs = await Blog.find(query)
            .sort(sortOption)
            .limit(limit ? parseInt(limit) : 0);

        const formatted = blogs.map(blog => ({
            id: blog._id,
            title: blog.title,
            slug: blog.slug,
            image: blog.image,
            category: blog.category,
            createdAt: blog.createdAt,
            postedAgo: moment(blog.createdAt).fromNow()
        }));

        res.status(200).json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch blogs', error: error.message });
    }
};


// controllers/blogController.js

export const getBlogCategories = async (req, res) => {
    try {
        const categories = await Blog.distinct('category'); // get unique categories
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
    }
};

// controllers/blogController.js

export const getBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug });
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch blog', error: error.message });
    }
};
