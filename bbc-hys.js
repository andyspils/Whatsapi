const fs = require('fs');
const { text } = require('stream/consumers');


let ct = 0; let ix = 0; let fn = 0;
let urls = []; let finish = []; comments = [];
// let pages = ["sport", "sport/football", "sport/cricket", "sport/formula1", "sport/rugby-union", "sport/tennis", "sport/athletics", "sport/golf", "sport/boxing", "news", "news/world", "news/business", "weather", "news/health", "news/science_and_environment", "news/technology", "news/entertainment_and_arts", "news/education", "news/uk_politics", "news/in_pictures", "news/video"];
let pages = ["sport", "sport/football"];

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

            let fullUrl = "https://www.bbc.co.uk/wc-data/container/comments?apiKey=" + apiKey[1] + "&env=live&forumId=" + forumId[1] + "&isFirstDataRequested=true";
            // fetch from comments url to get nextToken
            const getNextToken = await fetch(fullUrl, {
                "body": null,
                "method": "GET"
            });

            const nextTokenJson = await getNextToken.json();

            urls[i] = { url: urls[i], fullUrl: fullUrl, title: nextTokenJson.title, moderation: nextTokenJson.moderation.status, totalPostsCount: nextTokenJson.totalPostsCount, totalCommentsCount: nextTokenJson.totalCommentsCount, canLoadMore: nextTokenJson.canLoadMore, isClosed: nextTokenJson.isClosed, apiKey: apiKey[1], forumId: forumId[1], nextToken: encodeURI(nextTokenJson.nextToken), comments: nextTokenJson.comments };

        }
        // clear down json file 
        fs.writeFileSync("bbc-hys.json", JSON.stringify([], null, 3), 'utf8');
        // Write the URLs to a JSON file
        fs.writeFileSync("bbc-hys.json", JSON.stringify(urls, null, 3), 'utf8');
        console.log("Ending BBC HYS URL extraction at " + new Date().toLocaleString());

        // test
        getAllPages("/sport/cricket/articles/c1wpyq7qr2zo", true, "");
            
        

    }
    return true
}

// getAllPages for a comment section
async function getAllPages(page, first, data) {
//console.log(page);
    if (first === true) {
        data = JSON.parse(fs.readFileSync('bbc-hys.json', 'utf8'));
        result = data.find(data => data.url === page);
        apiKey = result.apiKey;
        forumId = result.forumId;   
        nextToken = result.nextToken;
    } else {
        nextUrl = "https://www.bbc.co.uk/wc-data/container/comments?apiKey=" + apiKey + "&env=live&forumId=" +forumId + "&isFirstDataRequested=true&isLeftAligned=false" + "&nextToken=" + encodeURIComponent(nextToken) + "&palette=standard&showViewCommentsButton=true&siteId=newscommentsmodule&siteTitle=BBC&sortOrder=HighestRated&urnForUAS=urn%3Abbc%3Aoptimo%3Aasset%3Ackgy7jx082ro&useMaxReadableWidth=true&webcoreCommentsEnabled=on&wrapWidth=full";
        // fetch from comments url to get nextToken
        console.log(nextUrl);
        data = await fetch(nextUrl, {
            "body": null,
            "method": "GET"
        });
       
        result = await data.json(); console.log(data);        
        //result = data.find(data => data.url === page);
        
    }

    if (result.canLoadMore === true) {
        console.log("load next:", encodeURIComponent(result.nextToken));
        getAllPages(page + "&nextToken=" + encodeURIComponent(result.nextToken), false, result, apiKey, forumId);
    } else {
        console.log("No match found.");
    }
}




// Start the process, processing each page

console.log("Starting BBC HYS URL extraction at " + new Date().toLocaleString());
for (ix = 0; ix < pages.length; ix++) {
    getBbcHys(pages[ix], ix)
}



