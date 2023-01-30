const express = require("express")
const cheerio = require("cheerio")
const axios = require("axios")

const router = express.Router()

const nameSelector = "body > div.logged-out.env-production.page-responsive.page-profile > div.application-main > main > div.container-xl.px-3.px-md-4.px-lg-5 > div > div.Layout-sidebar > div > div.js-profile-editable-replace > div.clearfix.d-flex.d-md-block.flex-items-center.mb-4.mb-md-0 > div.vcard-names-container.float-left.js-profile-editable-names.col-12.py-3.js-sticky.js-user-profile-sticky-fields > h1 > span.p-name.vcard-fullname.d-block.overflow-hidden"
const idSelector = "body > div.logged-out.env-production.page-responsive.page-profile > div.application-main > main > div.container-xl.px-3.px-md-4.px-lg-5 > div > div.Layout-sidebar > div > div.js-profile-editable-replace > div.clearfix.d-flex.d-md-block.flex-items-center.mb-4.mb-md-0 > div.vcard-names-container.float-left.js-profile-editable-names.col-12.py-3.js-sticky.js-user-profile-sticky-fields > h1 > span.p-nickname.vcard-username.d-block"
const bioSelector = "body > div.logged-out.env-production.page-responsive.page-profile > div.application-main > main > div.container-xl.px-3.px-md-4.px-lg-5 > div > div.Layout-sidebar > div > div.js-profile-editable-replace > div.d-flex.flex-column > div.js-profile-editable-area.d-flex.flex-column.d-md-block > div.p-note.user-profile-bio.mb-3.js-user-profile-bio.f4 > div"
const detailSelector = "body > div.logged-out.env-production.page-responsive.page-profile > div.application-main > main > div.container-xl.px-3.px-md-4.px-lg-5 > div > div.Layout-sidebar > div > div.js-profile-editable-replace > div.d-flex.flex-column > div.js-profile-editable-area.d-flex.flex-column.d-md-block > ul"
const imageSelector = "body > div.logged-out.env-production.page-responsive.page-profile > div.application-main > main > div.container-xl.px-3.px-md-4.px-lg-5 > div > div.Layout-sidebar > div > div.js-profile-editable-replace > div.clearfix.d-flex.d-md-block.flex-items-center.mb-4.mb-md-0 > div.position-relative.d-inline-block.col-2.col-md-12.mr-3.mr-md-0.flex-shrink-0 > a > img"

router.get("/:userID" , async (req,res) => {
    let userInfo = {}
    const $ = cheerio.load((await axios.get(`https://github.com/${req.params.userID}`)).data)
        userInfo.name = $(nameSelector).text().replace("\n          " , "").replace("\n        ", ""),
        userInfo.id = $(idSelector).text().replace("\n          " , "").replace("\n\n        ",""),
        userInfo.bio = $(bioSelector).text()
        userInfo.image = $(imageSelector).attr("src")

    $(detailSelector).find("li").each((index,element) => {
        if($(element).attr("itemprop")==="worksFor"||$(element).attr("itemprop")==="homeLocation"){
            userInfo[$(element).attr("itemprop")] = $(element).find("span").text()
        }else if($(element).attr("itemprop")==="twitter" || $(element).attr("itemprop")==="url"){
            userInfo[$(element).attr("itemprop")] = $(element).find("a").text()
        }
    })
    // res.send(details)
    res.send(userInfo)
})

module.exports = router