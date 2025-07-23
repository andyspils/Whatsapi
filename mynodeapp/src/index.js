// BBC HYS
getCommentUrls();

// Get comment url's off home page

    getCommentUrls (
      {
            const url = "https://www.bbc.co.uk";
            if (url) {
               
                $.ajax({
                    url: url,
                    type: 'POST',
                    contentType: 'application/html; charset=UTF-8',                   
                })
                .done(function (data) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(data, 'text/html');
                    const commentLinks = doc.querySelectorAll('a[href*="/h2g2/"]');
                    
                    commentLinks.forEach(link => {
                        const href = link.getAttribute('href');
                        if (href) {
                            console.log(`Comment URL: ${href}`);
                        }
                    });
                }
            }
    });
