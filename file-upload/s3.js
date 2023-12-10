const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS SDK
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});


const uploadToS3 = (file, folder) => {
    return new Promise((resolve, reject) => {
        const { originalname, path: filepath, mimetype } = file;
        const key = folder ? `${folder}/${uuidv4()}-${originalname}` : `${uuidv4()}-${originalname}`;

        // Set up S3 upload parameters
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: fs.readFileSync(path.join(__dirname, `../${filepath}`)),
            ContentType: mimetype
        };

        const s3 = new AWS.S3();

        // Upload the file to S3
        s3.upload(params, (err, data) => {
            if (err) {
                console.error('Error uploading file to S3:', err);
                reject(err);
            } else {
                console.log('File uploaded successfully. S3 location:', data.Location);
                // Delete the local file
                fs.unlink(path.join(__dirname, `../${filepath}`), (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('Error deleting local file:', unlinkErr);
                        reject(unlinkErr);
                    } else {
                        console.log('Local file deleted successfully');
                        resolve(data.Location);
                    }
                });
            }
        });
    });
};


module.exports = {
    uploadToS3
}