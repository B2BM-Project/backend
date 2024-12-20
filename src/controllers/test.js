const testApi = (req, res) => {
    return res.status(200).json({ message: "Hi wellcom to API" });
};

module.exports = {
    testApi
};
