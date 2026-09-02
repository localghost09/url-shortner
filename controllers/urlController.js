const Url = require("../models/Url");
const generateCode = require("../utils/generateCode");

const createShortUrl = async(req , resp)=>{
    try{
        const {originalUrl} = req.body;
        if(!originalUrl){
            return resp.status(400).json({
                message : "Original URL is required"
            });
        }

        try{
            new URL(originalUrl);
        }catch(error){
            return resp.status(400).json({
                message : "Valid Url is required"
            })
        }

        let shortCode;
        let existingUrl;

        do {
            shortCode = generateCode();
            existingUrl = await Url.findOne({
                shortCode
            });
        } while (existingUrl);

            const url = await Url.create({
            originalUrl,
            shortCode
        });
        resp.status(201).json({
            originalUrl: url.origialUrl,
            shortUrl: `http://localhost:5000/${url.shortCode}`
        });


    }catch(error){
        return resp.status(500).json({
            message : "Server error"
        })
    }
}

const redirectUrl = async(req,resp)=>{
    try{
        const {code} = req.params;
        const url = await Url.findOne({
            shortCode : code
        });

        if(!url){
            return resp.status(404).json({
                message : "Short URl is not found"
            });
        }

        resp.redirect(url.originalUrl);

    }catch(error){
        resp.status(500).json({
            message : "Server error"
        });
    }
};

module.exports = {createShortUrl, redirectUrl};