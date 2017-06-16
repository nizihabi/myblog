'use strict'
let Post = require('../lib/mongo').Post;
let marked = require('marked');
let CommentModel = require('../models/comments');

Post.plugin('convert_to_html', {
    afterFind: (posts) => {
        return posts.map((post) => {
         
            if (post.content.length > 100) {
                post.content = post.content.slice(0, 100) + "...";
            }
            post.content = marked(post.content);
            return post;
        });
    },
    afterFindOne: (post) => {
        if (post) {
            post.content = marked(post.content);
        }
        return post;
    }
});

Post.plugin('addCommentsCount', {
    afterFind: (posts) => {
        
        return Promise.all(posts.map((post) => {
            return CommentModel.getCommentsCount(post._id)
            .then((commentsCount) => {
                
                post.commentsCount = commentsCount;
                return post;
            });
        }));
    },
    afterFindOne: (post) => {
        if (post) {
            return CommentModel.getCommentsCount(post._id).then((count) =>{
                post.commentsCount = count;
                return post;
            });
        }
        return post;
    }
});

exports.create = (post) => {
    return Post.create(post).exec();
};

exports.getPostById = (id) => {
    return Post
        .findOne({
            _id: id
        })
        .populate({
            path: 'author',
            model: 'User'
        })
        .addCreatedAt()
        .addCommentsCount()
        .convert_to_html()
        .exec();
};

exports.getPosts = (author) => {
    let query = {};
    if (author) {
        query.author = author;
    }
    return Post
        .find(query)
        .populate({
            path: 'author',
            model: 'User'
        })
        .sort({
            _id: -1
        })
        .addCreatedAt()
        .addCommentsCount()
        .convert_to_html()
        .exec()
};

exports.incPv = (postId) => {
    return Post
        .update({
            _id: postId
        }, {
            $inc: {
                pv: 1
            }
        })
        .exec();
};

exports.getRawPostById = (id) => {
    return Post.findOne({
        _id: id
    }).populate({
        path: 'author',
        model: 'User'
    }).exec()
};

exports.updatePostById = (postId, author, data) => {
    return Post.update({
        _id: postId,
        author: author
    }, {
        $set: data
    }).exec();
};

// 通过用户 id 和文章 id 删除一篇文章
exports.delPostById = (postId, author) => {
    return Post.remove({
            author: author,
            _id: postId
        })
        .exec()
        .then((res) => {
            // 文章删除后，再删除该文章下的所有留言
            if (res.result.ok && res.result.n > 0) {
                return CommentModel.delCommentsByPostId(postId);
            }
        });
}