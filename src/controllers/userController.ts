import jwt from 'jsonwebtoken';
import User from '../models/User';

// TODO: Make these configurable and pass in as ENV variable
const tokenLasts: string = '1d';
const secret: string = process.env.JWTSECRET;

export async function signIn(req, res) {
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


export async function signUp(req, res) {
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