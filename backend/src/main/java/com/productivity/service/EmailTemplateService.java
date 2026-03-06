package com.productivity.service;

import org.springframework.stereotype.Service;

@Service
public class EmailTemplateService {

    public String getOtpTemplate(String otp) {
        return "<!DOCTYPE html>\n" +
               "<html lang=\"en\">\n" +
               "<head>\n" +
               "    <meta charset=\"UTF-8\">\n" +
               "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
               "    <title>Your Verification Code</title>\n" +
               "</head>\n" +
               "<body style=\"margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f9; color: #333;\">\n" +
               "    <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\">\n" +
               "        <tr>\n" +
               "            <td align=\"center\" style=\"padding: 40px 0;\">\n" +
               "                <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"400\" style=\"background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden;\">\n" +
               "                    <!-- Header -->\n" +
               "                    <tr>\n" +
               "                        <td align=\"center\" style=\"background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 30px 20px;\">\n" +
               "                            <h1 style=\"margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;\">Productiv</h1>\n" +
               "                        </td>\n" +
               "                    </tr>\n" +
               "                    <!-- Content -->\n" +
               "                    <tr>\n" +
               "                        <td style=\"padding: 40px 30px;\">\n" +
               "                            <h2 style=\"margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600;\">Verify your email</h2>\n" +
               "                            <p style=\"margin: 0 0 30px 0; color: #4b5563; line-height: 1.6; font-size: 16px;\">\n" +
               "                                Thanks for choosing Productiv! Use the following code to complete your verification process. This code will expire in 5 minutes.\n" +
               "                            </p>\n" +
               "                            \n" +
               "                            <div style=\"text-align: center; margin-bottom: 30px;\">\n" +
               "                                <div style=\"display: inline-block; background-color: #f3f4f6; padding: 16px 32px; border-radius: 8px; border: 1px solid #e5e7eb;\">\n" +
               "                                    <span style=\"font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; color: #111827; letter-spacing: 8px; margin-left: 8px;\">" + otp + "</span>\n" +
               "                                </div>\n" +
               "                            </div>\n" +
               "                            \n" +
               "                            <p style=\"margin: 0; color: #9ca3af; font-size: 14px; text-align: center;\">\n" +
               "                                If you didn't request this code, you can safely ignore this email.\n" +
               "                            </p>\n" +
               "                        </td>\n" +
               "                    </tr>\n" +
               "                    <!-- Footer -->\n" +
               "                    <tr>\n" +
               "                        <td style=\"padding: 20px 30px; background-color: #f9fafb; text-align: center;\">\n" +
               "                            <p style=\"margin: 0; color: #9ca3af; font-size: 12px;\">\n" +
               "                                &copy; 2024 Productiv App. All rights reserved.\n" +
               "                            </p>\n" +
               "                        </td>\n" +
               "                    </tr>\n" +
               "                </table>\n" +
               "            </td>\n" +
               "        </tr>\n" +
               "    </table>\n" +
               "</body>\n" +
               "</html>";
    }
}
