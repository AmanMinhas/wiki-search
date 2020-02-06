(function() {
  /**
    Happy Path Steps :-
    1. Collect title and lang from form.
    2. Call page summary API using lang and title. GET `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${title}`
    3. Use response.dir to identify page layout direction.
    4. Use response.api_urls.metadata to make another GET Request.
    5. Get Table of Content from metadataResponse.toc.entries
  */

  const formEl = document.querySelector('#search-form');
  formEl.addEventListener('submit', function(e) {
      e.preventDefault();
      handleSearchSubmit();
  });

  function getFormValues() {
    const title = document.querySelector('#article-title').value;
    const language = document.querySelector('#search-language').value;

    return { title, language };
  }

  async function getRequest(path) {
    try {
      if (!path) throw new Error('Invalid Path');

      let headers = new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'amandeepSinghMinhas@gmail.com',
        'Api-User-Agent': 'amandeepSinghMinhas@gmail.com'
      });

      const response = await fetch(path, {
        method: 'GET',
        headers
      });
      const responseJson = await response.json();
      if (!response.ok) {
        const errMsg = responseJson.detail || 'Something went wrong!';
        throw new Error(errMsg);
      }
      return responseJson;
    } catch (err) {
      // handle error
      console.warn({ err });
      return false;
    }
  }

  async function getPageSummary(title, language) {
    if (!title || !language) return;
    const path = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${title}`;
    const summaryRes = await getRequest(path);
    return summaryRes;
  }

  async function getPageMetadata(path) {
    if (!path) return;
    const metadataRes = await getRequest(path);
    return metadataRes;
  }

  async function handleSearchSubmit() {
    // TODO
    const { title, language } = getFormValues();

    // Get Page Summary
    const pageSummary = await getPageSummary(title, language);
    console.log({ pageSummary });
    if (!pageSummary) return;

    // Fetch Metadata
    const metadataApiPath = pageSummary.api_urls.metadata;
    const pageMetadata = await getPageMetadata(metadataApiPath);
    console.log({ pageMetadata });
    if (!pageMetadata) return;
  }
})();
