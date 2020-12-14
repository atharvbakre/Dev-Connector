const express = require('express')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const keys = require('../../config/keys')
const registerValidations = require('../../validation/register')
const loginValidations = require('../../validation/login')

// Load User model
const User = require('../../models/User')

const router = express.Router()

// @route   POST /api/users/register
// @desc    Register new User
// @access  Public
router.post('/register', async (req, res) => {
    const { errors, isValid } = registerValidations(req.body)

    if(!isValid) {
        return res.json(errors)
    }

    const user = await User.findOne({ email: req.body.email })
    
    if(user) {
        errors.email = 'Email already exists!'
        return res.status(400).json(errors)
    }

    const avatar = gravatar.url(req.body.email, {
        s: '200',
        r: 'pg',   
        d: 'mm'
    })

    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        avatar,
        date: req.body.date
    })

    newUser.password = await bcrypt.hash(newUser.password, 8)
    await newUser.save()
    res.json(newUser)
})

// @route   POST /api/users/login
// @desc    Login and get JWT Token
// @access  Public
router.post('/login', async (req, res) => {
    const { errors, isValid } = loginValidations(req.body)

    if(!isValid) {
        return res.json(errors)
    }

    const email = req.body.email
    const password = req.body.password

    const user = await User.findOne({ email })

    if(!user) {
        errors.email = 'Invalid Email'
        return res.status(404).json(errors)
    }

    if(await bcrypt.compare(password, user.password)) {
        // User found
        const payload = {
            id: user.id,
            name: user.name,
            avatar: user.avatar
        }
        
        // JWT Token
        const token = await jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 })
        return res.json({ 
            sucess: true, 
            token: 'Bearer ' + token 
        })
    }

    // Incorrect password
    errors.password = 'Incorrect Password' 
    res.status(400).json(errors) 
})

// @route   GET /api/users/current
// @desc    Current user
// @access  Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        id: req.user.id, 
        name: req.user.name,
        email: req.user.email
    })
})

module.exports = router