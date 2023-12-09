import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import qrImage from 'qr-image';
import fs from 'fs';
import { createCanvas, registerFont, loadImage } from 'canvas';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the absolute path to the Adelle font file
const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilePath);
const fontPath = join(currentDir, '../Font/NotoSansDevanagari-Light.ttf');
const logoPath = join(currentDir, '../Images/iiitm-logo.png');
const tempphoto = join(currentDir, '../Images/Profile.png');

// Register the OTF font
registerFont(fontPath, { family: 'NotoSansDevanagari-Light' });

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'v0e0r0i0f0i0c0a0t0i0on@gmail.com',
    pass: 'pxbc ayay gnhr bwbv ',
  },
});

router.post('/generateidcard', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate QR code
    const qrCode = generateQRCode(user);

    // Create ID card
    const idCardPath = await generateIDCard(user, qrCode);

    // Send the ID card via email
    const mailOptions = {
      to: user.email,
      from: 'v0e0r0i0f0i0c0a0t0i0on@gmail.com',
      subject: 'Your ID Card',
      text: 'Please find your ID card attached.',
      attachments: [
        {
          filename: 'id_card.png',
          path: idCardPath,
          cid: 'id_card',
        },
      ],
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Email send error:', err);
        return res.status(500).json({ error: 'Email could not be sent' });
      }

      fs.unlinkSync(qrCode);
      fs.unlinkSync(idCardPath);

      res.status(200).json({ message: 'ID card sent successfully' });
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'ID card generation and email sending failed' });
  }
});

const generateQRCode = (user) => {
  const formattedDob = user.dob.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const userData = JSON.stringify({
    Id: user._id,
    userFullName: user.userFullName,
    user_Id: user.userType === 'Student' ? user.admissionId : user.employeeId,
    DOB: formattedDob,
    email: user.email,
  });

  // Generate a QR code image in PNG format
  const qrCode = qrImage.imageSync(userData, { type: 'png' });

  // Save the QR code image temporarily
  const qrCodePath = 'temp_qr_code.png';
  fs.writeFileSync(qrCodePath, qrCode);

  return qrCodePath;
};

// Function to generate ID card with text
const generateIDCard = async (user, qrCodePath) => {
  try {
    const canvas = createCanvas(600, 400);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 0, 0, canvas.width, canvas.height, 5, true);

    ctx.font = '20px Arial, "NotoSansDevanagari-Light", "Segoe UI", sans-serif';
    ctx.textEncoding = 'utf-8';
    ctx.fillStyle = '#000000';
    
    ctx.fillText(
      '\u092D\u093E\u0930\u0924\u0940\u092F \u0938\u0942\u091A\u0928\u093E ' +
      '\u092A\u094D\u0930\u094B\u0926\u094D\u092F\u094B\u0917\u093F\u0915\u0940 ' +
      '\u0938\u0902\u0938\u094D\u0925\u093E\u0928 \u0938\u0947\u0928\u093E\u092A\u0924\u093F, ' +
      '\u092E\u0923\u093F\u092A\u0941\u0930',
      20,
      30
    );    

    ctx.fillText(
      'Indian Institute of Information Technology\nSenapati, Manipur',
      20,
      60
    );  

    // Draw rounded border box
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    roundRect(ctx, 10, 90, canvas.width - 20, canvas.height - 97, 5, false);

    // Set font properties
    ctx.font = '20px Adelle';
    ctx.fillStyle = '#000000';

    const formattedDob = user.dob.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    ctx.fillText(
      `${user.userType === 'Student' ? 'Student ID: ' : 'Employment ID: '} ${
        user.userType === 'Student' ? user.admissionId : user.employeeId
      }`,
      20,
      280
    );
    ctx.fillText(`Name: ${user.userFullName}`, 20, 310);
    ctx.fillText(`Date of Birth: ${formattedDob}`, 20, 340);
    ctx.fillText(`Designation: ${user.userType}`, 20, 370);

    const qrCodeImage = await loadImage(qrCodePath);
    ctx.drawImage(qrCodeImage, 360, 135, 205, 205);

    if(user.photo){
      const userImagePath = user.photo;
      const userImage = await loadImage(userImagePath);
      ctx.drawImage(userImage, 20, 100, 130, 130);
    } else {
      const userImage = await loadImage(tempphoto);
      ctx.drawImage(userImage, 20, 100, 130, 130);
    }

    const logoImage = await loadImage(logoPath);
    ctx.drawImage(logoImage, canvas.width - 150, 5, 100, 80);

    const idCardPath = 'id_card.png';
    const idCardStream = fs.createWriteStream(idCardPath);
    const idCardBuffer = canvas.toBuffer('image/png');
    idCardStream.write(idCardBuffer);
    idCardStream.end();

    return idCardPath;
  } catch (error) {
    console.error('Error generating ID card:', error);
    throw new Error('ID card generation failed');
  }
};

function roundRect(ctx, x, y, width, height, radius, fill) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
}

/* User Registration */
router.post('/register', async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      userType: req.body.userType,
      userFullName: req.body.userFullName,
      admissionId: req.body.admissionId,
      employeeId: req.body.employeeId,
      dob: req.body.dob,
      gender: req.body.gender,
      mobileNumber: req.body.mobileNumber,
      email: req.body.email,
      password: hashedPass,
      isAdmin: req.body.isAdmin,
      photo: req.body.photo, 
    });

    /* Save User and Return */
    const user = await newUser.save();
    res.status(201).json(user); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'User registration failed' });
  }
});

/* User Login */
router.post('/signin', async (req, res) => {
  try {
    const user = req.body.admissionId
      ? await User.findOne({ admissionId: req.body.admissionId })
      : await User.findOne({ employeeId: req.body.employeeId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPass = await bcrypt.compare(req.body.password, user.password);

    if (!validPass) {
      return res.status(401).json({ error: 'Wrong Password' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;


