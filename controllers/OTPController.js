const Otp=require("../models/OTPModel")
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");


exports.sendOtpController = async (req, res) => {
    try {
        const { email } = req.body;

        // Generate OTP (digits only)
        const otp = otpGenerator.generate(6, { 
            digits: true, 
            lowerCaseAlphabets: false, 
            upperCaseAlphabets: false, 
            specialChars: false 
        });

        await Otp.create({ email, otp });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,  
                pass: process.env.EMAIL_PASS,  
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your Triivana OTP Code for Verification",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                    <h2 style="color: #007bff;"> Your One-Time Password (OTP)</h2>
                    <p style="font-size: 16px; color: #333;">Hello,</p>
                    <p style="font-size: 16px; color: #333;">
                        Use the following OTP to verify your account. This code is valid for <strong>5 minutes</strong>:
                    </p>
                    <div style="font-size: 22px; font-weight: bold; color: #28a745; padding: 10px; border: 2px dashed #28a745; display: inline-block; margin: 10px 0;">
                        ${otp}
                    </div>
                    <p style="font-size: 16px; color: #555;">If you didn’t request this, please ignore this email.</p>
                    <p style="font-size: 16px; color: #555;">Stay secure!</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="font-size: 14px; color: #999;">This is an automated message. Please do not reply.</p>
                </div>
            `,
        };
        

        await transporter.sendMail(mailOptions);
        console.log("OTP sent successfully");

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
