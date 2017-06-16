"use strict"
const User = require("../lib/mongo").User;

exports.create = (new_user) => {
    return User.create(new_user).exec();
}

exports.getUserByName=(name)=>{
    return User.findOne({name:name}).addCreatedAt().exec();
}