import axios from "axios";

class SmsHelper {
  private apiKey: string;
  private templateId: number;

  constructor() {
    this.apiKey = process.env.SMS_API_KEY || "";
    this.templateId = parseInt(process.env.SMS_TEMPLATE_ID || "0");
  }

  public async sendOTP(mobile: string, code: string) {
    try {
      const url = "https://api.sms.ir/v1/send/verify";

      const data = {
        mobile: mobile,
        templateId: this.templateId,
        parameters: [
          {
            name: "Code", // باید دقیقا با نام متغیر در قالب پنل یکی باشه (معمولا Code یا code)
            value: code,
          },
        ],
      };

      const response = await axios.post(url, data, {
        headers: {
          "x-api-key": this.apiKey,
          "Content-Type": "application/json",
          Accept: "text/plain",
        },
      });

      console.log("✅ SMS Sent Successfully:", response.data);
      return true;
    } catch (error: any) {
      console.error(
        "❌ SMS Sending Failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }
}

export const smsHelper: SmsHelper = new SmsHelper();
