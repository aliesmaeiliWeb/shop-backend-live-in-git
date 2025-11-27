import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // for 15min
    max: 10, // 10 request just for one ip
    standardHeaders: true, // limit data return in the headers
    legacyHeaders: false, 
    message: {
        status: 'error',
        statusCode: 429,
        message: "تعداد تلاش‌های شما برای ورود یا ثبت‌نام بیش از حد مجاز است. لطفاً بعد از ۱۵ دقیقه دوباره امتحان کنید"
    }
})