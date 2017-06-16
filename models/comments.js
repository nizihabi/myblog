'use strict'
let marked = require('marked');
let Comment = require('../lib/mongo').Comment;

Comment.plugin('convert_to_html', {
    afterFind: (comments) => {
        return comments.map((comment) => {
            comment.content = marked(comment.content);
            return comment;
        });
    }

});

exports.create = (comment) => {
    return Comment.create(comment).exec();
};

exports.delCommentById = (commentId, author) => {
    return Comment.remove({
        author: author,
        _id: commentId
    }).exec();
};

exports.delCommentsByPostId = (postId) => {
    return Comment.remove({
        postId: postId
    }).exec();
};

exports.getCommentsByPostId = (postId) => {
    return Comment.find({
            postId: postId
        })
        .populate({
            path: 'author',
            model: 'User'
        })
        .sort({
            _id: 1
        })
        .addCreatedAt()
        .convert_to_html()
        .exec();
};

exports.getCommentsCount = (postId) => {
    return Comment.count({
        postId: postId
    }).exec();
};