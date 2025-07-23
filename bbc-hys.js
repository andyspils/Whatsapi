const fs = require('fs');
const { text } = require('stream/consumers');
let ct = 0; let ix = 0; let fn = 0;
let urls = [];  let finish = [];
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
        console.log("Total comment articles found: " + urls.length);
        console.log(urls)
        // Write URLs to a file in JSON format, include the title of the page of each url
        for (let i = 0; i < urls.length; i++) {         
            const urlRes = await fetch("https://www.bbc.co.uk/" + urls[i], {
                "body": null,
                "method": "GET"
            });
            const urlHtm = await urlRes.text();

            const titleMatch = urlHtm.match(/<title data-rh="true">(.*?)<\/title>/);

            let regex = /(\d+)\s+comments<\/span>/i;
            var totalComments = urlHtm.match(regex);

            regex = /comments\?apiKey=([^&]+)/;
            var apiKey = urlHtm.match(regex);

            regex = /forumId=([^&]+)/;
            var forumId = urlHtm.match(regex);
            urls[i] = { url: urls[i], title: titleMatch[1], comments: totalComments[1], apiKey: apiKey[1], forumId: forumId[1] };
        /*    if (titleMatch && titleMatch[1]) {
                urls[i] = { url: urls[i], title: titleMatch[1] };
            } else {
                urls[i] = { url: urls[i], title: "No Title Found" };
            }

             if (totalComments && totalComments[1]) {
                urls[i] = { url: urls[i], comments: totalComments[1] };
            } else {
                urls[i] = { url: urls[i], comments: "No Comment total Found" };
            }

            
             if (apiKey && apiKey[1]) {
                urls[i] = { url: urls[i], apiKey: apiKey[1] };
            } else {
                urls[i] = { url: urls[i], apiKey: "No API key Found" };
            }
            
             if (forumId && forumId[1]) {
                urls[i] = { url: urls[i], forumId: forumId[1] };
            } else {
                urls[i] = { url: urls[i], forumId: "No Forum ID Found" };
            }
                */
        } 
        // clear down json file 
        fs.writeFileSync("bbc-hys.json", JSON.stringify([], null, 3), 'utf8');
        // Write the URLs to a JSON file
        fs.writeFileSync("bbc-hys.json", JSON.stringify(urls, null, 3), 'utf8');
       }
    return true
}

// Start the process, processing each page
for (ix = 0; ix < pages.length; ix++) {
    getBbcHys(pages[ix], ix)
}



