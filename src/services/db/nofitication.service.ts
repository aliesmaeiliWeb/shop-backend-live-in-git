import Kavenegar = require("kavenegar");
import { Order } from "@prisma/client";

const kavenegarApi = Kavenegar.KavenegarApi({
  apikey: process.env.KAVENEGAR_API_KEY!,
});

type NotificationMode = "send" | "verify"; // حالت ارسال پیامک: Send یا VerifyLookup

interface NotificationOptions {
  mode?: NotificationMode;        // حالت پیش‌فرض "send"
  templateName?: string;          // نام قالب برای VerifyLookup
  senderNumber?: string;          // شماره فرستنده اختیاری
}

class NotificationService {
  private mode: NotificationMode;
  private templateName?: string;
  private senderNumber?: string;

  constructor(options?: NotificationOptions) {
    this.mode = options?.mode ?? "send";
    this.templateName = options?.templateName;
    this.senderNumber = options?.senderNumber;
  }

  public async sendOrderConfirmationSms(order: Order, userPhoneNumber: string) {
    console.log(`در حال آماده‌سازی برای ارسال پیامک به شماره: ${userPhoneNumber}`);

    if (this.mode === "send") {
      // حالت تست سریع با متن مستقیم
      kavenegarApi.Send(
        {
          message: `پیامک تایید سفارش (تست) با شماره سفارش: ${order.id}`,
          sender: this.senderNumber,
          receptor: userPhoneNumber,
        },
        (response: any, status: number) => {
          if (status === 200) {
            console.log(`پیامک تست سفارش ${order.id} با موفقیت ارسال شد.`);
          } else {
            console.error(`خطا در ارسال پیامک تست برای سفارش ${order.id}:`, response, status);
          }
        }
      );
    } else if (this.mode === "verify") {
      // حالت واقعی با Template
      if (!this.templateName) {
        throw new Error("Template name must be provided for verify mode");
      }

      kavenegarApi.VerifyLookup(
        {
          receptor: userPhoneNumber,
          template: this.templateName,
          token: order.id.toString(),
        },
        (response: any, status: number) => {
          if (status === 200) {
            console.log(`پیامک تایید سفارش ${order.id} با موفقیت ارسال شد.`);
          } else {
            console.error(
              `خطا در ارسال پیامک برای سفارش ${order.id}:`,
              response,
              `کد وضعیت: ${status}`
            );
          }
        }
      );
    }
  }
}

// نمونه استفاده در حالت تست
export const notificationService = new NotificationService({
  mode: "send", // برای تست سریع با Send
  senderNumber: "2000660110", // اختیاری
});

// وقتی کارفرما آمد، به راحتی می‌توانی mode را به "verify" تغییر دهی و templateName بدهی:
// new NotificationService({ mode: "verify", templateName: "orderConfirmation" });
