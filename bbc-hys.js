const fs = require('fs');
const { text } = require('stream/consumers');
const getPage = require('./bbc-hys-page.js');


let ct = 0; let ix = 0; let fn = 0;
let urls = []; let finish = []; comments = [];
let pages = ["sport", "sport/football", "sport/cricket", "sport/formula1", "sport/rugby-union", "sport/tennis", "sport/athletics", "sport/golf", "sport/boxing", "news", "news/world", "news/business", "weather", "news/health", "news/science_and_environment", "news/technology", "news/entertainment_and_arts", "news/education", "news/uk_politics", "news/in_pictures", "news/video"];

// Function to fetch BBC HYS (Have Your Say) URLs from a given subPage
async function getBbcHys(subPage, fn) {

    const res = await
        fetch("https://www.bbc.co.uk/" + subPage, {
            "body": null,
            "method": "GET"
        });

    const htm = await res.text()

    const commArr = htm.matchAll("participate:comments");
    arr = Array.from(commArr);

    for (let index = 0; index < arr.length; index++) {
        let result = htm.substring(arr[index].index - 300, arr[index].index + 20);

        const strPos = result.matchAll("<a href=");
        arr2 = Array.from(strPos);

        for (let index2 = 0; index2 < arr2.length; index2++) {
            let urlTxt = result.substring(arr2[index2].index + 9, arr2[index2].index + 100);
            const qtPos = urlTxt.match("class")
            let url = urlTxt.substring(0, qtPos.index - 11);
            urls[ct] = url
            ct++;
        }
    }
    // Mark this page as finished
    finish[fn] = true;

    // Remove duplicates & sort URLs on last step
    var allTrue = finish.filter(x => x).length

    // if all pages have been processed, remove duplicates and sort URLs
    if (allTrue === pages.length) {
        urls = [...new Set(urls)];
        urls.sort();

        // Write URLs to a file in JSON format, include the title of the page of each url
        for (let i = 0; i < urls.length; i++) {
            const urlRes = await fetch("https://www.bbc.co.uk/" + urls[i], {
                "body": null,
                "method": "GET"
            });
            const urlHtm = await urlRes.text();

            // Extract the API key and forum ID from the URL
            regex = /comments\?apiKey=([^&]+)/;
            var apiKey = urlHtm.match(regex);
            regex = /forumId=([^&]+)/;
            var forumId = urlHtm.match(regex);

            // fetch from comments url to get nextToken
            const getNextToken = await fetch("https://www.bbc.co.uk/wc-data/container/comments?apiKey=" + apiKey[1] + "&env=live&forumId=" + forumId[1] + "&isFirstDataRequested=true", {
                "body": null,
                "method": "GET"
            });

            const nextTokenJson = await getNextToken.json();

            urls[i] = { url: urls[i], title: nextTokenJson.title, moderation: nextTokenJson.moderation.status, totalPostsCount: nextTokenJson.totalPostsCount, totalCommentsCount: nextTokenJson.totalCommentsCount, canLoadMore: nextTokenJson.canLoadMore, isClosed: nextTokenJson.isClosed, apiKey: apiKey[1], forumId: forumId[1], nextToken: nextTokenJson.nextToken, comments: nextTokenJson.comments  };
           
        }
        // clear down json file 
        fs.writeFileSync("bbc-hys.json", JSON.stringify([], null, 3), 'utf8');
        // Write the URLs to a JSON file
        fs.writeFileSync("bbc-hys.json", JSON.stringify(urls, null, 3), 'utf8');
        console.log("Ending BBC HYS URL extraction at " + new Date().toLocaleString());
      


  
}
return true
}

// Start the process, processing each page

console.log("Starting BBC HYS URL extraction at " + new Date().toLocaleString());
for (ix = 0; ix < pages.length; ix++) {
    getBbcHys(pages[ix], ix)
}



