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
  const errorEl = document.querySelector('#search-error');
  formEl.addEventListener('submit', function(e) {
      e.preventDefault();
      handleSearchSubmit();
  });

  function getFormValues() {
    const title = document.querySelector('#article-title').value;
    const language = document.querySelector('#search-language').value;

    return { title, language };
  }

  function validateForm() {
    const { title, language } = getFormValues();
    if (!title || !language) {
      return false;
    }
    return true;
  }

  function resetError() {
    if (errorEl) {
      errorEl.classList.add('hidden');
    }
  }

  function renderError(error) {
    if (error && errorEl) {
      errorEl.classList.remove('hidden');
      errorEl.innerHTML = `<p>${error}</p>`;
    }
  }

  function isMobileDevice() {
    return (typeof window.orientation !== 'undefined') || (navigator.userAgent.indexOf('IEMobile') !== -1);
  };

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
      renderError(err.message);
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
    resetError();
    if (!validateForm()) {
      return;
    }
    const { title, language } = getFormValues();

    // Get Page Summary
    const pageSummary = await getPageSummary(title, language);
    console.log({ pageSummary });
    if (!pageSummary) return;

    // Apply Direction
    const layoutDirection = pageSummary.dir;
    applyDirection(layoutDirection);

    // Fetch Metadata
    const metadataApiPath = pageSummary.api_urls.metadata;
    const pageMetadata = await getPageMetadata(metadataApiPath);
    console.log({ pageMetadata });
    if (!pageMetadata) return;

    // Render Table Of Content
    const device = isMobileDevice() ? 'mobile' : 'desktop';
    console.log({device});
    const wikiPage = pageSummary.content_urls[device].page;
    renderToc(pageMetadata.toc.entries, wikiPage);
  }

  function applyDirection(layoutDirection) {
    const dir = layoutDirection === 'rtl' ? layoutDirection : 'ltr';
    const contailerEl = document.querySelector('#container');
    if (contailerEl) {
      contailerEl.className = `direction-${dir}`;
    }
  }

  function renderToc(entries, wikiPage) {
    if (!Array.isArray(entries)) return;

    function getContent(parentNumber, level) {
      return entries
        .filter((item) => item.level === level && item.number.startsWith(parentNumber) && item.number !== parentNumber)
        .map((node) => {
          const subMenuExists = entries.some((item) => {
            return item.level > node.level && item.number.startsWith(node.number) && item.number !== node.number;
          });

          const subMenu = subMenuExists ? `
            <ul>
              ${getContent(node.number, node.level + 1)}
            </ul>
          ` : '';

          return `
            <li>
              <a target='_blank' href='${wikiPage}#${node.anchor}'>
                <span>${node.number}</span>
                ${node.html}
              </a>
              ${subMenu}
            </li>
          `
        })
        .join('');
    }

    const node = document.querySelector('#toc');
    node.innerHTML = `<ul>${getContent('', 1)}</ul>`;
  }
})();
