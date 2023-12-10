const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

const AWS_ACCESS_KEY_ID = "AKIAT2VAHPALXN7ZJ4P2";
const AWS_SECRET_ACCESS_KEY = "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";
const AWS_REGION = "eu-north-1";
const AWS_BUCKET_NAME = "ika-upload-image";

const uploadImageAndSetLogo = async function (req, res) {

    const adminFromToken = jwt.verify(req.body.token.replace("Bearer ", ""), "1234");
    const admin = await Admin.findById(adminFromToken.adminId)

    //check if logo image doesn't exist and logo is not uploaded
    if (!req.file && !admin.logoImage?.location) {
        return res.status(400).json({
            status: {
                success: false,
                code: 400,
                message: "upload image for logo please",
            },
        });
    }

    if (req.file){
        try {
            admin.logoImage = await uploadImage(req.file)
            await admin.save()
        } catch {
            return res.status(400).json({
                status: {
                    success: false,
                    code: 400,
                    message: "Can't upload the image to the server",
                },
            });
        }
    }
};

async function uploadImage(image) {
    try {
        AWS.config.update({
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
            region: AWS_REGION
        });
        const s3 = new AWS.S3();
        const key = `logo/${Date.now()}-${image.originalname}`;
        const params = {
            Bucket: AWS_BUCKET_NAME,
            Key: key,
            Body: image.buffer,
            ContentType: image.mimetype
        };
        const uploadResult = await s3.upload(params).promise();
        console.log('end uploading')
        return {
            message: "File uploaded successfully.",
            location: uploadResult.Location,
            key: key
        };
    } catch (error) {
        console.error("Error uploading file:", error);
        return error;
    }
}



module.exports = uploadImageAndSetLogo;


