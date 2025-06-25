const { connect } = require('getstream');
const bcrypt = require('bcrypt');
const StreamChat = require('stream-chat').StreamChat;
const crypto = require('crypto');

const generateToken = require('../utils/generateToken');

require('dotenv').config();

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;
const app_id = process.env.STREAM_APP_ID;

const signup = async (req, res) => {
    try {
        console.log("Signup request received:", req.body.username);

        const { fullName, username, password, emailAddress } = req.body;

        const userId = crypto.randomBytes(16).toString('hex');

        const chatClient = StreamChat.getInstance(api_key, api_secret);

        const token = generateToken(userId);

        const hashedPass = await bcrypt.hash(password, 10);

         // Store user in Stream:
        await chatClient.upsertUser({
            id: userId,
            name: username,
            fullName,



            hashedPass, // Store in db!!! Remove later when db is connected



            email: emailAddress,
        });

        console.log("Signup successful", { token, userId });

        // Set HttpOnly cookies:
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.cookie('userId', userId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(200).json({ 
            userId,
            username,
            fullName,
            emailAddress 
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log("Received login request:", username);
        
        const chatClient = StreamChat.getInstance(api_key, api_secret);

        const { users } = await chatClient.queryUsers({ name: username });

        if(!users.length) return res.status(400).json({ message: 'Invalid username or password.' });

        const success = await bcrypt.compare(password, users[0].hashedPass);

        const userId = users[0].id;

        const token = generateToken(userId);

        // Set HttpOnly cookies:
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.cookie('userId', userId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        if(success) {
            res.status(200).json({ 
                userId: users[0].id,
                fullName: users[0].fullName,
                username
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password.' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
};

const logout = async (req, res) => {
    res.clearCookie('token');
    res.clearCookie('userId');

    return res.status(200).json({ message: 'Logged out' });
};

const me = async (req, res) => {
    try {
        const token = req.cookies.token;
        const userId = req.cookies.userId;

        if (!token || !userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const client = StreamChat.getInstance(api_key, api_secret);

        const { users } = await client.queryUsers({ id: { $eq: userId } });

        if (!users.length) return res.status(404).json({ message: 'Invalid username or password.' });

        const user = users[0];

        return res.status(200).json({
            token,
            userId: user.id,
            username: user.name,
            fullName: user.fullName,
            avatarURL: user.image,
            emailAddress: user.email,
        });
    } catch (err) {
        console.error("User endpoint error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { signup, login, logout, me };