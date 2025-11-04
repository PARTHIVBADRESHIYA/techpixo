import express from 'express';
import {
    createBlog,
    getBlogById,
    getAllBlogs,
    getBlogCategories,
    getBlogBySlug,
    updateBlog
} from '../controllers/blogController.js';

import {verifyAdmin} from '../middlewares/authMiddleware.js';

import { uploadBlogImage } from '../utils/upload.js';

// Setup multer for image upload

const router = express.Router();

router.post('/', verifyAdmin,uploadBlogImage.single('image'), createBlog);  
router.put('/:id',verifyAdmin, uploadBlogImage.single('image'), updateBlog);     
router.get('/:id', getBlogById);                             // Blog Details
router.get('/', getAllBlogs);                                // Blog List
router.get('/utils/categories', getBlogCategories);
// routes/blogRoutes.js
router.get('/slug/:slug', getBlogBySlug); // 👈 Route using slug

export default router;
