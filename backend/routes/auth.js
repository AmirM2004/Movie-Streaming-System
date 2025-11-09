const express = require("express");
const router = express.Router();
const {User , DataQueries} = require('../database/models.js');

router.post('/register', async (req, res) => { // برسی صحت ثبت نام و خود ثبت نام
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'تمام فیلدها الزامی هستند' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'رمز عبور باید حداقل 8 کاراکتر باشد' });
        }

        // Check if username exists
        const existingUser = await DataQueries.findByUsername(username);
        if (existingUser) {
            return res.status(409).json({ error: 'این نام کاربری قبلاً ثبت شده است' });
        }

        const user = new  User(username, email, password);
        const newUser = await user.save();
        
        delete newUser.password;
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => { // برسی لاگین و اجازه کاربر برای ورود
    try {
        const { username, password } = req.body;
        
        const user = await DataQueries.findByUsername(username);
        if (!user) {
            return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است' });
        }

        const validPassword = await DataQueries.validatePassword(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است' });
        }

        delete user.password;
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;