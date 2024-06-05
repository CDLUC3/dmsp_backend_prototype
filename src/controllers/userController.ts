const User = require('../userModel/User').default;
const jwt = require('jsonwebtoken');

const tokenLasts = '1d';
const secret = Buffer.from('Zn8Q5tyZ/G1MHltc4F/gTkVJMlrbKiZt', 'base64');

exports.apiLogin = async (req, res) => {
    let user = new User(req.body);

    try {
        const rows = await user.login();

        if (rows) {
            const token = jwt.sign({ email: req.body.email }, secret, { expiresIn: tokenLasts });
            res.json({ success: true, token });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.log('Login error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


exports.apiRegister = async (req, res) => {
    let user = new User(req.body);

    try {
        const result = await user.register();
        if (result) {
            const token = jwt.sign({ email: req.body.email }, secret, { expiresIn: tokenLasts });
            res.json({ success: true, token })
        }
    } catch (err) {
        console.log('Signup error:', err)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }

};