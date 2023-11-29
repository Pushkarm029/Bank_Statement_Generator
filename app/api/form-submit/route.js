import csv from "csv-parser";
import fs from "fs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function POST(req) {
  const data = await req.json();
  const { start_date, end_date, email } = data;
  const csvData = [];
  const nodemailer = require("nodemailer");
  // service: "gmail",
  // host: "smtp.gmail.com",
  // port: 587,
  // secure: false,
  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.in",
    port: 465,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL,
    to: ["pushkarmishra029@gmail.com"],
    subject: "Bank Statement",
    text: "Bank Statement",
    attachments: [
      {
        filename: `${data.email}.pdf`,
        path: `${data.email}.pdf`,
      },
    ],
  };
  fs.createReadStream("./database/data.csv")
    .pipe(csv())
    .on("data", (row) => csvData.push(row))
    .on("end", async () => {
      const filteredTransactions = csvData.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        return (
          transactionDate >= startDate &&
          transactionDate <= endDate &&
          transaction.email === email
        );
      });

      //   generating PDF
      const pdfDoc = await PDFDocument.create();
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      console.log(width);
      const fontSize = 30;
      page.drawText("Bank Statement", {
        x: 50,
        y: height - 70,
        size: 30,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });
      page.drawText(`From ${start_date} to ${end_date}`, {
        x: 50,
        y: height - 100,
        size: 20,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });
      page.drawText(`${email}`, {
        x: 50,
        y: height - 130,
        size: 20,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });
      page.drawText(`Date`, {
        x: 50,
        y: height - 160,
        size: 20,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });
      page.drawText(`Amount`, {
        x: 190,
        y: height - 160,
        size: 20,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });
      page.drawText(`Description`, {
        x: 330,
        y: height - 160,
        size: 20,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });
      let yOffset = page.getHeight() - 190;
      for (const transaction of filteredTransactions) {
        page.drawText(`${transaction.date}`, {
          x: 50,
          y: yOffset,
          size: 15,
          font: timesRomanFont,
          color: rgb(0, 0, 0),
        });
        page.drawText(`${transaction.amount}`, {
          x: 190,
          y: yOffset,
          size: 15,
          font: timesRomanFont,
          color: rgb(0, 0, 0),
        });
        page.drawText(`${transaction.message}`, {
          x: 330,
          y: yOffset,
          size: 15,
          font: timesRomanFont,
          color: rgb(0, 0, 0),
        });
        yOffset -= 25;
      }
      const pdfBytes = await pdfDoc.save();
      const pdfPath = `${email}.pdf`;
      const pdfStream = fs.createWriteStream(pdfPath);
      pdfStream.write(pdfBytes);
      pdfStream.end();

      console.log("Bank statement PDF created successfully");

      //sending email
    });
    const sendEmail = async (transporter,mailOptions) => {
      try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
      } catch (error) {
        return new Response({ error: error});
      }
    }

    sendEmail(transporter,mailOptions);
  return new Response({ message: "Transaction history sent successfully" });
}
