require("dotenv").config();

const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
  host: "smtp.mail.yahoo.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.YAHOO_USER,
    pass: process.env.YAHOO_APP_PASSWORD
  }
});

transporter.verify((error) => {
  if (error) {
    console.log("SMTP ERROR:", error.message);
  } else {
    console.log("SMTP READY");
  }
});

app.get("/", (req, res) => {
  console.log("GET /");
  res.render("index");
});

app.get("/quote", (req, res) => {
  console.log("GET /quote");
  res.render("quote", { success: null });
});

app.post("/quote", async (req, res) => {
  console.log("POST /quote", req.body);

  const { businessName, email, phone, productInterest, notes, company } = req.body;
  const phoneRegex = /^[0-9]+$/;

  if (company) {
    return res.render("quote", { success: false });
  }

  if (!businessName || !email || !phone || !phoneRegex.test(phone)) {
    return res.render("quote", { success: false });
  }

  try {
    const businessInfo = await transporter.sendMail({
      from: `"Lawrence Pallet Website" <${process.env.YAHOO_USER}>`,
      to: "lawrencepallets@verizon.net",
      subject: "New Pallet Quote Request",
      text: `
New Quote Request

Business Name: ${businessName}
Email: ${email}
Phone: ${phone}

Product Interest:
${productInterest || "N/A"}

Notes:
${notes || "N/A"}
      `
    });

    console.log("BUSINESS EMAIL SENT:", businessInfo.response);

    try {
      const customerInfo = await transporter.sendMail({
        from: `"Lawrence Pallet" <${process.env.YAHOO_USER}>`,
        to: email,
        subject: "We received your quote request",
        text: `
Hello ${businessName},

Thank you for contacting Lawrence Pallet.

We received your quote request and will respond shortly.

Phone: 201-330-3222

Best regards,
Lawrence Pallet
        `
      });

      console.log("CUSTOMER EMAIL SENT:", customerInfo.response);
    } catch (customerError) {
      console.log("CUSTOMER EMAIL FAILED:", customerError.message);
    }

    return res.render("quote", { success: true });
  } catch (error) {
    console.log("BUSINESS EMAIL FAILED:", error.message);
    console.log("CODE:", error.code);
    console.log("RESPONSE:", error.response);
    return res.render("quote", { success: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});