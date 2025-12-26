const { User } = require('../models');

exports.register = async (req, res) => {
    const { email, uid, role } = req.body;

    try {
        // 6 Haneli Rastgele Kod Üret
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Kullanıcıyı veritabanına kaydet
        const newUser = await User.create({
            email,
            firebaseUid: uid,
            role,
            verificationCode,
            isVerified: false
        });

        // Simüle edilmiş email gönderimi (Konsola yazdır)
        console.log(`=========================================`);
        console.log(`📧 E-POSTA GÖNDERİLDİ: ${email}`);
        console.log(`🔑 DOĞRULAMA KODU: ${verificationCode}`);
        console.log(`=========================================`);

        // Session başlat
        req.session.user = newUser;
        res.json({ status: 'success', redirect: '/auth/verify' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Kayıt hatası' });
    }
};

exports.verifyCode = async (req, res) => {
    const { code } = req.body;
    const userId = req.session.user.id;

    const user = await User.findByPk(userId);

    if (user.verificationCode === code) {
        user.isVerified = true;
        user.verificationCode = null; // Kodu temizle
        await user.save();
        res.json({ status: 'success', redirect: '/' });
    } else {
        res.json({ status: 'error', message: 'Hatalı Kod!' });
    }
};