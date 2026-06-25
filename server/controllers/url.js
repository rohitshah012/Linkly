const { URL } = require("../models/url");
const { nanoid } = require("nanoid");
const { URL: NodeURL } = require("url");

function getBaseUrl(req) {
    return (process.env.APP_BASE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/+$/, "");
}

async function renderIndexWithError(req, res, status, error) {
    const urls = await URL.find({ Createdby: req.user._id }).sort({ createdAt: -1 });
    return res.status(status).render("index", {
        error,
        urls,
        user: req.user,
        baseUrl: getBaseUrl(req),
    });
}

async function handleGenerateNewShortURL(req, res) {
    const rawUrl = req.body.url?.trim();

    if (!rawUrl) {
        return renderIndexWithError(req, res, 400, "A destination URL is required.");
    }

    try {
        const destination = new NodeURL(rawUrl);
        if (!["http:", "https:"].includes(destination.protocol)) {
            throw new Error("Unsupported URL protocol");
        }

        const shortId = nanoid(8);

        await URL.create({
            Shortid: shortId,
            RedirectUrl: destination.toString(),
            VisitHistory: [],
            Createdby : req.user._id
        });

        return res.redirect(`/?created=${encodeURIComponent(shortId)}`);
    } catch (error) {
        if (error.code === "ERR_INVALID_URL" || error.message === "Unsupported URL protocol") {
            return renderIndexWithError(
                req,
                res,
                400,
                "Enter a valid URL beginning with http:// or https://."
            );
        }

        console.error("Create short URL error:", error);
        return res.status(500).send("Failed to create the short URL.");
    }
}

async function handleShowUrlAnalytics(req, res) {
    const shortId = req.params.nanoid;

    try {
        const query = { Shortid: shortId };
        if (req.user.role !== "ADMIN") {
            query.Createdby = req.user._id;
        }

        const result = await URL.findOne(query);

        if (!result) {
            return res.status(404).json({ message: "Short URL not found." });
        }

        return res.json({
            totalClicks: result.VisitHistory.length,
            analytics: result.VisitHistory,
        });
    } catch (error) {
        console.error("URL analytics error:", error);
        return res.status(500).json({ message: "Failed to fetch analytics." });
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
                        timestamp: new Date(),
                    },
                },
            },
            { new: true }
        );

        if (!entry) {
            return res.status(404).send("Short URL not found.");
        }

        return res.redirect(entry.RedirectUrl);
    } catch (error) {
        console.error("Short URL redirect error:", error);
        return res.status(500).send("Failed to redirect.");
    }
}

async function handleShowAllShortUrl(req, res) {
    try {
        const query = req.user.role === "ADMIN" ? {} : { Createdby: req.user._id };
        const allShortUrls = await URL.find(query).sort({ createdAt: -1 });

        const urlList = allShortUrls.map(url => ({
            shortId: url.Shortid,
            redirectUrl: url.RedirectUrl,
            totalClicks: url.VisitHistory.length,
        }));

        return res.json(urlList);
    } catch (error) {
        console.error("List short URLs error:", error);
        return res.status(500).json({ message: "Failed to fetch short URLs." });
    }
}

async function handleDeleteShortURL(req, res) {
    const shortId = req.params.nanoid;

    try {
        const query = { Shortid: shortId };
        if (req.user.role !== "ADMIN") {
            query.Createdby = req.user._id;
        }

        const deletedUrl = await URL.findOneAndDelete(query);

        if (!deletedUrl) {
            return res.status(404).json({ message: "Short URL not found." });
        }

        return res.status(204).end();
    } catch (error) {
        console.error("Delete short URL error:", error);
        return res.status(500).json({ message: "Failed to delete short URL." });
    }
}

module.exports = {
    handleGenerateNewShortURL,
    handleShowUrlAnalytics,
    handleRedirectUrl,
    handleShowAllShortUrl,
    handleDeleteShortURL,
};
