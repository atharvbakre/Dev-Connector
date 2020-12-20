const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const passport = require('passport')

// Validations
const postsValidations = require('../../validation/posts')

// Load Post model
const Post = require('../../models/Post')

// @route   POST /api/posts/
// @desc    Create posts
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const {errors, isValid } = postsValidations(req.body)

    if(!isValid) {
        return res.status(400).json(errors)
    }

    const newPost = new Post({
        user: req.user.id,
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar
    })

    await newPost.save()
    res.json(newPost)
})

// @route   POST /api/posts/comment/:id
// @desc    Comment to a post
// @access  Private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const {errors, isValid } = postsValidations(req.body)

    if(!isValid) {
        return res.status(400).json(errors)
    }

    const post = await Post.findById(req.params.id)

    if(!post) {
        errors.post = 'Post not found'
        return res.status(404).json(errors)
    }

    const newComment = {
        user: req.user.id,
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar
    }

    post.comments.unshift(newComment)
    await post.save()
    res.json(post)
})

// @route   POST /api/posts/like/:id
// @desc    Like post
// @access  Private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const errors = {}
    const post = await Post.findById(req.params.id)

    if(!post) {
        errors.post = 'Post not found'
        return res.status(404).json(errors)
    }

    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
        errors.like = 'User already liked this post'
        return res.status(400).json(errors)    
    }

    post.likes.unshift({ user: req.user.id })
    await post.save()
    res.json(post)
})

// @route   POST /api/posts/unlike/:id
// @desc    Remove post like
// @access  Private
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const errors = {}
    const post = await Post.findById(req.params.id)

    if(!post) {
        errors.post = 'Post not found'
        return res.status(404).json(errors)
    }

    const removeIndex = post.likes.map(like => like.user).indexOf(req.user.id)
    if(removeIndex === -1) {
        errors.unlike = 'User never gave a like to this post'
        return res.status(400).json(errors)
    }

    post.likes.splice(removeIndex, 1)
    await post.save()
    res.json(post)
})

// @route   GET /api/posts/
// @desc    Get all posts
// @access  Public
router.get('/', async (req, res) => {
    const errors = {}
    const posts = await Post.find().sort({ date: -1}).exec()

    if(!posts) {
        errors.posts = 'No posts available'
        return res.status(404).json(errors)
    }
    
    res.json(posts)
})

// @route   GET /api/posts/:id
// @desc    Get post by ID
// @access  Public
router.get('/:id', async (req, res) => {
    const errors = {}
    const post = await Post.findById(req.params.id)

    if(!post) {
        errors.post = 'Post not found with that ID'
        return res.status(404).json(errors)
    }

    res.json(post)
})

// @route   DELETE /api/posts/:id
// @desc    Delete post by ID
// @access  Private
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const errors = {}
    const post = await Post.findById(req.params.id)

    if(!post) {
        errors.post = 'Post not found'
        return res.status(404).json(errors)
    }
 
    if(post.user.toString() !== req.user.id) {
        errors.authorization = 'Unauthorized'
        return res.status(401).json(errors)
    }

    await post.remove()
    res.json({ success: true })
})

// @route   DELETE /api/posts/uncomment/:id/:comment_id
// @desc    Remove comment from a post
// @access  Private
router.delete('/uncomment/:id/:comment_id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const errors = {}
    const post = await Post.findById(req.params.id)

    if(!post) {
        errors.post = 'Post not found'
        return res.status(404).json(errors)
    }

    const removeIndex = post.comments.map(comment => comment._id).indexOf(req.params.comment_id)
    if(removeIndex === -1) {
        errors.uncomment = 'Comment does not exist'
        return res.status(400).json(errors)
    }

    post.comments.splice(removeIndex, 1)
    await post.save()
    res.json(post)
})

module.exports = router