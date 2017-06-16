let config = require("config-lite")(__dirname);
let Mongolass = require("mongolass");
let mongolass = new Mongolass();
console.log(config.mongodb);
mongolass.connect(config.mongodb);

var moment = require('moment');
var objectIdToTimestamp = require('objectid-to-timestamp');

// 根据 id 生成创建时间 created_at
mongolass.plugin('addCreatedAt', {
    afterFind: (results) => {
        results.forEach((item) => {
            item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
        });
        return results;
    },
    afterFindOne: (result) => {
        if (result) {
            result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm');
        }
        return result;
    }
});

exports.User = mongolass.model('user', {
    name: {
        type: 'string'
    },
    password: {
        type: 'string'
    },
    avatar: {
        type: 'string'
    },
    gender: {
        type: 'string',
        enum: ['m', 'f', 'x']
    },
    bio: {
        type: 'string'
    }
});

exports.User.index({
    name: 1
}, {
    unique: true
}).exec(); // 根据用户名找到用户，用户名全局唯一

exports.Post = mongolass.model('post', {
    author: {
        type: Mongolass.Types.ObjectId
    },
    title: {
        type: 'string'
    },
    content: {
        type: 'string'
    },
    pv: {
        type: 'number'
    }
});

exports.Post.index({
    author: 1,
    _id: -1
}).exec();

exports.Comment = mongolass.model('comment', {
    author: {
        type: Mongolass.Types.ObjectId
    },
    content: {
        type: 'string'
    },
    postId: {
        type: Mongolass.Types.ObjectId
    }
});

exports.Comment.index({
    author: 1,
    _id: 1
}).exec();

exports.Comment.index({
    postId: 1,
    _id: 1
}).exec();