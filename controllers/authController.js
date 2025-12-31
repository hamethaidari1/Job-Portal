const { User } = require('../models');
const { sendVerificationEmail, isEmailConfigured, isResendConfigured } = require('../utils/mailer');
const crypto = require('crypto'); // Crypto modülünü ekle

/* =========================
   REGISTER
========================= */

// Kayıt formunu göster
exports.getRegister = (req, res) => {
    res.render('auth/register', {
        pageTitle: 'Register',
        errorMessage: null
    });
};

// Kayıt işlemini gerçekleştir
exports.postRegister = async (req, res) => {
    console.log('📝 Register Request Body:', req.body); // Gelen verileri logla
    const { email, role, password, confirmPassword } = req.body;

    try {
        // Basit doğrulama
        if (!email || !password) {
            throw new Error('Email and password are required.');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters.');
        }

        if (password !== confirmPassword) {
             throw new Error('Passwords do not match.');
        }

        // Kullanıcının varlığını kontrol et
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.render('auth/register', {
                pageTitle: 'Register',
                errorMessage: 'User already exists.'
            });
        }

        // Rol normalizasyonu (Çok önemli)
        let normalizedRole = 'job_seeker';
        if (role === 'Employer' || role === 'employer') {
            normalizedRole = 'employer';
        }

        // firebaseUid olarak rastgele bir ID oluştur (Backend'de Firebase devre dışı olduğu için)
        const firebaseUid = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

        // Şifreyi hashle (Basit SHA256 ile)
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        // Kullanıcıyı veritabanında oluştur
        const user = await User.create({
            email,
            role: normalizedRole,
            isVerified: false,
            firebaseUid: firebaseUid,
            password: hashedPassword
        });

        // Oturuma kaydet
        req.session.user = user;
        req.session.isLoggedIn = true;

        req.session.save(() => {
            res.redirect('/auth/verify');
        });

    } catch (error) {
        console.error('REGISTER ERROR 👉', error);
        res.render('auth/register', {
            pageTitle: 'Register',
            errorMessage: 'Database error: ' + error.message // Hata metnini göster
        });
    }
};

/* =========================
   LOGIN
========================= */

// Giriş formunu göster
exports.getLogin = (req, res) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        errorMessage: null
    });
};

// Giriş işlemini gerçekleştir
exports.postLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.render('auth/login', {
                pageTitle: 'Login',
                errorMessage: 'User not found.'
            });
        }

        // Şifreyi kontrol et
        if (password) {
             const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
             if (user.password && user.password !== hashedPassword) {
                return res.render('auth/login', {
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password.'
                });
             }
        }

        req.session.user = user;
        req.session.isLoggedIn = true;

        req.session.save(() => {
            res.redirect('/');
        });

    } catch (error) {
        console.error('LOGIN ERROR 👉', error);
        res.render('auth/login', {
            pageTitle: 'Login',
            errorMessage: 'Server error.'
        });
    }
};

/* =========================
   GOOGLE AUTH
========================= */

// Google ile giriş/kayıt işlemini gerçekleştir
exports.postGoogleAuth = async (req, res) => {
    console.log('🔵 Google Auth Request:', req.body);
    try {
        const { email, firebaseUid, firstName, lastName } = req.body;

        if (!email || !firebaseUid) {
            return res.status(400).json({ error: 'Email and Firebase UID are required.' });
        }

        // Kullanıcıyı bul veya oluştur
        let user = await User.findOne({ where: { email } });

        if (!user) {
            // Yeni kullanıcı oluştur
            user = await User.create({
                email,
                role: 'job_seeker', // Varsayılan rol
                isVerified: true, // Google ile geldiği için doğrulanmış sayalım
                firebaseUid: firebaseUid,
                password: null // Şifre yok
            });
            
            // Profil oluştur (İsteğe bağlı)
            try {
                const Profile = require('../models/Profile'); // Lazy load
                await Profile.create({
                    userId: user.id,
                    firstName: firstName || '',
                    lastName: lastName || ''
                });
            } catch (err) {
                console.error("Profile creation error:", err);
            }
        } else {
            // Mevcut kullanıcı ise firebaseUid güncelle (gerekirse)
            if (user.firebaseUid !== firebaseUid) {
                await user.update({ firebaseUid: firebaseUid });
            }
        }

        // Oturuma kaydet
        req.session.user = user;
        req.session.isLoggedIn = true;

        req.session.save(() => {
            return res.status(200).json({ success: true, redirect: '/profile' });
        });

    } catch (error) {
        console.error('GOOGLE AUTH ERROR 👉', error);
        return res.status(500).json({ error: 'Server error: ' + error.message });
    }
};

