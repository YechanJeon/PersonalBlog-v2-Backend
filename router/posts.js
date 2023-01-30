const express = require("express")
const axios = require("axios")

const router = express.Router()

router.get("/search/:user" , async (req,res) => {
    const {user} = req.params
    const {keyword} = req.query
    const {offset} = req.query
    res.send((await axios.post(
        'https://v2cdn.velog.io/graphql',
        {
            'operationName': 'SearchPosts',
            'variables': {
                'keyword': keyword,
                'username': user,
                "offset" : offset ? offset : 0
            },
            'query': 'query SearchPosts($keyword: String!, $offset: Int, $username: String) {\n  searchPosts(keyword: $keyword, offset: $offset, username: $username) {\n    count\n    posts {\n      id\n      title\n      short_description\n      thumbnail\n      user {\n        id\n        username\n        profile {\n          id\n          thumbnail\n          __typename\n        }\n        __typename\n      }\n      url_slug\n      released_at\n      tags\n      is_private\n      comments_count\n      __typename\n    }\n    __typename\n  }\n}\n'
        }
    )).data)
})

router.get("/:user", async (req,res) => {
    const cursor = req.query.cursor
    const tag = req.query.tag

    res.send((await axios.post(
        'https://v2cdn.velog.io/graphql',
        {
            'operationName': 'Posts',
            'variables': {
                'username': req.params.user,
                'tag': tag ? tag : null,
                'cursor': cursor ? cursor : "",
            },
            'query': 'query Posts($cursor: ID, $username: String, $temp_only: Boolean, $tag: String, $limit: Int) {\
                  posts(cursor: $cursor, username: $username, temp_only: $temp_only, tag: $tag, limit: $limit) {\
                    url_slug released_at updated_at comments_count tags is_private likes __typename\n  }\n}\n'
        },
        {
            headers: {
                'content-type': 'application/json'
            }
        }
    )).data.data)
})

module.exports = router