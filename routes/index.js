"use strict"

module.exports = (app) => {
    app.get("/", (req, res) => {
        res.redirect("/posts");
    });
    app.use("/signup", require("./signup"));
    app.use("/signin", require("./signin"));
    app.use("/signout", require("./signout"));
    app.use("/posts", require("./posts"));
}