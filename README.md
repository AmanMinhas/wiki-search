# wiki-search
Search Wikipedia

git clone git@github.com:AmanMinhas/wiki-search.git

Open index.html in browser

# Happy Path Steps :-
    1. Collect title and lang from form.
    2. Call page summary API using lang and title. GET `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${title}`
    3. Use response.dir to identify page layout direction.
    4. Use response.api_urls.metadata to make another GET Request.
    5. Get Table of Content from metadataResponse.toc.entries

