const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const profileValidations = require('../../validation/profile')
const experienceValidations = require('../../validation/experience')
const educationValidations = require('../../validation/education')

// Load User model
const User = require('../../models/User')

// Load Profile model
const Profile = require('../../models/Profile')

const router = express.Router()

// @route   GET /api/profile
// @desc    Get current users profile
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const errors = {}
    const profile = await (await Profile.findOne({ user: req.user.id }) 
                    .populate('user', ['name', 'avatar']))
                    .execPopulate()
                        
    if(!profile) {
        errors.noprofile = 'Profile not available for the User'
        return res.status(404).json(errors)
    }

    res.json(profile)
})

// @route   GET /api/profile/all
// @desc    Get all profiles
// @access  Public
router.get('/all', async (req, res) => {
    const errors = {}
    const profiles = await Profile.find()

    if(!profiles) {
        errors.profile = 'No profiles available'
        return res.status(404).json(errors)
    }

    res.json(profiles)
})

// @route   GET /api/profile/handle/:handle
// @desc    Get user by handle
// @access  Public
router.get('/handle/:handle', async (req, res) => {
    const errors = {}
    const profile = await (await Profile.findOne({ handle: req.params.handle })
                    .populate('user', ['name', 'avatar']))
                    .execPopulate()

    if(!profile) {
        errors.handle = 'Handle not found'
        return res.status(404).json(errors)
    }

    res.json(profile)
})

// @route   GET /api/profile/id/:id
// @desc    Get user by ID
// @access  Public
router.get('/id/:id', async (req, res) => {
    const errors = {}
    const profile = await (await Profile.findOne({ user: req.params.id })
                    .populate('user', ['name', 'avatar']))
                    .execPopulate()

    if(!profile) {
        errors.id = 'Id not found'
        return res.status(404).json(errors)
    }

    res.json(profile)
})

// @route   POST /api/profile
// @desc    Create or Edit current user profile
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    
    const{ errors, isValid } = profileValidations(req.body)

    if(!isValid) {
        return res.status(400).json(errors)
    }
    
    const profileFields = {}
    profileFields.user = req.user.id
    
    if(req.body.handle) profileFields.handle = req.body.handle
    if(req.body.company) profileFields.company = req.body.company
    if(req.body.website) profileFields.website = req.body.website
    if(req.body.location) profileFields.location = req.body.location
    if(req.body.status) profileFields.status = req.body.status
    if(req.body.bio) profileFields.bio = req.body.bio
    if(req.body.githubusername) profileFields.githubusername = req.body.githubusername
    
    // Array of skills
    if(typeof req.body.skills !== 'undefined') profileFields.skills = req.body.skills.split(',')
    
    // Social
    profileFields.social = {}
    if(req.body.youtube) profileFields.social.youtube = req.body.youtube
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook
    
    const profile = await Profile.findOne({ user: req.user.id })
    if(profile) {
        // Update
        const updatedProfile = await Profile.findOneAndUpdate(
        { user: req.user.id }, 
        { $set: profileFields }, 
        { new: true })
        
        return res.json(updatedProfile)
    }

    // Create
    // Check if handle is available or not
    const handle = await Profile.findOne({ handle: profileFields.handle })
    if(handle) {
        errors.handle = 'Handle in use'
        return res.status(400).json(errors)
    }

    // If handle is not present save the profile
    const newProfile = new Profile(profileFields)
    await newProfile.save()
    res.json(newProfile)
})

// @route   POST /api/profile/experience
// @desc    Create or Edit current user experience
// @access  Private
router.post('/experience', passport.authenticate('jwt', { session: false }), async (req, res) => {
    
    const { errors, isValid } = experienceValidations(req.body)

    if(!isValid) {
        return res.status(400).json(errors)
    }

    const profile = await Profile.findOne({ user: req.user.id })

    if(!profile) {
        errors.noprofile = 'Profile not found'
        return res.status(404).json(errors)
    }

    const newExperience = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
    }

    profile.experience.unshift(newExperience)
    await profile.save()
    res.json(profile)
})

// @route   POST /api/profile/education
// @desc    Create or Edit current user education
// @access  Private
router.post('/education', passport.authenticate('jwt', { session: false }), async (req, res) => {

    const { errors, isValid } = educationValidations(req.body)

    if(!isValid) {
        return res.status(400).json(errors)
    }

    const profile = await Profile.findOne({ user: req.user.id })

    if(!profile) {
        errors.noprofile = 'Profile not found'
        return res.status(404).json(errors)
    }

    const newEducation = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
    }

    profile.education.unshift(newEducation)
    await profile.save()
    res.json(profile)
})

// @route   DELETE /api/profile/experience/:id
// @desc    Delete experience
// @access  Private
router.delete('/experience/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const errors = {}
    const profile = await Profile.findOne({ user: req.user.id })

    if(!profile) {
        errors.noprofile = 'Profile not found'
        return res.status(404).json(errors)
    }

    const removeIndex = profile.experience
                        .map(item => item.id)
                        .indexOf(req.params.id)

    profile.experience.splice(removeIndex, 1)
    await profile.save()
    res.json(profile)
})

// @route   DELETE /api/profile/education/:id
// @desc    Delete education
// @access  Private
router.delete('/education/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const errors = {}
    const profile = await Profile.findOne({ user: req.user.id })

    if(!profile) {
        errors.noprofile = 'Profile not found'
        return res.status(404).json(errors)
    }

    const removeIndex = profile.education
                        .map(item => item.id)
                        .indexOf(req.params.id)

    profile.education.splice(removeIndex, 1)
    await profile.save()
    res.json(profile)
})

// @route   DELETE /api/profile
// @desc    Delete user and profile
// @access  Private
router.delete('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    
    await Profile.findOneAndRemove({ user: req.user.id})
    await User.findOneAndRemove({ _id: req.user.id })

    res.json({ success: true })
})

module.exports = router