const { URL } = require("../models/url");
const { nanoid } = require("nanoid");

async function handleGenerateNewShortURL(req, res) {
    const body = req.body;

    if (!body.url) {
        return res.status(400).json({ msg: "url is required" });
    }

    try {
        const shortId = nanoid(8);

        await URL.create({
            Shortid: shortId,
            RedirectUrl: body.url,
            VisitHistory: [],
            Createdby : req.user._id
        });

        const allurls = await URL.find({ Createdby: req.user._id });

        return res.render("home", { id: shortId, urls: allurls, user: req.user })
        // return res.status(201).json({ msg: `short url is created and Id is : ${shortId}` });
    } catch (error) {
        return res.status(500).json({ msg: "failed to create short url" });
    }
}

async function handleShowUrlAnalytics(req, res) {
    const shortId = req.params.nanoid;

    try {
        const Result = await URL.findOne({ Shortid: shortId });

        if (!Result) {
            return res.status(404).json({ msg: "short url not found in Database " });
        }

        return res.json({
            totalClicks: Result.VisitHistory.length,
            analytics: Result.VisitHistory,
        });
    } catch (error) {
        return res.status(500).json({ msg: "failed to fetch analytics" });
    }
}

async function handleRedirectUrl(req, res) {
    const shortId = req.params.nanoid;

    try {
        const entry = await URL.findOneAndUpdate(
            {
                Shortid: shortId,
            },
            {
                $push: {
                    VisitHistory: {
                        timestamp: new Date().toLocaleString(),
                    },
                },
            },
            { new: true }
        );

        if (!entry) {
            return res.status(404).json({ msg: "short url not found" });
        }

        return res.redirect(entry.RedirectUrl);
    } catch (error) {
        return res.status(500).json({ msg: "failed to redirect" });

    }
};

async function handleShowAllShortUrl(req, res) {
    try {
        const allShortUrls = await URL.find({});

        if (!allShortUrls || allShortUrls.length === 0) {
            return res.status(404).json({ msg: "no short urls found" });
        }

        const urlList = allShortUrls.map(url => ({
            shortId: url.Shortid,
            redirectUrl: url.RedirectUrl,
            totalClicks: url.VisitHistory.length,
        }));

        return res.json(urlList);
    } catch (error) {
        return res.status(500).json({ msg: "failed to fetch short urls" });
    }
}
module.exports = {
    handleGenerateNewShortURL,
    handleShowUrlAnalytics,
    handleRedirectUrl,
    handleShowAllShortUrl,
};
