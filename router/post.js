const express = require("express")
const axios = require("axios")
const cheerio = require("cheerio")

const router = express.Router()

const postSelector = "#root > div:nth-child(2)>div:nth-child(4)"
const postSelectorOld = "#root > div:nth-child(2)>div:nth-child(5)"

const urls = {
    github : "",
    velogGQL : "",
    velog : "https://velog.io/",
}

router.get("/simple/:user/:post" , async(req,res) => {
    const {user} = req.params
    const {post} = req.params  
    // const {id} = req.query
    
let response = (await axios.post(
    'https://v2cdn.velog.io/graphql',
    {
        'operationName': 'ReadPost',
        'variables': {
            'username': user,
            'url_slug': post
        },
        'query': 'query ReadPost($username: String, $url_slug: String){\
                    post(username: $username, url_slug: $url_slug)\
                    { title released_at tags liked likes series  { name url_slug series_posts { post {url_slug}}} short_description}}'
    })).data;
    let color = response.data.post.series.series_posts[0].post.url_slug.split("-")
    response.data.post.series.color = `#${color[color.length-1]}`


    res.send(response)
})

router.get("/detail/:user/:post" , async(req,res) => {
    const {user} = req.params
    const {post} = req.params  
    // const {id} = req.query
    
let response = (await axios.post(
    'https://v2cdn.velog.io/graphql',
    {
        'operationName': 'ReadPost',
        'variables': {
            'username': user,
            'url_slug': post
        },
        'query': 'query ReadPost($username: String, $url_slug: String) {\
             post(username: $username, url_slug: $url_slug) {\
                 body id title released_at tags thumbnail comments_count liked likes comments { id user { username profile { id thumbnail } } text replies_count created_at } series { name url_slug series_posts { post {title url_slug }}} linked_posts { previous { title url_slug } next { title url_slug}}}}'
    })).data;

    let color = response.data.post.series.series_posts[0].post.url_slug.split("-")
    response.data.post.series.color = `#${color[color.length-1]}`

    const $ = cheerio.load((await axios.get(`${urls.velog}@${user}/${post}`)).data)
    if($(postSelector).text()!==""){
        response.data.post.content = ($(postSelector).html())
    }else{
        response.data.post.content = ($(postSelectorOld).html())
    }
    res.send(response.data.post)
})

module.exports = router