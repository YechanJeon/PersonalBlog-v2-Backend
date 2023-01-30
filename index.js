const axios = require("axios")
const express = require("express")
const app = express()
const port = 3000
const cheerio = require("cheerio")
const cors = require("cors")

const profile = require("./router/profile")
const posts = require("./router/posts")
const post = require("./router/post")



app.use(cors())



const urls = {
    github : "",
    velogGQL : "",
    velog : "https://velog.io/",
}

app.use("/profile" , profile)
app.use("/posts" , posts)
app.use("/post",post)

app.get("/replies/:comment" , async (req,res) => {
    const {comment} = req.params
    const axios = require('axios');

const response = await axios.post(
    'https://v2cdn.velog.io/graphql',
    {
        'operationName': 'ReloadReplies',
        'variables': {
            'id': comment
        },
        'query': 'query ReloadReplies($id: ID!) {\
             comment(comment_id: $id) {\
                    replies {\
                      id\
                      user {\
                        id\
                        username\
                        profile {\
                          id\
                          thumbnail\
                          __typename\
                    }\
                     __typename\
                  }\
                   text\
                   replies_count\
                   created_at\
                   level\
                   deleted\
                   __typename\
                }\
                 __typename\
              }\
            }\
             '
    });
    res.send(response.data.data)
})



app.get("/tags/:user" , async (req,res) => {
    const {user} = req.params

const response = await axios.post(
    'https://v2cdn.velog.io/graphql',
    {
        'operationName': 'UserTags',
        'variables': {
            'username': user
        },
        'query': 'query UserTags($username: String) {  userTags(username: $username) {    posts_count tags {      id      name      description      posts_count      thumbnail      __typename    }    posts_count    __typename  }}'
    },
);

res.send(response.data)
})

app.get("/series/:user" , async(req,res) => {
    res.send((await axios.post(
        'https://v2cdn.velog.io/',
        {
            'query': 'query UserSeriesList($username: String!) { user(username: $username) { \
                   id    series_list { \
                          id      name      description      url_slug      thumbnail      updated_at\
                            posts_count      __typename    }    __typename      }}',
            'variables': {
                'username': req.params.user
            },
            'operationName': 'UserSeriesList'
        },

    )).data.data.user)
})

app.get("/series/:user/:series" , async (req,res) => {
    const {user} = req.params
    const {series} = req.params
    const response = (await axios.post(
        'https://v2cdn.velog.io/graphql',
        {
            'operationName': 'Series',
            'variables': {
                'username': user,
                'url_slug': series
            },
            'query': "query Series($username: String, $url_slug: String) {\
              series(username: $username, url_slug: $url_slug) {\
                name\
                series_posts {\
                  post {\
                    url_slug\
                  }\
                }\
              }\
            }\
            "
        },
    )).data
    const series_readmeUrl = response.data.series.series_posts[0].post.url_slug
    const series_description = (await axios.post(
        'https://v2cdn.velog.io/graphql',
        {
            'operationName': 'ReadPost',
            'variables': {
                'username': user,
                'url_slug': series_readmeUrl
            },
            'query': 'query ReadPost($username: String, $url_slug: String){\
                        post(username: $username, url_slug: $url_slug)\
                        { body }}'
        })).data.data.post.body
    response.data.series.description = series_description
    let color = series_readmeUrl.split("-")
    color = color[color.length-1]  
    response.data.series.color = `#${color}`
    


    res.send(response)
})







app.listen(port , () => {console.log("open")})


