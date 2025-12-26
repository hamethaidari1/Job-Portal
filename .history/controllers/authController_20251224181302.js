const { User } = require('../models');

// REGISTER
exports.register = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.send('<script>alert("Email already exists!"); window.location.href="/auth/register";</script>');
        }

        await User.create({ email, password, role: role || 'seeker' });
        res.redirect('/auth/login');
    } catch (error) {
        console.error(error);
        res.status(500).send("Registration Error");
    }
};

// LOGIN (This is the function you were missing!)
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });

        if (!user || user.password !== password) {
            return res.send('<script>alert("Invalid email or password!"); window.location.href="/auth/login";</script>');
        }

        req.session.user = { id: user.id, email: user.email, role: user.role };
        
        req.session.save(() => {
            res.redirect('/');
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Login Error");
    }
};

// LOGOUT
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

// VERIFY CODE (Placeholder to prevent crashes if routes call it)
exports.verifyCode = (req, res) => {
    res.redirect('/');
};