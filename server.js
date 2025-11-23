const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static('.'));

app.post('/run-bot', (req, res) => {
    const code = req.body.code;
    const filename = `bots/bot_${Date.now()}.js`;

    fs.writeFileSync(filename, code);

    // تشغيل البوت مؤقتًا باستخدام Node.js
    // يفترض أن كود البوت يعيد QR Code كـ Base64 عند الاتصال
    const botProcess = exec(`node ${filename}`);

    let qrData = '';

    botProcess.stdout.on('data', (data) => {
        // يجب على كود البوت طباعة QR على stdout في Base64
        if(data.includes('data:image/png;base64')) {
            qrData = data.trim();
            res.json({ qr: qrData });
        }
    });

    botProcess.stderr.on('data', (data) => {
        console.error('Error:', data.toString());
    });

    botProcess.on('exit', (code) => {
        console.log(`بوت انتهى برمز خروج ${code}`);
    });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