/* =========================
   LOGOUT
========================= */

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};

/* =========================
   VERIFY EMAIL
========================= */

// Doğrulama sayfasını göster
exports.getVerify = (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    res.render('auth/verify', {
        pageTitle: 'Verify Account',
        email: req.session.user.email,
        sent: false,
        errorMessage: null
    });
};

// Doğrulama kodunu gönder
exports.sendVerifyCode = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    try {
        const user = await User.findByPk(req.session.user.id);
        if (!user) {
            return res.redirect('/auth/login');
        }

        const code = String(Math.floor(100000 + Math.random() * 900000));
        const expires = new Date(Date.now() + 10 * 60 * 1000);

        await user.update({
            verificationCode: code,
            verificationExpires: expires
        });

        console.log('🔐 VERIFICATION CODE:', code); // Hata ayıklama için kodu logla
        let errorMessage = null;
        let successMessage = null;
        if (isEmailConfigured() || isResendConfigured()) {
            try {
                await sendVerificationEmail(user.email, code);
                successMessage = 'Verification code sent to your email.';
            } catch (err) {
                console.error('❌ Email Send Failed:', err);
                errorMessage = 'Email sending failed (Check Console): ' + err.message;
            }
        } else {
            const showCode = String(process.env.SMTP_DEBUG_SHOW_CODE || '').toLowerCase() === 'true';
            successMessage = showCode ? `Verification code: ${code}` : 'Email service not configured. Please set SMTP variables.';
        }

        res.render('auth/verify', {
            pageTitle: 'Verify Account',
            email: user.email,
            sent: true,
            errorMessage,
            successMessage
        });

    } catch (error) {
        console.error('SEND VERIFY CODE ERROR 👉', error);
        res.render('auth/verify', {
            pageTitle: 'Verify Account',
            email: req.session.user.email,
            sent: false,
            errorMessage: 'Email Error: ' + error.message // Kullanıcıya detaylı hatayı göster
        });
    }
};

// Kodu doğrula
exports.confirmVerifyCode = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    try {
        const { code } = req.body;
        const user = await User.findByPk(req.session.user.id);

        if (!user || !user.verificationCode || !user.verificationExpires) {
            return res.render('auth/verify', {
                pageTitle: 'Verify Account',
                email: req.session.user.email,
                sent: true,
                errorMessage: 'No verification code found.'
            });
        }

        if (new Date(user.verificationExpires).getTime() < Date.now()) {
            return res.render('auth/verify', {
                pageTitle: 'Verify Account',
                email: req.session.user.email,
                sent: true,
                errorMessage: 'Verification code expired.'
            });
        }

        if (String(code) !== String(user.verificationCode)) {
            return res.render('auth/verify', {
                pageTitle: 'Verify Account',
                email: req.session.user.email,
                sent: true,
                errorMessage: 'Invalid verification code.'
            });
        }

        await user.update({
            isVerified: true,
            verificationCode: null,
            verificationExpires: null
        });

        req.session.user = user;

        req.session.save(() => {
            res.redirect('/profile');
        });

    } catch (error) {
        console.error('CONFIRM VERIFY ERROR 👉', error);
        res.render('auth/verify', {
            pageTitle: 'Verify Account',
            email: req.session.user.email,
            sent: true,
            errorMessage: 'Verification failed.'
        });
    }
};
